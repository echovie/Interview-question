'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import MarkdownViewer from '@/components/MarkdownViewer'
import TableOfContents from '@/components/TableOfContents'
import { Tag } from 'antd'

interface Point {
  tagPointId: string
  tagId: number
  title: string
  vipLimit: number
  level: number
}

interface Tag {
  id: number
  tagName: string
  pointCount: number
  pointList?: Point[]
  isLoading?: boolean
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
    return flatPoints.findIndex(point => point.tagPointId === selectedPointId)
  }, [flatPoints, selectedPointId])

  const prevPointId = currentIndex > 0 ? flatPoints[currentIndex - 1].tagPointId : null
  const nextPointId =
    currentIndex >= 0 && currentIndex < flatPoints.length - 1
      ? flatPoints[currentIndex + 1].tagPointId
      : null


  const loadTagPoints = useCallback(
    async (tagId: number, options: { autoSelectFirst?: boolean } = {}) => {
      let shouldFetch = true
      let existingPoints: Point[] | undefined

      setTags(prev => {
        const target = prev.find(tag => tag.id === tagId)
        if (!target) {
          shouldFetch = false
          return prev
        }
        if (target.pointList && target.pointList.length > 0) {
          shouldFetch = false
          existingPoints = target.pointList
          return prev
        }
        return prev.map(tag =>
          tag.id === tagId ? { ...tag, isLoading: true, pointList: tag.pointList ?? [] } : tag
        )
      })

      if (!shouldFetch) {
        if (options.autoSelectFirst && existingPoints?.length) {
          setSelectedPointId(existingPoints[0].tagPointId)
        }
        return
      }

      try {
        const response = await fetch(`/api/qa-tags/${tagId}/points`)
        const data = await response.json()
        if (data.code === 0) {
          const pointList: Point[] = data.data?.list ?? []
          setTags(prev =>
            prev.map(tag =>
              tag.id === tagId
                ? {
                    ...tag,
                    pointList: pointList,
                    pointCount: data.data?.total ?? tag.pointCount,
                    isLoading: false,
                  }
                : tag
            )
          )
          if (options.autoSelectFirst && pointList.length > 0) {
            setSelectedPointId(pointList[0].tagPointId)
          }
        } else {
          throw new Error(data.message ?? 'Failed to load points')
        }
      } catch (error) {
        console.error('Failed to load points:', error)
        setTags(prev =>
          prev.map(tag => (tag.id === tagId ? { ...tag, isLoading: false } : tag))
        )
      }
    },
    []
  )

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/qa-tags')
        const data = await response.json()
        if (data.code === 0) {
          const normalized: Tag[] = (data.data.list ?? []).map((tag: Tag) => ({
            ...tag,
            pointList: tag.pointList ?? [],
            isLoading: false,
          }))
          setTags(normalized)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  // 默认加载第一个标签的知识点
  useEffect(() => {
    if (tags.length > 0 && !selectedPointId) {
      loadTagPoints(tags[0].id, { autoSelectFirst: true })
    }
  }, [tags, selectedPointId, loadTagPoints])

  // 加载知识点详情
  useEffect(() => {
    if (selectedPointId) {
      setLoading(true)
      fetch(`/api/qa-detail/${selectedPointId}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 0) {
            const { title, explanation, testPoint } = data.data.detail || {};
            setMarkdownContent(`# ${title}\n\n${explanation}`)
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
        onExpandTag={loadTagPoints}
        defaultOpenKeys={`tag-${tags?.[0]?.id}`}
        title='问题导航'
        readPointIds={new Set()}
      />
      <div className="mainContent">
        <MarkdownViewer
          content={markdownContent || ''}
          loading={loading}
          onHeadingChange={setActiveHeadingId}
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

