import { NextResponse } from 'next/server'

// 模拟数据 - 从 task.md 中提取的标签数据
const mockTagsData = {
  code: 0,
  message: 'ok',
  data: {
    list: [
      {
        id: 10,
        tagName: 'JavaScript',
        pointCount: 29,
        pointList: [
          {
            tagPointId: 13,
            tagId: 10,
            title: '数据类型',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 144,
            tagId: 10,
            title: '类型判断',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 145,
            tagId: 10,
            title: '数据类型转换',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 151,
            tagId: 10,
            title: '内存空间',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 152,
            tagId: 10,
            title: '执行上下文',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 153,
            tagId: 10,
            title: '变量对象',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 14,
            tagId: 10,
            title: '作用域链与闭包',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 154,
            tagId: 10,
            title: '全方位解读this',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 15,
            tagId: 10,
            title: '函数与函数式编程',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 19,
            tagId: 10,
            title: '函数柯里化',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 16,
            tagId: 10,
            title: '原型链与继承',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 20,
            tagId: 10,
            title: '高阶函数',
            vipLimit: 0,
            level: 3.5
          },
          {
            tagPointId: 17,
            tagId: 10,
            title: '异步编程',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 18,
            tagId: 10,
            title: '事件循环',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 21,
            tagId: 10,
            title: '模块化',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 23,
            tagId: 10,
            title: '垃圾回收',
            vipLimit: 1,
            level: 4
          },
          {
            tagPointId: 26,
            tagId: 10,
            title: 'DOM操作',
            vipLimit: 0,
            level: 1.5
          },
          {
            tagPointId: 27,
            tagId: 10,
            title: '事件冒泡、事件捕获、事件委托',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 22,
            tagId: 10,
            title: 'call、apply和bind',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 155,
            tagId: 10,
            title: '深拷贝/浅拷贝',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 158,
            tagId: 10,
            title: '字符串常见方法',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 159,
            tagId: 10,
            title: '数组常用方法',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 25,
            tagId: 10,
            title: '正则表达式',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 28,
            tagId: 10,
            title: '跨域',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 29,
            tagId: 10,
            title: '前端存储',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 30,
            tagId: 10,
            title: 'WebWorker',
            vipLimit: 1,
            level: 4
          },
          {
            tagPointId: 156,
            tagId: 10,
            title: 'Service Worker',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 157,
            tagId: 10,
            title: 'WebSocket',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 31,
            tagId: 10,
            title: '设计模式',
            vipLimit: 1,
            level: 4
          }
        ]
      },
      {
        id: 11,
        tagName: 'CSS',
        pointCount: 27,
        pointList: [
          {
            tagPointId: 12,
            tagId: 11,
            title: '盒子模型',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 116,
            tagId: 11,
            title: '伪类和伪元素',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 111,
            tagId: 11,
            title: '选择器',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 122,
            tagId: 11,
            title: '优先级',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 124,
            tagId: 11,
            title: 'font',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 125,
            tagId: 11,
            title: 'background',
            vipLimit: 0,
            level: 0.5
          },
          {
            tagPointId: 112,
            tagId: 11,
            title: 'position',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 163,
            tagId: 11,
            title: 'position: sticky',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 126,
            tagId: 11,
            title: '布局技巧',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 164,
            tagId: 11,
            title: 'z-index',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 113,
            tagId: 11,
            title: 'Flexbox',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 114,
            tagId: 11,
            title: 'Grid布局',
            vipLimit: 0,
            level: 1.5
          },
          {
            tagPointId: 127,
            tagId: 11,
            title: '浮动、清除浮动和BFC',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 131,
            tagId: 11,
            title: '单位',
            vipLimit: 1,
            level: 1.5
          },
          {
            tagPointId: 162,
            tagId: 11,
            title: 'BFC',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 117,
            tagId: 11,
            title: '动画',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 118,
            tagId: 11,
            title: 'transition',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 115,
            tagId: 11,
            title: '响应式设计',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 121,
            tagId: 11,
            title: '变量',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 123,
            tagId: 11,
            title: 'display',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 129,
            tagId: 11,
            title: '预处理器',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 130,
            tagId: 11,
            title: '架构',
            vipLimit: 1,
            level: 3.5
          },
          {
            tagPointId: 132,
            tagId: 11,
            title: '视觉格式化模型',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 166,
            tagId: 11,
            title: '原子化CSS',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 167,
            tagId: 11,
            title: '移动端适配',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 128,
            tagId: 11,
            title: '优化性能',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 165,
            tagId: 11,
            title: '新变化',
            vipLimit: 1,
            level: 2
          }
        ]
      },
      {
        id: 12,
        tagName: 'HTML',
        pointCount: 24,
        pointList: [
          {
            tagPointId: 7,
            tagId: 12,
            title: 'HTML 5 新特性',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 5,
            tagId: 12,
            title: 'DOCTYPE',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 6,
            tagId: 12,
            title: '语义化',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 135,
            tagId: 12,
            title: 'HTML 元素分类',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 136,
            tagId: 12,
            title: 'HTML 常见属性',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 8,
            tagId: 12,
            title: '表单控件',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 146,
            tagId: 12,
            title: 'meta 标签',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 10,
            tagId: 12,
            title: '响应式图片',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 11,
            tagId: 12,
            title: '多媒体技术',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 119,
            tagId: 12,
            title: 'Canvas 和 SVG',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 120,
            tagId: 12,
            title: 'Web Storage',
            vipLimit: 0,
            level: 1
          },
          {
            tagPointId: 133,
            tagId: 12,
            title: '跨域通信',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 134,
            tagId: 12,
            title: '表单验证',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 137,
            tagId: 12,
            title: '实体字符（转义字符）',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 138,
            tagId: 12,
            title: '离线存储',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 139,
            tagId: 12,
            title: 'Web Workers',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 140,
            tagId: 12,
            title: '地理定位',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 141,
            tagId: 12,
            title: '拖放API',
            vipLimit: 0,
            level: 2
          },
          {
            tagPointId: 142,
            tagId: 12,
            title: '全屏API',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 143,
            tagId: 12,
            title: '与 CSS/JS 的交互',
            vipLimit: 0,
            level: 1.5
          },
          {
            tagPointId: 147,
            tagId: 12,
            title: 'SEO',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 148,
            tagId: 12,
            title: 'CSR，SSR和SSG',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 149,
            tagId: 12,
            title: '浏览器解析 HTML 文件',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 150,
            tagId: 12,
            title: '输入 URL 到页面渲染完成',
            vipLimit: 1,
            level: 5
          }
        ]
      },
      {
        id: 13,
        tagName: 'React.js',
        pointCount: 21,
        pointList: [
          {
            tagPointId: 170,
            tagId: 13,
            title: 'JSX',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 171,
            tagId: 13,
            title: '元素、组件、实例和节点',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 172,
            tagId: 13,
            title: 'state 与 props',
            vipLimit: 1,
            level: 1
          },
          {
            tagPointId: 196,
            tagId: 13,
            title: 'React 生命周期',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 197,
            tagId: 13,
            title: 'react hooks',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 198,
            tagId: 13,
            title: 'Context API',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 199,
            tagId: 13,
            title: '条件渲染的常见方法和注意事项',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 200,
            tagId: 13,
            title: '列表和key',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 201,
            tagId: 13,
            title: 'react 事件机制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 202,
            tagId: 13,
            title: '受控组件和非受控组件',
            vipLimit: 1,
            level: 1.5
          },
          {
            tagPointId: 203,
            tagId: 13,
            title: '高阶组件',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 204,
            tagId: 13,
            title: 'Fragment 和 Portals',
            vipLimit: 1,
            level: 1
          },
          {
            tagPointId: 205,
            tagId: 13,
            title: '性能优化',
            vipLimit: 1,
            level: 4
          },
          {
            tagPointId: 206,
            tagId: 13,
            title: '代码分割',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 207,
            tagId: 13,
            title: 'react 状态提升',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 208,
            tagId: 13,
            title: 'forwardRef 该怎么用？',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 209,
            tagId: 13,
            title: '错误边界',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 210,
            tagId: 13,
            title: 'react-router',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 211,
            tagId: 13,
            title: 'react 渲染机制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 212,
            tagId: 13,
            title: 'React函数组件更新',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 213,
            tagId: 13,
            title: 'react 组件设计模式',
            vipLimit: 1,
            level: 3
          }
        ]
      },
      {
        id: 14,
        tagName: 'Vue.js',
        pointCount: 23,
        pointList: [
          {
            tagPointId: 64,
            tagId: 14,
            title: 'Vue实例挂载',
            vipLimit: 1,
            level: 3.5
          },
          {
            tagPointId: 65,
            tagId: 14,
            title: '数据绑定',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 66,
            tagId: 14,
            title: 'vue指令',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 67,
            tagId: 14,
            title: '计算属性',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 68,
            tagId: 14,
            title: '侦听器watch',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 69,
            tagId: 14,
            title: 'methods',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 70,
            tagId: 14,
            title: '生命周期',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 71,
            tagId: 14,
            title: '组件通信',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 72,
            tagId: 14,
            title: '插槽',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 73,
            tagId: 14,
            title: 'v-if/v-show',
            vipLimit: 1,
            level: 1
          },
          {
            tagPointId: 74,
            tagId: 14,
            title: 'v-for',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 75,
            tagId: 14,
            title: 'vue事件处理',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 76,
            tagId: 14,
            title: '自定义指令',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 77,
            tagId: 14,
            title: 'mixin-混入',
            vipLimit: 1,
            level: 1.5
          },
          {
            tagPointId: 78,
            tagId: 14,
            title: '工具函数',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 79,
            tagId: 14,
            title: '$nextTick',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 81,
            tagId: 14,
            title: '异步组件',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 82,
            tagId: 14,
            title: 'vue路由',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 83,
            tagId: 14,
            title: '状态管理',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 84,
            tagId: 14,
            title: '服务器渲染',
            vipLimit: 1,
            level: 3.5
          },
          {
            tagPointId: 85,
            tagId: 14,
            title: 'Vue3 API',
            vipLimit: 1,
            level: 4
          },
          {
            tagPointId: 86,
            tagId: 14,
            title: '响应式原理',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 107,
            tagId: 14,
            title: ' watch与watchEffect',
            vipLimit: 1,
            level: 2
          }
        ]
      },
      {
        id: 16,
        tagName: '计算机网络',
        pointCount: 20,
        pointList: [
          {
            tagPointId: 220,
            tagId: 16,
            title: '浏览器的进程和线程',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 222,
            tagId: 16,
            title: 'V8 引擎的优化机制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 223,
            tagId: 16,
            title: 'http方法',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 224,
            tagId: 16,
            title: 'http状态码',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 225,
            tagId: 16,
            title: 'http和https',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 226,
            tagId: 16,
            title: 'Cookie 和 Session',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 234,
            tagId: 16,
            title: '跨域相关',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 235,
            tagId: 16,
            title: 'DNS解析',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 236,
            tagId: 16,
            title: '正向代理和反向代理',
            vipLimit: 1,
            level: 1.5
          },
          {
            tagPointId: 239,
            tagId: 16,
            title: 'WebSocket相关',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 242,
            tagId: 16,
            title: '浏览器的缓存机制解析',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 243,
            tagId: 16,
            title: 'CDN原理',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 244,
            tagId: 16,
            title: 'TCP和UDP',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 245,
            tagId: 16,
            title: '网络延迟和丢包',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 246,
            tagId: 16,
            title: '网络安全',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 247,
            tagId: 16,
            title: 'http2.0/http3.0',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 248,
            tagId: 16,
            title: 'http2.0 服务端推送',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 249,
            tagId: 16,
            title: '网络性能优化',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 250,
            tagId: 16,
            title: '浏览器渲染过程中的网络层面',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 251,
            tagId: 16,
            title: '抓包工具',
            vipLimit: 1,
            level: 2
          }
        ]
      },
      {
        id: 20,
        tagName: '性能优化',
        pointCount: 4,
        pointList: [
          {
            tagPointId: 214,
            tagId: 20,
            title: '浏览器渲染过程',
            vipLimit: 0,
            level: 3
          },
          {
            tagPointId: 215,
            tagId: 20,
            title: '浏览器的缓存机制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 218,
            tagId: 20,
            title: '浏览器的垃圾回收机制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 219,
            tagId: 20,
            title: '浏览器的存储机制',
            vipLimit: 1,
            level: 2
          }
        ]
      },
      {
        id: 21,
        tagName: '前端安全',
        pointCount: 12,
        pointList: [
          {
            tagPointId: 32,
            tagId: 21,
            title: ' XSS防御',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 33,
            tagId: 21,
            title: 'CSRF攻击',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 34,
            tagId: 21,
            title: 'https',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 35,
            tagId: 21,
            title: 'Content Security Policy',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 36,
            tagId: 21,
            title: '第三方库的安全',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 44,
            tagId: 21,
            title: '密码存储',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 45,
            tagId: 21,
            title: '文件上传安全',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 46,
            tagId: 21,
            title: '点击劫持',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 168,
            tagId: 21,
            title: '中间人攻击',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 216,
            tagId: 21,
            title: '浏览器的同源策略',
            vipLimit: 1,
            level: 1.5
          },
          {
            tagPointId: 217,
            tagId: 21,
            title: '跨域资源共享（CORS）',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 221,
            tagId: 21,
            title: '浏览器的安全性',
            vipLimit: 1,
            level: 2
          }
        ]
      },
      {
        id: 24,
        tagName: 'ES6',
        pointCount: 17,
        pointList: [
          {
            tagPointId: 47,
            tagId: 24,
            title: 'Let/Const',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 48,
            tagId: 24,
            title: '模版字符串',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 49,
            tagId: 24,
            title: '默认参数',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 50,
            tagId: 24,
            title: '箭头函数',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 51,
            tagId: 24,
            title: '解构赋值',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 52,
            tagId: 24,
            title: '展开运算符',
            vipLimit: 1,
            level: 1
          },
          {
            tagPointId: 53,
            tagId: 24,
            title: 'export/import ',
            vipLimit: 1,
            level: 1
          },
          {
            tagPointId: 54,
            tagId: 24,
            title: 'Promise',
            vipLimit: 1,
            level: 3.5
          },
          {
            tagPointId: 55,
            tagId: 24,
            title: 'Generator',
            vipLimit: 1,
            level: 3.5
          },
          {
            tagPointId: 56,
            tagId: 24,
            title: 'Async/Await',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 57,
            tagId: 24,
            title: 'Class',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 58,
            tagId: 24,
            title: 'Map与Set',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 59,
            tagId: 24,
            title: 'WeakMap 和 WeakSet',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 60,
            tagId: 24,
            title: 'defineProperty 与 proxy',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 61,
            tagId: 24,
            title: 'Reflect',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 62,
            tagId: 24,
            title: '数组扩展',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 63,
            tagId: 24,
            title: '尾部优化',
            vipLimit: 1,
            level: 2.5
          }
        ]
      },
      {
        id: 28,
        tagName: '工程化',
        pointCount: 14,
        pointList: [
          {
            tagPointId: 108,
            tagId: 28,
            title: '前端模块化',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 109,
            tagId: 28,
            title: 'Webpack与Vite',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 110,
            tagId: 28,
            title: '任务自动化',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 261,
            tagId: 28,
            title: '前端构建工具详解',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 262,
            tagId: 28,
            title: '前端任务自动化（npm scripts实现）',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 263,
            tagId: 28,
            title: '代码规范工程化',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 264,
            tagId: 28,
            title: '版本控制',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 265,
            tagId: 28,
            title: '包管理',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 266,
            tagId: 28,
            title: '持续集成/持续部署（CI/CD）',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 269,
            tagId: 28,
            title: '代码分割工程化',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 270,
            tagId: 28,
            title: '前端性能监控',
            vipLimit: 1,
            level: 2.5
          },
          {
            tagPointId: 271,
            tagId: 28,
            title: '前端组件化开发',
            vipLimit: 1,
            level: 3
          },
          {
            tagPointId: 272,
            tagId: 28,
            title: '单页面架构',
            vipLimit: 1,
            level: 2
          },
          {
            tagPointId: 274,
            tagId: 28,
            title: '状态管理工程化',
            vipLimit: 1,
            level: 2
          }
        ]
      }
    ],
  },
}

export async function GET() {
  return NextResponse.json(mockTagsData)
}

