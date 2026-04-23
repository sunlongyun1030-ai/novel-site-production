#!/bin/bash
# 部署脚本: deploy-proxy.sh

echo "🚀 开始部署反向代理Worker..."

# 检查是否已安装wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装wrangler..."
    npm install -g wrangler
fi

# 登录（如果需要）
echo "🔑 检查登录状态..."
wrangler whoami || {
    echo "🔑 需要登录Cloudflare..."
    wrangler login
}

# 部署Worker
echo "🚀 部署Worker..."
wrangler deploy

echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 在Cloudflare Dashboard中配置自定义域"
echo "2. 将 novel-site-d1.pages.dev 指向这个Worker"
echo "3. 测试访问: https://novel-site-d1.pages.dev/"