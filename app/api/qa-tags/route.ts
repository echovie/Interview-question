import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

type RawTag = {
  id: number
  tagName: string
  exerciseCount?: number
}

type TagPoint = {
  tagPointId: string
  tagId: number
  title: string
  vipLimit: number
  level: number
}

type TagGroup = {
  id: number
  tagName: string
  createAt: string
  updateAt: string
  pointCount: number
  pointList: TagPoint[]
}

const EMPTY_DATE = ''

const QA_MENU_PATH = join(process.cwd(), 'app/api/assets/qa-menu.json')

const loadQaMenuData = (): RawTag[] => {
  try {
    const content = readFileSync(QA_MENU_PATH, 'utf-8')
    const parsed = JSON.parse(content) as { data?: { list?: RawTag[] } }
    return parsed.data?.list ?? []
  } catch (error) {
    console.error('[qa-tags] Failed to load qa-menu.json:', error)
    return []
  }
}

const normalizeMenuToTags = (list: RawTag[] = []): TagGroup[] => {
  return list
    .filter(item => item?.id && item?.tagName)
    .map(item => ({
      id: item.id,
      tagName: item.tagName.trim(),
      createAt: EMPTY_DATE,
      updateAt: EMPTY_DATE,
      pointCount: item.exerciseCount ?? 0,
      pointList: [],
    }))
}

export async function GET() {
  const list = loadQaMenuData()
  const tags = normalizeMenuToTags(list)

  return NextResponse.json({
    code: 0,
    message: 'ok',
    data: {
      list: tags,
    },
  })
}
