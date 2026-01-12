import type { Metadata } from 'next'
import 'antd/dist/reset.css'
import './globals.css'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '前端面试学习平台',
  description: '前端知识点学习与面试准备',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  )
}

