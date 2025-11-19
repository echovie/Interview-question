# 前端面试学习平台

基于 Next.js 14 构建的前端知识点学习平台，支持 Markdown 预览和目录导航。

## 功能特性

- 📚 左侧导航菜单：展示知识点分类和列表
- 📖 中间 Markdown 预览：支持完整的 Markdown 语法渲染
- 📑 右侧目录导航：自动提取标题，支持高亮和跳转
- 🎯 标题高亮：滚动时自动高亮当前可见的标题
- 🔍 点击跳转：点击目录项可平滑滚动到对应位置

## 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **React Markdown** - Markdown 渲染
- **Remark GFM** - GitHub Flavored Markdown 支持
- **CSS Modules** - 样式隔离

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
interview/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── tags/           # 标签列表接口
│   │   └── detail/[id]/    # 详情接口
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── Sidebar.tsx         # 左侧导航
│   ├── MarkdownViewer.tsx  # Markdown 预览
│   └── TableOfContents.tsx # 目录导航
└── package.json
```

## 使用说明

1. 从左侧导航选择知识点分类
2. 点击具体的知识点查看详细内容
3. 在中间区域阅读 Markdown 内容
4. 右侧目录显示当前文章的标题结构
5. 滚动时目录会自动高亮当前章节
6. 点击目录项可快速跳转到对应位置

## 开发计划

- [ ] 添加更多知识点数据
- [ ] 支持搜索功能
- [ ] 添加收藏功能
- [ ] 支持暗色主题
- [ ] 响应式设计优化

## License

MIT

