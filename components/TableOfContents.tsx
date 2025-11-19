'use client'

import { useEffect, useState } from 'react'
import styles from './TableOfContents.module.css'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  activeHeadingId: string
  setActiveHeadingId: (headingId: string) => void
}

export default function TableOfContents({
  content,
  activeHeadingId,
  setActiveHeadingId
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    if (!content) {
      setHeadings([])
      return
    }

    // 生成标题ID的工具函数（与MarkdownViewer保持一致）
    const generateHeadingId = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim()
    }

    // 使用正则表达式提取 Markdown 标题
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings: Heading[] = []
    const idCountMap = new Map<string, number>()
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const baseId = generateHeadingId(text)
      
      // 处理重复的标题ID，为重复的标题添加序号
      const count = idCountMap.get(baseId) || 0
      let id = baseId
      if (count > 0) {
        id = `${baseId}-${count}`
      }
      idCountMap.set(baseId, count + 1)

      extractedHeadings.push({
        id,
        text,
        level,
      })
    }

    setHeadings(extractedHeadings)
  }, [content])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    setActiveHeadingId(id)

    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="toc">
      <div className="header">
        <h3>目录</h3>
      </div>
      <div className="list">
        {headings.map((heading) => (
          <div
            key={heading.id}
            className={`${styles.item} ${
              activeHeadingId === heading.id ? styles.active : ''
            }`}
            style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
            onClick={() => scrollToHeading(heading.id)}
          >
            <span className={styles.text}>{heading.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

