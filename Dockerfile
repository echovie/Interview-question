# 使用官方 Node.js 运行时作为基础镜像
FROM node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 依赖安装阶段
FROM base AS deps
# 复制包管理文件
COPY package.json pnpm-lock.yaml ./
# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制源代码
COPY . .
# 如果 public 目录不存在，创建一个空目录
RUN mkdir -p public || true
# 构建应用
RUN pnpm build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 复制 public 目录（如果存在且不为空）
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露 8000 端口
EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]

