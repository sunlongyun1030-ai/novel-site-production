#!/bin/bash
# build.sh - 构建脚本，避免TypeScript检测问题

# 设置环境变量禁用TypeScript配置创建
export TYPESCRIPT_CREATE_CONFIG=false

# 运行Next.js构建
echo "开始构建..."
npx next build

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "构建成功！"
    
    # 删除可能创建的tsconfig.json
    if [ -f "tsconfig.json" ]; then
        echo "删除tsconfig.json文件..."
        rm -f tsconfig.json
    fi
    
    exit 0
else
    echo "构建失败！"
    exit 1
fi