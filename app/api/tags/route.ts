import { NextResponse } from 'next/server'
import detailData from '../assets/menu.json'

const detailMap = detailData as Record<string, any>

// 模拟数据 - 从 task.md 中提取的标签数据

export async function GET() {
  return NextResponse.json(detailMap)
}
