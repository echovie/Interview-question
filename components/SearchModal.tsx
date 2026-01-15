'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input, Button } from 'antd'
import { SearchOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons'
import styles from './SearchModal.module.css'

interface Point {
  tagPointId: number
  tagId: number
  title: string
  vipLimit: number
  level: number
}

interface Tag {
  id: number
  tagName: string
  pointCount: number
  pointList: Point[]
}

interface SearchResult {
  tagPointId: number
  title: string
  description?: string
  tagName?: string
  tagId?: number
}

interface SearchModalProps {
  visible: boolean
  onClose: () => void
  onSelectResult?: (result: SearchResult) => void
  breadcrumbs?: string[]
  tags?: Tag[]
}

export default function SearchModal({
  visible,
  onClose,
  onSelectResult,
  breadcrumbs = ['倾墨', '前端知识汇总'],
  tags = []
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [recommendedResults, setRecommendedResults] = useState<SearchResult[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // 获取所有知识点，用于推荐和搜索
  const allPoints = useMemo(() => {
    return tags.flatMap(tag =>
      (tag.pointList ?? []).map(point => ({
        ...point,
        tagName: tag.tagName,
      }))
    )
  }, [tags])

  // 设置推荐结果（显示最近访问的或热门的知识点）
  useEffect(() => {
    if (visible && allPoints.length > 0) {
      // 显示前4个知识点作为推荐
      const recommended = allPoints.slice(0, 4).map(point => ({
        tagPointId: point.tagPointId,
        title: point.title,
        tagName: point.tagName,
        tagId: point.tagId,
      }))
      setRecommendedResults(recommended)
    }
  }, [visible, allPoints])

  // 搜索功能
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // 在实际项目中，这里应该调用搜索 API
      // 目前使用本地搜索
      const queryLower = query.toLowerCase().trim()
      const matched = allPoints
        .filter(point => 
          point.title.toLowerCase().includes(queryLower) ||
          point.tagName.toLowerCase().includes(queryLower)
        )
        .slice(0, 20) // 限制结果数量
        .map(point => ({
          tagPointId: point.tagPointId,
          title: point.title,
          tagName: point.tagName,
          tagId: point.tagId,
        }))

      // 模拟网络延迟
      setTimeout(() => {
        setSearchResults(matched)
        setLoading(false)
      }, 200)
    } catch (error) {
      console.error('Search failed:', error)
      setLoading(false)
    }
  }

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleResultClick = (result: SearchResult) => {
    onSelectResult?.(result)
    onClose()
  }

  const handleJump = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump()
    }
  }

  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 顶部导航栏 */}
        <div className={styles.header}>
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className={styles.separator}> / </span>}
                <span className={styles.breadcrumbItem}>{crumb}</span>
              </span>
            ))}
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className={styles.closeButton}
          />
        </div>

        {/* 搜索框 */}
        <div className={styles.searchBox}>
          <Input
            placeholder="高级搜索"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
            size="large"
          />
          <Button
            type="primary"
            onClick={handleJump}
            className={styles.jumpButton}
            loading={loading}
          >
            跳转
          </Button>
        </div>

        {/* 推荐结果 */}
        {!searchQuery && recommendedResults.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>推荐结果</h3>
            <div className={styles.resultsList}>
              {recommendedResults.map((result, index) => (
                <div
                  key={index}
                  className={styles.resultItem}
                  onClick={() => handleResultClick(result)}
                >
                  <FileTextOutlined className={styles.resultIcon} />
                  <div className={styles.resultContent}>
                    <div className={styles.resultTitle}>{result.title}</div>
                    {result.tagName && (
                      <div className={styles.resultTag}>{result.tagName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {searchQuery && (
          <div className={styles.section}>
            {loading ? (
              <div className={styles.loading}>搜索中...</div>
            ) : searchResults.length > 0 ? (
              <div className={styles.resultsList}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={styles.resultItem}
                    onClick={() => handleResultClick(result)}
                  >
                    <FileTextOutlined className={styles.resultIcon} />
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>{result.title}</div>
                      {result.tagName && (
                        <div className={styles.resultTag}>{result.tagName}</div>
                      )}
                      {result.description && (
                        <div className={styles.resultDescription}>{result.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>暂无搜索结果</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
