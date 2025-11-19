import fs from 'node:fs/promises';
import path from 'node:path';

// TODO: 需要从环境变量中获取
// const VID = process.env.NEXT_PUBLIC_VID;
// const COOKIE = process.env.NEXT_PUBLIC_COOKIE;
const VID =9
const COOKIE ="csrfToken=MNDcwxJT6MMjATBkX66W70BG; Hm_lvt_dd94ee499774a75a66365f9ea9d0b8fd=1762414188,1763474635; HMACCOUNT=E08D7D7FD9DAA00B; utoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcktleSI6ImN1XzQ1OGNmMDk3LTZhM2UtNDk5Zi1hMTRlLTc4NTJjNjQ0NDNkMiIsInZpZCI6OSwiaWF0IjoxNzYzNDc0NjY4LCJleHAiOjE3NjQwNzk0Njh9.fMQK2Q-R8i7ZMp9Vv0YOiZbSr7ONOO6kYKBzgagEMQY; utoken.sig=U6YASexcdGYh3xXgExpt6sCZOZDuvBx1hJ-QBhW8EYI; Hm_lpvt_dd94ee499774a75a66365f9ea9d0b8fd=1763540662"

const OUTPUT_FILE = path.resolve(process.cwd(), 'app/api/assets/detail.json');
const MENU_FILE = path.resolve(process.cwd(), 'app/api/assets/menu.json');
const API_ORIGIN = 'https://fe.ecool.fun/api/tagPoint/pointDetail';
const TAG_LIST_API_ORIGIN = 'https://fe.ecool.fun/api/tagPoint/tagList';
const CONCURRENCY = 10;

if (!COOKIE) {
  console.error(
    'Missing TAGPOINT_COOKIE environment variable. Copy the cookie string from the curl example.'
  );
  process.exit(1);
}

const baseHeaders = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
  Connection: 'keep-alive',
  Referer: 'https://fe.ecool.fun/knowledge-learn',
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

async function fetchDetail(pointId) {
  const url = new URL(API_ORIGIN);
  url.searchParams.set('vid', VID);
  url.searchParams.set('pointId', String(pointId));

  const response = await fetch(url, {
    headers: baseHeaders,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const detail = payload?.data?.detail;

  if (!detail) {
    throw new Error('Missing detail field in response');
  }

  return detail;
}

async function fetchTagList() {
  const url = new URL(TAG_LIST_API_ORIGIN);
  url.searchParams.set('vid', VID);

  const response = await fetch(url, {
    headers: baseHeaders,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!payload?.data) {
    throw new Error('Missing data field in tag list response');
  }

  await fs.writeFile(MENU_FILE, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

async function loadTagPointIds() {
  const menu = await fetchTagList();
  const tagList = menu?.data?.list ?? [];

  const ids = new Set();
  tagList.forEach((tag) => {
    tag?.pointList?.forEach((point) => {
      if (typeof point?.tagPointId === 'number') {
        ids.add(point.tagPointId);
      }
    });
  });

  if (!ids.size) {
    throw new Error('No tagPointId values found in menu.json');
  }

  return Array.from(ids).sort((a, b) => a - b);
}

async function main() {
  const tagPointIds = await loadTagPointIds();
  const results = {};
  const failures = [];

  for (let i = 0; i < tagPointIds.length; i += CONCURRENCY) {
    const chunk = tagPointIds.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map(async (pointId) => {
        const detail = await fetchDetail(pointId);
        return { pointId, detail };
      })
    );

    settled.forEach((entry, idx) => {
      const pointId = chunk[idx];
      if (entry.status === 'fulfilled') {
        const detail = entry.value.detail;
        const key = detail?.id ?? pointId;
        results[key] = detail;
        process.stdout.write('.');
      } else {
        failures.push({ pointId, reason: entry.reason });
        process.stdout.write('x');
      }
    });
  }

  const sortedResult = Object.keys(results)
    .map((key) => Number(key))
    .sort((a, b) => a - b)
    .reduce((acc, key) => {
      acc[key] = results[key];
      return acc;
    }, {});

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(sortedResult, null, 2), 'utf8');
  process.stdout.write(`\nSaved ${Object.keys(results).length} records to ${OUTPUT_FILE}\n`);

  if (failures.length) {
    console.error(`Failed to fetch ${failures.length} ids:`);
    failures.forEach(({ pointId, reason }) => {
      console.error(`- ${pointId}: ${reason.message ?? reason}`);
    });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
