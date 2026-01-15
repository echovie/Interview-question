'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MarkdownViewer from '@/components/MarkdownViewer'
import TableOfContents from '@/components/TableOfContents'
import SearchModal from '@/components/SearchModal'

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
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const selectedTagKey = useMemo(() => {
    if (!selectedPointId) return ''
    const tag = tags.find(t => (t.pointList ?? []).some(point => String(point.tagPointId) === String(selectedPointId)))
    return tag ? `tag-${tag.id}` : ''
  }, [tags, selectedPointId])

  const handleReachedEnd = useCallback(() => {
    if (!selectedPointId) return
    if (readPointIds.has(String(selectedPointId))) {
      return
    }
    const next = new Set(readPointIds)
    next.add(String(selectedPointId))
    setReadPointIdsToLocal(next)
  }, [selectedPointId, readPointIds])

  const updateUrlWithPointId = useCallback(
    (pointId: string) => {
      if (searchParams.get('id') === pointId) {
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set('id', pointId)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const handleSelectPoint = useCallback(
    (pointId: string) => {
      setSelectedPointId(pointId)
      updateUrlWithPointId(pointId)
    },
    [updateUrlWithPointId]
  )

  useEffect(() => {
    if (!tags.length) return
    const allPointList = tags.flatMap(tag => tag.pointList ?? [])
    if (!allPointList.length) return

    const pointIdFromUrl = searchParams.get('id')
    const matchedPoint = pointIdFromUrl
      ? allPointList.find(point => String(point.tagPointId) === String(pointIdFromUrl))
      : null

    if (matchedPoint) {
      setSelectedPointId(String(matchedPoint.tagPointId))
      return
    }

    const fallbackId = String(allPointList[0].tagPointId)
    setSelectedPointId(fallbackId)
    if (pointIdFromUrl !== fallbackId) {
      updateUrlWithPointId(fallbackId)
    }
  }, [tags, searchParams, updateUrlWithPointId])

  const handlePrev = useCallback(() => {
    if (prevPointId) {
      handleSelectPoint(prevPointId)
    }
  }, [prevPointId, handleSelectPoint])

  const handleNext = useCallback(() => {
    if (nextPointId) {
      handleSelectPoint(nextPointId)
    }
  }, [nextPointId, handleSelectPoint])

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        const data = await response.json()
        if (data.code === 0) {
          setTags(data.data.list)
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

  // 在你的组件内部
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      // 检查是否按下 Ctrl+F (Windows/Linux) 或 Cmd+F (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        // 阻止浏览器默认的搜索框弹出
        event.preventDefault();
        
        // 触发你的自定义弹窗
        setSearchModalVisible(true);
      }
    };

    // 监听键盘按下事件
    window.addEventListener('keydown', handleKeyDown);

    // 组件卸载时移除监听，防止内存泄漏和逻辑干扰
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // 空数组确保只在挂载时运行一次

  // 获取当前选中的标签名称，用于面包屑
  const currentTagName = useMemo(() => {
    if (!selectedPointId) return '前端知识汇总'
    const tag = tags.find(t => (t.pointList ?? []).some(point => String(point.tagPointId) === String(selectedPointId)))
    return tag ? tag.tagName : '前端知识汇总'
  }, [tags, selectedPointId])

  // 处理搜索结果选择
  const handleSearchResultSelect = useCallback((result: { tagPointId: number; title: string }) => {
    if (result.tagPointId) {
      handleSelectPoint(String(result.tagPointId))
    }
  }, [handleSelectPoint])

  return (
      <div className="container">
      <Sidebar
        tags={tags as any[]}
        selectedPointId={selectedPointId}
        onSelectPoint={handleSelectPoint}
        defaultOpenKeys={selectedTagKey}
        title="知识点导航"
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
        onPrev={handlePrev}
        onNext={handleNext}
        />
      </div>
      <TableOfContents
        content={markdownContent || ''}
        activeHeadingId={activeHeadingId}
        setActiveHeadingId={setActiveHeadingId}
      />
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectResult={handleSearchResultSelect}
        tags={tags}
      />
    </div>
  )
}

