#!/bin/bash

echo "=== Cloudflare Pages构建脚本 ==="
echo "构建时间: $(date)"
echo "环境: $NODE_ENV"
echo "Node版本: $(node --version)"
echo ""

# 安装依赖
echo "安装依赖..."
npm ci --no-audit --prefer-offline

# 构建
echo "开始构建..."
npm run build

# 检查构建结果
if [ -d ".next" ]; then
  echo "✅ 构建成功：.next目录已生成"
  ls -la .next/
elif [ -d "out" ]; then
  echo "✅ 构建成功：out目录已生成（静态导出）"
  ls -la out/
else
  echo "❌ 构建失败：未找到输出目录"
  exit 1
fi

echo ""
echo "=== 构建完成 ==="