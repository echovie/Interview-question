'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, Space, Radio, Tag as AntTag, Rate, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CheckCircleOutlined } from '@ant-design/icons'

interface Question {
  tagPointId: string
  tagId: number | null
  title: string
  vipLimit: number
  level: number
}

interface Tag {
  id: number
  tagName: string
  exerciseCount: number
}

export default function QuestionListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [viewedQuestionIds, setViewedQuestionIds] = useState<Set<string>>(new Set())

  // 从URL参数读取筛选条件
  const exerciseCate = searchParams.get('exerciseCate') || '0'
  const tagId = searchParams.get('tagId') || ''
  const orderBy = searchParams.get('orderBy') || 'default'
  const order = searchParams.get('order') || 'desc'
  const difficulty = searchParams.get('difficulty') || ''
  const currentPage = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10

  // 从本地存储加载已看过的题目
  const loadViewedQuestionIds = useCallback(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('viewedQuestionIds')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setViewedQuestionIds(new Set(parsed.map(String)))
      }
    } catch (error) {
      console.error('Failed to parse viewedQuestionIds from localStorage:', error)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadViewedQuestionIds()
  }, [loadViewedQuestionIds])

  // 监听窗口焦点事件，当用户从详情页返回时重新加载已读状态
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      loadViewedQuestionIds()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadViewedQuestionIds])

  // 监听 storage 事件（当其他标签页修改 localStorage 时）
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viewedQuestionIds') {
        loadViewedQuestionIds()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadViewedQuestionIds])

  // 更新URL参数
  const updateUrlParams = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        params.delete(key)
      } else {
        // 空字符串也是有效值（表示"全部"），需要保留
        params.set(key, String(value))
      }
    })
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/qa-tags')
        const data = await response.json()
        if (data.code === 0) {
          setTags(data.data.list || [])
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  // 加载题目列表
  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        exerciseCate,
        tagId,
        orderBy,
        order,
        difficulty,
      })
      const response = await fetch(`/api/exercises/list?${params.toString()}`)
      const data = await response.json()
      if (data.code === 0) {
        setQuestions(data.data.list || [])
        setTotal(data.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }, [exerciseCate, tagId, orderBy, order, difficulty])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // 构建标签选项，包含全部选项
  // 根据 list-task.md 中的标签ID映射
  const tagOptions = useMemo(() => {
    const tagIdOrder = ['', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '23', '24', '26', '27', '28', '29', '30', '31', '32', '74', '75', '77']
    const tagMap = new Map(tags.map(tag => [String(tag.id), tag]))
    
    const result: Array<{ id: string; tagName: string; exerciseCount: number }> = []
    
    // 添加全部选项
    result.push({ id: '', tagName: '全部', exerciseCount: total })
    
    // 按照指定顺序添加标签
    tagIdOrder.forEach(tagIdStr => {
      if (tagIdStr === '') return // 跳过全部，已添加
      const tag = tagMap.get(tagIdStr)
      if (tag) {
        result.push({ id: tagIdStr, tagName: tag.tagName, exerciseCount: tag.exerciseCount })
      }
    })
    
    return result
  }, [tags, total])

  const handleRowClick = useCallback((record: Question) => {
    // 只打开新窗口，不在这里标记为已读
    // 已读标记应该在详情页滚动到底部时才进行
    window.open(`/qa?id=${record.tagPointId}`)
  }, [])

  const columns: ColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Question) => {
        const isViewed = viewedQuestionIds.has(String(record.tagPointId))
        return (
          <Space>
            {isViewed && <CheckCircleOutlined style={{ color: '#999', fontSize: '16px' }} />}
            <a
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation() // 阻止事件冒泡，避免触发表格行的点击事件
                handleRowClick(record)
              }}
              style={{ 
                cursor: 'pointer',
                color: isViewed ? '#999' : undefined,
                textDecoration: isViewed ? 'none' : undefined,
              }}
            >
              {text}
            </a>
          </Space>
        )
      },
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
      width: 150,
      render: (level: number) => <Rate disabled value={level} count={5} />,
    },
    {
      title: '类型',
      key: 'type',
      width: 100,
      render: () => <AntTag>问答题</AntTag>,
    },
  ]

  const handleExerciseCateChange = (e: any) => {
    updateUrlParams({
      exerciseCate: e.target.value,
      page: 1, // 切换筛选条件时重置到第一页
    })
  }

  const handleTagChange = (e: any) => {
    updateUrlParams({
      tagId: e.target.value,
      page: 1, // 切换筛选条件时重置到第一页
    })
  }

  const handleSortChange = (value: string) => {
    const updates: Record<string, string | number> = {}
    
    if (value === 'default') {
      updates.orderBy = 'default'
      updates.order = 'desc'
    } else if (value === 'updateTime-asc') {
      updates.orderBy = 'updateTime'
      updates.order = 'asc'
    } else if (value === 'updateTime-desc') {
      updates.orderBy = 'updateTime'
      updates.order = 'desc'
    } else if (value === 'level-asc') {
      updates.orderBy = 'level'
      updates.order = 'asc'
    } else if (value === 'level-desc') {
      updates.orderBy = 'level'
      updates.order = 'desc'
    }
    
    updateUrlParams(updates)
  }

  const handleDifficultyChange = (e: any) => {
    updateUrlParams({
      difficulty: e.target.value,
      page: 1, // 切换筛选条件时重置到第一页
    })
  }

  const handlePageChange = (page: number, size?: number) => {
    if (size && size !== pageSize) {
      updateUrlParams({
        page: 1, // 改变每页条数时重置到第一页
        pageSize: size,
      })
    } else {
      updateUrlParams({
        page: page,
      })
    }
  }

  const sortValue = useMemo(() => {
    if (orderBy === 'default') return 'default'
    return `${orderBy}-${order}`
  }, [orderBy, order])

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>题目列表</h1>

      {/* 筛选条件区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 题库范围 */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>题库范围：</div>
            <Radio.Group value={exerciseCate} onChange={handleExerciseCateChange}>
              <Radio.Button value="0">全部题库</Radio.Button>
              <Radio.Button value="1">会员题库</Radio.Button>
              <Radio.Button value="2">免费题库</Radio.Button>
            </Radio.Group>
          </div>

          {/* 题目标签 */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>题目标签：</div>
            <Space wrap>
              <Radio.Group value={tagId} onChange={handleTagChange}>
                {tagOptions.map((tag) => (
                  <Radio.Button key={tag.id} value={tag.id} style={{ marginTop: 8 }}>
                    {tag.tagName}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Space>
          </div>

          {/* 排序方式 */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>排序方式：</div>
            <Radio.Group value={sortValue} onChange={(e) => handleSortChange(e.target.value)}>
              <Radio.Button value="default">默认排序</Radio.Button>
              <Radio.Button value="updateTime-desc">更新时间降序</Radio.Button>
              <Radio.Button value="updateTime-asc">更新时间升序</Radio.Button>
              <Radio.Button value="level-desc">难度降序</Radio.Button>
              <Radio.Button value="level-asc">难度升序</Radio.Button>
            </Radio.Group>
          </div>

          {/* 题目难度 */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>题目难度：</div>
            <Radio.Group value={difficulty} onChange={handleDifficultyChange}>
              <Radio.Button value="">全部</Radio.Button>
              <Radio.Button value="beginner">初级</Radio.Button>
              <Radio.Button value="intermediate">中级</Radio.Button>
              <Radio.Button value="advanced">高级</Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </Card>

      {/* 题目列表表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={questions}
          loading={loading}
          rowKey="tagPointId"
          size="small"
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
        />
      </Card>
    </div>
  )
}
