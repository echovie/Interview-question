import fs from 'node:fs/promises';
import path from 'node:path';

// TODO: 需要从环境变量中获取
// const VID = process.env.NEXT_PUBLIC_VID;
// const COOKIE = process.env.NEXT_PUBLIC_COOKIE;
const VID =9
const COOKIE ="csrfToken=MNDcwxJT6MMjATBkX66W70BG; Hm_lvt_dd94ee499774a75a66365f9ea9d0b8fd=1762414188,1763474635; HMACCOUNT=E08D7D7FD9DAA00B; utoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcktleSI6ImN1XzQ1OGNmMDk3LTZhM2UtNDk5Zi1hMTRlLTc4NTJjNjQ0NDNkMiIsInZpZCI6OSwiaWF0IjoxNzYzNDc0NjY4LCJleHAiOjE3NjQwNzk0Njh9.fMQK2Q-R8i7ZMp9Vv0YOiZbSr7ONOO6kYKBzgagEMQY; utoken.sig=U6YASexcdGYh3xXgExpt6sCZOZDuvBx1hJ-QBhW8EYI; Hm_lpvt_dd94ee499774a75a66365f9ea9d0b8fd=1763540662"
const PAGE_SIZE = 10000;
const CONCURRENCY = 10;

const LIST_ENDPOINT = 'https://fe.ecool.fun/api/exercise/list';
const DETAIL_ENDPOINT = 'https://fe.ecool.fun/api/exercise/practice/detail';

const DETAIL_OUTPUT = path.resolve(process.cwd(), 'app/api/assets/qa-detail.json');

if (!COOKIE) {
  console.error(
    'Missing cookie. Provide the EXERCISE_COOKIE environment variable (copy the cookie string from the curl example).'
  );
  process.exit(1);
}

const baseHeaders = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
  Connection: 'keep-alive',
  Referer: 'https://fe.ecool.fun/topic',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  Cookie: COOKIE,
};

function buildUrl(origin, searchParams) {
  const url = new URL(origin);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function fetchExercisePage(pageNum) {
  const url = buildUrl(LIST_ENDPOINT, {
    vid: VID,
    tagId: '',
    exerciseCate: '0',
    ignoreMaster: '1',
    difficulty: '',
    orderBy: 'default',
    order: 'desc',
    pageNum,
    pageSize: PAGE_SIZE,
  });

  const response = await fetch(url, { headers: baseHeaders });
  if (!response.ok) {
    throw new Error(`Failed to fetch list page ${pageNum} (${response.status})`);
  }

  return response.json();
}

async function fetchExerciseList() {
  let pageNum = 1;
  const map = new Map();
  let total = Infinity;
  let lastPayload = null;

  while ((pageNum - 1) * PAGE_SIZE < total) {
    const payload = await fetchExercisePage(pageNum);
    lastPayload = payload;
    const list = payload?.data?.list ?? [];
    total = payload?.data?.filterTotalNum ?? payload?.data?.total ?? list.length;

    list.forEach((item) => {
      if (item?.exerciseKey) {
        map.set(item.exerciseKey, item);
      }
    });

    if (!list.length) {
      break;
    }

    pageNum += 1;
  }

  if (!map.size) {
    throw new Error('No exerciseKey values were returned from the list endpoint.');
  }

  const list = Array.from(map.values());
  if (lastPayload?.data) {
    lastPayload.data.list = list;
    lastPayload.data.total = list.length;
    lastPayload.data.filterTotalNum = lastPayload.data.filterTotalNum ?? list.length;
  } else {
    lastPayload = {
      code: 0,
      message: 'ok',
      data: { list, total: list.length, filterTotalNum: list.length },
    };
  }

  return list;
}

async function fetchExerciseDetail(exerciseKey) {
  const url = buildUrl(DETAIL_ENDPOINT, {
    vid: VID,
    difficulty: '',
    exerciseCate: '0',
    ignoreMaster: '1',
    order: 'desc',
    orderBy: 'default',
    tagId: '0',
    exerciseKey,
  });

  const response = await fetch(url, { headers: baseHeaders });
  if (!response.ok) {
    throw new Error(`Failed to fetch detail for ${exerciseKey} (${response.status})`);
  }

  const payload = await response.json();
  const detail =
    payload?.data?.detail ??
    payload?.data ??
    payload?.detail ??
    payload?.exercise ??
    null;

  if (!detail) {
    throw new Error('Missing detail field in response payload');
  }

  return detail;
}

async function fetchAllDetails(list) {
  const results = {};
  const failures = [];

  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const chunk = list.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map((item) => fetchExerciseDetail(item.exerciseKey))
    );

    settled.forEach((entry, index) => {
      const exerciseKey = chunk[index].exerciseKey;
      if (entry.status === 'fulfilled') {
        const detail = entry.value;
        const key = detail?.exerciseKey ?? exerciseKey;
        results[key] = detail;
        process.stdout.write('.');
      } else {
        failures.push({ exerciseKey, reason: entry.reason });
        process.stdout.write('x');
      }
    });
  }

  process.stdout.write('\n');
  return { results, failures };
}

async function main() {
  console.log('Fetching exercise list…');
  const exerciseList = await fetchExerciseList();
  console.log(`Retrieved ${exerciseList.length} exercise metadata records.`);

  console.log('Fetching exercise details…');
  const { results, failures } = await fetchAllDetails(exerciseList);

  await fs.writeFile(DETAIL_OUTPUT, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved ${Object.keys(results).length} exercise details to ${DETAIL_OUTPUT}`);

  if (failures.length) {
    console.error(`Failed to fetch ${failures.length} exercise details:`);
    failures.forEach(({ exerciseKey, reason }) => {
      console.error(`- ${exerciseKey}: ${reason?.message ?? reason}`);
    });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

