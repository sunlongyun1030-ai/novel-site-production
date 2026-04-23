#!/bin/bash
# 文件名: /mnt/d/novel-site-production/deploy.sh
# 完整的反向代理部署脚本

echo "🚀 开始部署反向代理方案..."
echo "📡 目标: novel-site-d1.pages.dev -> novel-site-omega.vercel.app"
echo ""

# 步骤1: 清理并准备文件
echo "📦 步骤1: 准备文件..."
rm -rf public/_redirects.bak 2>/dev/null
cp public/_redirects public/_redirects.bak 2>/dev/null

# 步骤2: 提交到Git
echo "📝 步骤2: 提交更改..."
git add .
git commit -m "部署反向代理：配置Functions和重定向规则" || true

# 步骤3: 推送到GitHub
echo "🚀 步骤3: 推送到GitHub..."
git push origin main

echo ""
echo "✅ 部署流程已启动！"
echo ""
echo "📋 Cloudflare Pages 将自动："
echo "   1. 检测代码变更"
echo "   2. 重新构建网站"
echo "   3. 部署到 novel-site-d1.pages.dev"
echo ""
echo "🎯 反向代理配置："
echo "   • 用户访问: https://novel-site-d1.pages.dev/"
echo "   • 实际后端: https://novel-site-omega.vercel.app/"
echo "   • 隐藏方式: Cloudflare Pages Functions 中间件"
echo ""
echo "⏱️ 预计等待时间："
echo "   • Cloudflare 检测: 1-2分钟"
echo "   • 构建部署: 1-2分钟"
echo "   • DNS 生效: 立即（使用pages.dev）"
echo ""
echo "🔍 测试命令："
echo "   curl -I https://novel-site-d1.pages.dev/"
echo "   curl https://novel-site-d1.pages.dev/ | head -20"
echo ""
echo "📊 监控部署："
echo "   1. 访问 Cloudflare Dashboard"
echo "   2. 查看 Pages -> novel-site-d1"
echo "   3. 检查部署日志"
echo ""
echo "⚠️ 注意事项："
echo "   • 确保 novel-site-omega.vercel.app 可以正常访问"
echo "   • 如果Vercel应用有CORS限制，可能需要调整"
echo "   • 首次访问可能会有延迟"