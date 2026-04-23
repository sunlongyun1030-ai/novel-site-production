#!/bin/bash

# API端点测试脚本
# 这个脚本测试关键API端点是否正常工作

echo "=== API端点测试 ==="
echo "开始时间: $(date)"
echo ""

# 测试环境变量
export NODE_ENV=test

# 1. 测试健康检查端点
echo "1. 测试健康检查端点..."
curl -s -o /dev/null -w "状态码: %{http_code}\n" http://localhost:3000/api/health || echo "健康检查端点不可用"

# 2. 测试小说API端点
echo ""
echo "2. 测试小说API端点..."
echo "获取小说列表:"
curl -s -X GET "http://localhost:3000/api/novels?limit=3" | jq '.novels | length' 2>/dev/null || echo "无法获取小说列表"

# 3. 测试用户API端点
echo ""
echo "3. 测试用户API端点..."
echo "获取用户列表:"
curl -s -X GET "http://localhost:3000/api/users" | jq '.users | length' 2>/dev/null || echo "无法获取用户列表"

# 4. 测试章节API端点
echo ""
echo "4. 测试章节API端点..."
echo "获取章节列表:"
curl -s -X GET "http://localhost:3000/api/chapters?limit=3" | jq '.chapters | length' 2>/dev/null || echo "无法获取章节列表"

# 5. 测试评论API端点
echo ""
echo "5. 测试评论API端点..."
echo "获取评论列表:"
curl -s -X GET "http://localhost:3000/api/comments?limit=3" | jq '.comments | length' 2>/dev/null || echo "无法获取评论列表"

echo ""
echo "=== 测试完成 ==="
echo "结束时间: $(date)"