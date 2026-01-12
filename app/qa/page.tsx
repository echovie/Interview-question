'use client'

import { useState, useEffect } from 'react'
import MarkdownViewer from '@/components/MarkdownViewer'
import TableOfContents from '@/components/TableOfContents'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')
  const searchParams = useSearchParams()

  // 从 URL 参数中获取 id
  const pointId = searchParams.get('id')

  // 根据 URL 中的 id 加载详情
  useEffect(() => {
    if (pointId) {
      setLoading(true)
      fetch(`/api/qa-detail/${pointId}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 0) {
            const { title, explanation, testPoint } = data.data.detail || {}
            setMarkdownContent(`# ${title}\n\n${explanation}`)
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch detail:', error)
          setLoading(false)
        })
    } else {
      setMarkdownContent('')
    }
  }, [pointId])

  return (
    <div className="container">
      <div className="mainContent">
        <MarkdownViewer
          content={markdownContent || ''}
          loading={loading}
          onHeadingChange={setActiveHeadingId}
          hasPrev={false}
          hasNext={false}
        />
      </div>
      <TableOfContents
        content={markdownContent || ''}
        activeHeadingId={activeHeadingId}
        setActiveHeadingId={setActiveHeadingId}
      />
    </div>
  )
}

