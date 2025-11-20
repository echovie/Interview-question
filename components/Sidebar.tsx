'use client'

import { useState, useEffect, useMemo } from 'react'
import { Menu, Layout, Badge, Spin, Tooltip } from 'antd'
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
  title: string
  readPointIds?: Set<string> | string[]
}

type MenuItem = Required<MenuProps>['items'][number]

export default function Sidebar({
  tags,
  selectedPointId,
  onSelectPoint,
  onExpandTag,
  defaultOpenKeys = '',
  title,
  readPointIds,
}: SidebarProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const readSet = useMemo(() => {
    if (!readPointIds) return new Set<string>()
    return readPointIds instanceof Set ? readPointIds : new Set(readPointIds.map(String))
  }, [readPointIds])

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
    children: (tag.pointList ?? []).map(point => {
        const isRead = readSet.has(String(point.tagPointId))
        return {
          key: `point-${point.tagPointId}`,
          label: (
            <div className="point-item">
              <Tooltip title={point.title}>
                <span>{point.title}</span>
              </Tooltip>
              {isRead && <span className="point-read-flag">已读</span>}
            </div>
          ),
        }
      }),
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
        <h2>{title}</h2>
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