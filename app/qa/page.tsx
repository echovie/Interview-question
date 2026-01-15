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

  // 当滚动到底部时，标记为已读
  const handleReachedEnd = () => {
    if (!pointId || typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem('viewedQuestionIds')
      const viewedIds = stored ? JSON.parse(stored) : []
      const viewedSet = new Set(viewedIds.map(String))
      
      if (!viewedSet.has(String(pointId))) {
        viewedSet.add(String(pointId))
        window.localStorage.setItem('viewedQuestionIds', JSON.stringify(Array.from(viewedSet)))
      }
    } catch (error) {
      console.error('Failed to save viewed question to localStorage:', error)
    }
  }

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
          onReachedEnd={handleReachedEnd}
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

