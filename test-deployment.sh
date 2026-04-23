#!/bin/bash

echo "=== Cloudflare Pages部署测试脚本 ==="
echo "测试时间: $(date)"
echo ""

# 等待部署完成
echo "等待部署完成..."
sleep 30

# 获取最新的部署信息
echo "获取最新部署信息..."
echo ""

# 测试主页
echo "测试主页访问..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" "https://novel-site-d1.pages.dev" || echo "无法访问主页"

echo ""
echo "=== 测试完成 ==="