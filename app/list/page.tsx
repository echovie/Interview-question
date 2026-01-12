'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, Space, Radio, Tag as AntTag, Rate, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter } from 'next/navigation'

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
  const [questions, setQuestions] = useState<Question[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // 筛选条件
  const [exerciseCate, setExerciseCate] = useState<string>('0') // 题库范围
  const [tagId, setTagId] = useState<string>('') // 题目标签
  const [orderBy, setOrderBy] = useState<string>('default') // 排序字段
  const [order, setOrder] = useState<string>('desc') // 排序方向
  const [difficulty, setDifficulty] = useState<string>('') // 题目难度

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

  const handleRowClick = (record: Question) => {
    window.open(`/qa?id=${record.tagPointId}`)
  }

  const columns: ColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Question) => (
        <a
          onClick={(e) => {
            e.preventDefault()
            handleRowClick(record)
          }}
          style={{ cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
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
    setExerciseCate(e.target.value)
  }

  const handleTagChange = (e: any) => {
    setTagId(e.target.value)
  }

  const handleSortChange = (value: string) => {
    if (value === 'default') {
      setOrderBy('default')
      setOrder('desc')
    } else if (value === 'updateTime-asc') {
      setOrderBy('updateTime')
      setOrder('asc')
    } else if (value === 'updateTime-desc') {
      setOrderBy('updateTime')
      setOrder('desc')
    } else if (value === 'level-asc') {
      setOrderBy('level')
      setOrder('asc')
    } else if (value === 'level-desc') {
      setOrderBy('level')
      setOrder('desc')
    }
  }

  const handleDifficultyChange = (e: any) => {
    setDifficulty(e.target.value)
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
            total,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  )
}
