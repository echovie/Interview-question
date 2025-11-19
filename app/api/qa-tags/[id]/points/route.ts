import { NextResponse } from 'next/server'

const LIST_ENDPOINT = 'https://fe.ecool.fun/api/exercise/list'
const DEFAULT_VID = '9'
const DEFAULT_PAGE_SIZE = '2000'
const DEFAULT_EXERCISE_CATE = '0'
const DEFAULT_IGNORE_MASTER =  '1'
const DEFAULT_ORDER_BY = 'default'
const DEFAULT_ORDER = 'desc'
const REQUIRED_COOKIE ="csrfToken=MNDcwxJT6MMjATBkX66W70BG; Hm_lvt_dd94ee499774a75a66365f9ea9d0b8fd=1762414188,1763474635; HMACCOUNT=E08D7D7FD9DAA00B; utoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcktleSI6ImN1XzQ1OGNmMDk3LTZhM2UtNDk5Zi1hMTRlLTc4NTJjNjQ0NDNkMiIsInZpZCI6OSwiaWF0IjoxNzYzNDc0NjY4LCJleHAiOjE3NjQwNzk0Njh9.fMQK2Q-R8i7ZMp9Vv0YOiZbSr7ONOO6kYKBzgagEMQY; utoken.sig=U6YASexcdGYh3xXgExpt6sCZOZDuvBx1hJ-QBhW8EYI; Hm_lpvt_dd94ee499774a75a66365f9ea9d0b8fd=1763540662"

const BASE_HEADERS: Record<string, string> = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
  Connection: 'keep-alive',
  Referer: 'https://fe.ecool.fun/topic-list',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
}

type RemoteExercise = {
  exerciseKey?: string
  title?: string
  level?: number
  vipLimit?: number
}

function buildUrl(searchParams: Record<string, string | number | undefined>) {
  const url = new URL(LIST_ENDPOINT)
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

function normalizeExercises(list: RemoteExercise[], tagId: number) {
  return list
    .filter(item => item?.exerciseKey && item?.title)
    .map(item => ({
      tagPointId: item.exerciseKey as string,
      tagId,
      title: item.title as string,
      vipLimit: Number(item.vipLimit ?? 0),
      level: Number(item.level ?? 0),
    }))
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tagId = Number(params.id)

  if (Number.isNaN(tagId)) {
    return NextResponse.json({ code: 400, message: 'Invalid tag id' }, { status: 400 })
  }

  if (!REQUIRED_COOKIE) {
    return NextResponse.json(
      {
        code: 500,
        message: 'Missing EXERCISE_COOKIE environment variable. Please set it to a valid cookie string.',
      },
      { status: 500 }
    )
  }

  const search = new URL(request.url).searchParams

  const url = buildUrl({
    vid: search.get('vid') ?? DEFAULT_VID,
    tagId,
    exerciseCate: search.get('exerciseCate') ?? DEFAULT_EXERCISE_CATE,
    pageNum: search.get('pageNum') ?? '1',
    pageSize: search.get('pageSize') ?? DEFAULT_PAGE_SIZE,
    ignoreMaster: search.get('ignoreMaster') ?? DEFAULT_IGNORE_MASTER,
    difficulty: search.get('difficulty') ?? '',
    orderBy: search.get('orderBy') ?? DEFAULT_ORDER_BY,
    order: search.get('order') ?? DEFAULT_ORDER,
  })

  const headers = {
    ...BASE_HEADERS,
    Cookie: REQUIRED_COOKIE,
  }

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    return NextResponse.json(
      {
        code: response.status,
        message: `Upstream request failed (${response.status}).`,
        detail: body,
      },
      { status: response.status }
    )
  }

  const payload = await response.json()
  const list = payload?.data?.list ?? []
  const normalized = normalizeExercises(list, tagId)

  return NextResponse.json({
    code: 0,
    message: 'ok',
    data: {
      tagId,
      total: payload?.data?.filterTotalNum ?? payload?.data?.total ?? normalized.length,
      list: normalized,
    },
  })
}

