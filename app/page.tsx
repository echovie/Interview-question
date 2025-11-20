'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import MarkdownViewer from '@/components/MarkdownViewer'
import TableOfContents from '@/components/TableOfContents'
import { Tag } from 'antd'

interface Tag {
  id: number
  tagName: string
  pointCount: number
  pointList: Point[]
}

interface Point {
  tagPointId: number
  tagId: number
  title: string
  vipLimit: number
  level: number
}

interface Detail {
  id: number
  tagId: number
  title: string
  explanation: string
  testPoint: string
  vipLimit: number
  level: number
}

export default function Home() {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')
  const [readPointIds, setReadPointIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('readPointIds')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setReadPointIds(new Set(parsed.map(String)))
      }
    } catch (error) {
      console.error('Failed to parse readPointIds from localStorage:', error)
    }
  }, [])

  const setReadPointIdsToLocal = (pointIds: Set<string>) => {
    window.localStorage.setItem('readPointIds', JSON.stringify(Array.from(pointIds)))
    setReadPointIds(pointIds)
  }

  const flatPoints = useMemo(() => {
    return tags.flatMap(tag =>
      (tag.pointList ?? []).map(point => ({
        ...point,
        tagId: tag.id,
      }))
    )
  }, [tags])

  const currentIndex = useMemo(() => {
    if (!selectedPointId) return -1
    return flatPoints.findIndex(point => String(point.tagPointId) === String(selectedPointId))
  }, [flatPoints, selectedPointId])

  const prevPointId = currentIndex > 0 ? String(flatPoints[currentIndex - 1].tagPointId) : null
  const nextPointId =
    currentIndex >= 0 && currentIndex < flatPoints.length - 1
      ? String(flatPoints[currentIndex + 1].tagPointId)
      : null

  const handleReachedEnd = useCallback(() => {
    if (!selectedPointId) return
      if (readPointIds.has(String(selectedPointId))) {
        return readPointIds
      }
      const next = new Set(readPointIds)
      next.add(String(selectedPointId))

      setReadPointIdsToLocal(next)
  }, [selectedPointId])

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        const data = await response.json()
        if (data.code === 0) {
          setTags(data.data.list)
          // 默认选择第一个知识点
          if (data.data.list.length > 0 && data.data.list[0].pointList.length > 0) {
            const firstPointId = data.data.list[0].pointList[0].tagPointId
            setSelectedPointId(String(firstPointId))
          }
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  // 加载知识点详情
  useEffect(() => {
    if (selectedPointId) {
      setLoading(true)
      fetch(`/api/detail/${selectedPointId}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 0) {
            const { title, explanation, testPoint } = data.data.detail || {};
            setMarkdownContent(`# ${title}\n\n${explanation}\n\n# 常见考点\n\n${testPoint}`)
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch detail:', error)
          setLoading(false)
        })
    }
  }, [selectedPointId])



  return (
    <div className="container">
      <Sidebar
        tags={tags as any[]}
        selectedPointId={selectedPointId}
        onSelectPoint={setSelectedPointId}
        defaultOpenKeys={`tag-${tags?.[0]?.id}`}
        title='知识点导航'
        readPointIds={readPointIds}
      />
      <div className="mainContent">
        <div className="copyButton">
      
        </div>
        <MarkdownViewer
          content={markdownContent || ''}
          loading={loading}
          onHeadingChange={setActiveHeadingId}
          onReachedEnd={handleReachedEnd}
          hasPrev={Boolean(prevPointId)}
          hasNext={Boolean(nextPointId)}
          onPrev={() => prevPointId && setSelectedPointId(prevPointId)}
          onNext={() => nextPointId && setSelectedPointId(nextPointId)}
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

