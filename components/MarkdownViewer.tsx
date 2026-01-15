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
import Image from 'next/image'

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

  setTimeout(() => {
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

          heading.setAttribute('data-heading-id', id)
        }
      })
    }

    // 设置 Intersection Observer
    if (containerRef.current) {
      const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // 使用 Map 存储所有标题的相交状态，避免只依赖 entries 增量更新导致的信息缺失
      const headingState = new Map();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 1. 更新所有被观察标题的状态
          entries.forEach((entry) => {
            headingState.set(entry.target, entry);
          });

          // 2. 找出当前所有在视口内的标题
          const visibleHeadings = Array.from(headingState.values())
            .filter(entry => entry.isIntersecting);

          if (visibleHeadings.length > 0) {
            // 3. 核心逻辑：找到距离“激活线”（比如距离顶部 100px 处）最近的标题
            // 我们寻找 boundingClientRect.top 最小但非负（或最接近设定阈值）的元素
            const closest = visibleHeadings.reduce((prev, curr) => {
              const prevTop = Math.abs(prev.boundingClientRect.top - 100);
              const currTop = Math.abs(curr.boundingClientRect.top - 100);
              return currTop < prevTop ? curr : prev;
            });

            const id = closest.target.getAttribute('data-heading-id');
            if (id) {
              onHeadingChange(id);
            }
          }
        },
        {
          // 建议 root 设为 null (视口)，或者明确的滚动容器
          root: null, 
          // rootMargin 顶部负值可以缩小“判定区域”，让激活更灵敏
          rootMargin: '-80px 0px -70% 0px',
          threshold: [0, 1],
        }
      );

      headings.forEach((heading) => {
        // 确保有 ID 且被观察
        if (heading.getAttribute('data-heading-id')) {
          observerRef.current?.observe(heading);
        }
      });
    }
  }, 500)

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
      <Image
        src={`/api/image-proxy?url=${src}`}
        alt={alt}
        title={title}
        onClick={() => setIsPreviewOpen(true)}
        onError={() => setHasError(true)}
        width={1000}
        height={1000}
        style={{
          cursor: 'zoom-in',
          maxWidth: '100%',
          borderRadius: '4px',
        }}
      />
      
      {isPreviewOpen && (
        <div className="preview-overlay" onClick={() => setIsPreviewOpen(false)}>
          <Image src={`/api/image-proxy?url=${src}`} alt={alt} className="preview-image" width={1000} height={1000}/>
        </div>
      )}
    </>
  );
};

export default memo(MarkdownViewer)