import { NextRequest } from 'next/server'

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')

  if (!urlParam) {
    return new Response('Missing url parameter', { status: 400 })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(urlParam)
  } catch (error) {
    return new Response('Invalid url parameter', { status: 400 })
  }

  if (!ALLOWED_PROTOCOLS.has(targetUrl.protocol)) {
    return new Response('Protocol not allowed', { status: 400 })
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding': 'identity',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        Referer: `${targetUrl.origin}/`,
      },
    })

    if (!upstream.ok) {
      return new Response('Upstream image request failed', {
        status: upstream.status,
      })
    }

    const arrayBuffer = await upstream.arrayBuffer()
    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') ?? 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=86400')
    headers.set('Access-Control-Allow-Origin', '*')

    return new Response(arrayBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Image proxy failed', error)
    return new Response('Failed to fetch image', { status: 502 })
  }
}

