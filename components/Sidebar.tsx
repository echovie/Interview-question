'use client'

import { useState, useEffect } from 'react'
import { Menu, Layout, Tag, Badge } from 'antd'
import { 
  CrownOutlined, 
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider } = Layout

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

interface SidebarProps {
  tags: Tag[]
  selectedPointId: number | null
  onSelectPoint: (pointId: number) => void
}

type MenuItem = Required<MenuProps>['items'][number]

export default function Sidebar({ tags, selectedPointId, onSelectPoint }: SidebarProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 自动展开包含选中知识点的标签
  useEffect(() => {
    if (tags.length > 0 && selectedPointId) {
      const tagWithSelectedPoint = tags.find(tag =>
        tag.pointList.some(point => point.tagPointId === selectedPointId)
      )
      if (tagWithSelectedPoint) {
        // 保持当前已展开的标签，同时展开包含选中知识点的标签
        setOpenKeys(prevKeys => {
          const newKeys = new Set(prevKeys)
          newKeys.add(`tag-${tagWithSelectedPoint.id}`)
          return Array.from(newKeys)
        })
        setSelectedKeys([`point-${selectedPointId}`])
      } else if (tags.length > 0 && openKeys.length === 0) {
        // 默认展开第一个标签
        setOpenKeys([`tag-${tags[0].id}`])
      }
    } else if (tags.length > 0 && openKeys.length === 0) {
      // 默认展开第一个标签
      setOpenKeys([`tag-${tags[0].id}`])
    }
  }, [tags, selectedPointId, openKeys.length])

  // 将 tags 转换为 Menu 数据格式
  const menuItems: MenuItem[] = tags.map(tag => ({
    key: `tag-${tag.id}`,
    label: (
      <div>
        <span>{tag.tagName}</span>
        <Badge 
          count={tag.pointCount} 
          size="small" 
          style={{ 
            backgroundColor: '#1890ff', 
            marginLeft: 8,
            fontSize: '10px'
          }} 
        />
      </div>
    ),
    children: tag.pointList.map(point => ({
      key: `point-${point.tagPointId}`,
      label: (
        <span>{point.title}</span>
      ),
    }))
  }))

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('point-')) {
      const pointId = parseInt(key.replace('point-', ''), 10)
      setSelectedKeys([key])
      onSelectPoint(pointId)
    }
  }

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys as string[])
  }

  return (
    <div className="toc">
      <div className="header">
        <h2>知识点导航</h2>
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