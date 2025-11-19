'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MarkdownViewer from '@/components/MarkdownViewer'
import TableOfContents from '@/components/TableOfContents'
import { Button, Tag, message } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'

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
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')
  const [copied, setCopied] = useState(false)

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
            setSelectedPointId(firstPointId)
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      setCopied(true)
      message.success('代码已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      message.error('复制失败，请重试')
    }
  }

  return (
    <div className="container">
      <Sidebar
        tags={tags}
        selectedPointId={selectedPointId}
        onSelectPoint={setSelectedPointId}
      />
      <div className="mainContent">
        <div className="copyButton">
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
        >
          {copied ? '已复制' : '复制'}
        </Button>
        </div>
        <MarkdownViewer
          content={markdownContent || ''}
          loading={loading}
          onHeadingChange={setActiveHeadingId}
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

