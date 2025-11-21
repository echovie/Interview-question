'use client'

import { memo, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button, Card, Tag, message } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import styles from './MarkdownViewer.module.css'

interface MarkdownViewerProps {
  content: string
  loading: boolean
  onHeadingChange: (headingId: string) => void
  onReachedEnd?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

function MarkdownViewer({
  content,
  loading,
  onHeadingChange,
  onReachedEnd,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasReachedBottomRef = useRef(false)
  const [copied, setCopied] = useState(false)

  // 生成标题ID的工具函数（与TableOfContents保持一致）
  const generateHeadingId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim()
  }

  useEffect(() => {
    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      // 为所有标题添加 id（处理重复标题）
      if (containerRef.current) {
        const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const idCountMap = new Map<string, number>()
        
        headings.forEach((heading) => {
          if (!heading.id) {
            const text = heading.textContent || ''
            const baseId = generateHeadingId(text)
            
            // 处理重复的标题ID，为重复的标题添加序号
            const count = idCountMap.get(baseId) || 0
            let id = baseId
            if (count > 0) {
              id = `${baseId}-${count}`
            }
            idCountMap.set(baseId, count + 1)
            
            heading.id = id
          }
        })
      }

      // 设置 Intersection Observer 来监听标题滚动
      if (containerRef.current) {
        const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
        
        if (observerRef.current) {
          observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
          (entries) => {
            // 找到所有可见的标题
            const visibleEntries = entries.filter(e => e.isIntersecting && e.target.id)
            
            if (visibleEntries.length > 0) {
              // 按位置排序，选择最接近顶部且在视口内的标题
              visibleEntries.sort((a, b) => {
                const aTop = a.boundingClientRect.top
                const bTop = b.boundingClientRect.top
                // 优先选择在视口上半部分的标题
                if (aTop < 150 && bTop >= 150) return -1
                if (aTop >= 150 && bTop < 150) return 1
                return aTop - bTop
              })
              
              const topEntry = visibleEntries[0]
              if (topEntry.target.id) {
                onHeadingChange(topEntry.target.id)
              }
            }
          },
          {
            root: containerRef.current,
            rootMargin: '-100px 0px -60% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1],
          }
        )

        headings.forEach((heading) => {
          if (heading.id) {
            observerRef.current?.observe(heading)
          }
        })
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [content, onHeadingChange])

  useEffect(() => {
    hasReachedBottomRef.current = false
  }, [content])

  useEffect(() => {
    if (!onReachedEnd) {
      return
    }
    const container = containerRef.current
    if (!container) {
      return
    }

    const handleScroll = () => {
      if (hasReachedBottomRef.current) return
      const { scrollTop, clientHeight, scrollHeight } = container
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        hasReachedBottomRef.current = true
        onReachedEnd()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [onReachedEnd, content])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      message.success('代码已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      message.error('复制失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>请从左侧选择知识点</div>
      </div>
    )
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            h1: ({ ...props }: any) => (
              <h1 className={styles.heading1} {...props} />
            ),
            h2: ({ ...props }: any) => (
              <h2 className={styles.heading2} {...props} />
            ),
            h3: ({ ...props }: any) => (
              <h3 className={styles.heading3} {...props} />
            ),
            h4: ({ ...props }: any) => (
              <h4 className={styles.heading4} {...props} />
            ),
            code: ({ className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match

              if (isInline) {
                return (
                  <code className={styles.inlineCode} {...props}>
                    {children}
                  </code>
                )
              }
              
              const language = match[1]
              const codeString = String(children).replace(/\n$/, '')
              
              return (
                <CodeBlock language={language} codeString={codeString} />
              )
            },
            pre: ({ children, ...props }: any) => {
              // pre 标签会被 code 组件内部处理，这里直接返回 children
              return <>{children}</>
            },
            img: ImageWithPreview
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className={styles.navigationBottom}>
        <Button  onClick={onPrev} disabled={!hasPrev}>
          上一页
        </Button>
        <div>
          <Button
            type="text"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制'}
          </Button>
        
          <Button
            type="primary"
            onClick={onNext}
            disabled={!hasNext}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}

// 代码块组件，包含语法高亮和复制功能
interface CodeBlockProps {
  language: string
  codeString: string
}

function CodeBlock({ language, codeString }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString)
      setCopied(true)
      message.success('代码已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      message.error('复制失败，请重试')
    }
  }

  // 语言名称映射（用于显示）
  const languageMap: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    sql: 'SQL',
    bash: 'Bash',
    shell: 'Shell',
    sh: 'Shell',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    md: 'Markdown',
    markdown: 'Markdown',
  }

  const displayLanguage = languageMap[language.toLowerCase()] || language.toUpperCase()

  return (
    <Card
      className={styles.codeBlockCard}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className={styles.codeBlockHeader}>
        <Tag color="processing" className={styles.codeBlockLanguage}>
          {displayLanguage}
        </Tag>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          className={styles.copyButton}
        >
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      <div ref={codeRef} className={styles.codeBlockContainer}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            borderRadius: '0 0 6px 6px',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
          PreTag="div"
          showLineNumbers={codeString.split('\n').length > 5}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#858585',
            userSelect: 'none',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </Card>
  )
}

// 使用组件
const ImageWithPreview = ({ src, alt, title }: any) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) return <div>Error loading image</div>;

  return (
    <>
      <img
        src={`/api/image-proxy?url=${src}`}
        alt={alt}
        title={title}
        onClick={() => setIsPreviewOpen(true)}
        onError={() => setHasError(true)}
        style={{
          cursor: 'zoom-in',
          maxWidth: '100%',
          borderRadius: '4px',
        }}
      />
      
      {isPreviewOpen && (
        <div className="preview-overlay" onClick={() => setIsPreviewOpen(false)}>
          <img src={`/api/image-proxy?url=${src}`} alt={alt} className="preview-image" />
        </div>
      )}
    </>
  );
};

export default memo(MarkdownViewer)