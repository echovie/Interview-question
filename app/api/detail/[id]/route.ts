import detailData from './data.json'
import { NextResponse } from 'next/server'

type Detail = {
  id: number
  tagId: number
  title: string
  explanation: string
  [key: string]: unknown
}

const detailMap = detailData as Record<string, Detail>

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  const detail = detailMap[id]

  if (!detail) {
    return NextResponse.json(
      { code: 404, message: 'Not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    code: 0,
    message: 'ok',
    data: { detail },
  })
}


