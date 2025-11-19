import detailData from '../../assets/detail.json'
import { NextResponse } from 'next/server'

const detailMap = detailData as Record<string, any>

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


