'use client'

import { useState, useEffect } from 'react'
import { Menu, Layout, Badge, Spin } from 'antd'
import type { MenuProps } from 'antd'

const { Sider } = Layout

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
  pointList: Point[]
}

interface SidebarProps {
  tags: Tag[]
  selectedPointId: string | null
  onSelectPoint: (pointId: string) => void
  onExpandTag?: (tagId: number) => void
  defaultOpenKeys?: string
}

type MenuItem = Required<MenuProps>['items'][number]

export default function Sidebar({
  tags,
  selectedPointId,
  onSelectPoint,
  onExpandTag,
  defaultOpenKeys = '',
}: SidebarProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  useEffect(() => {
    if (defaultOpenKeys) {
      setOpenKeys([defaultOpenKeys])
    }
  }, [defaultOpenKeys])

  useEffect(() => {
    if (selectedPointId) {
      const tagWithSelectedPoint = selectedKeys.some(key => key === `point-${selectedPointId}`)
      if (!tagWithSelectedPoint) {
        setSelectedKeys([`point-${selectedPointId}`])
      }
    }
  }, [selectedPointId])

  // 将 tags 转换为 Menu 数据格式
  const menuItems: MenuItem[] = tags.map(tag => ({
    key: `tag-${tag.id}`,
    label: (
      <div className="tag-item-label">
        <span>{tag.tagName}</span>
        {tag.isLoading ? (
          <Spin size="small" style={{ marginLeft: 8 }} />
        ) : (
          <Badge
            count={tag.pointCount}
            size="small"
            style={{
              backgroundColor: '#1890ff',
              marginLeft: 8,
              fontSize: '10px',
            }}
          />
        )}
      </div>
    ),
    children: (tag.pointList ?? []).map(point => ({
      key: `point-${point.tagPointId}`,
      label: <span>{point.title}</span>,
    })),
  }))

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('point-')) {
      const pointId = key.replace('point-', '')
      setSelectedKeys([key])
      onSelectPoint(pointId)
    }
  }

  const handleOpenChange: MenuProps['onOpenChange'] = keys => {
    const nextKeys = keys as string[]
    const newlyOpened = nextKeys.find(key => !openKeys.includes(key))
    if (newlyOpened?.startsWith('tag-')) {
      const tagId = Number(newlyOpened.replace('tag-', ''))
      if (!Number.isNaN(tagId)) {
        onExpandTag?.(tagId)
      }
    }

    setTimeout(() => {
      setOpenKeys(nextKeys)
    }, 100)
  }

  return (
    <div className="toc">
      <div className="header">
        <h2>问题导航</h2>
      </div>
      <Menu
        mode="inline"
        items={menuItems}
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        onOpenChange={handleOpenChange}
        style={{ border: 'none' }}
        className="list"
      />
    </div>
  )
}