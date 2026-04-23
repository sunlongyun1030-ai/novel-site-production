#!/bin/bash
# 文件名: /mnt/d/novel-site-production/test-proxy.sh
# 测试反向代理功能

echo "🔍 测试反向代理配置..."
echo ""

# 测试1: 检查Vercel源站
echo "1. 测试Vercel源站访问..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" https://novel-site-omega.vercel.app/
echo ""

# 测试2: 检查Pages代理
echo "2. 测试Pages代理访问..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" https://novel-site-d1.pages.dev/
echo ""

# 测试3: 检查响应头
echo "3. 检查响应头..."
curl -I https://novel-site-d1.pages.dev/ 2>/dev/null | grep -E "(HTTP|Server|Content-Type|Location)"
echo ""

# 测试4: 检查内容替换
echo "4. 检查域名替换..."
curl -s https://novel-site-d1.pages.dev/ | grep -o "novel-site-[^\"']*" | head -5
echo ""

# 测试5: 检查Functions中间件
echo "5. 检查JavaScript控制台..."
echo "打开浏览器开发者工具，查看控制台输出"
echo "应该看到反向代理相关的日志信息"
echo ""

echo "✅ 测试完成！"
echo ""
echo "📊 预期结果："
echo "   • Vercel源站: 200 OK"
echo "   • Pages代理: 200 OK"
echo "   • 响应头: 显示Cloudflare服务器"
echo "   • 内容: 不包含vercel.app域名"
echo ""
echo "🔧 如果测试失败："
echo "   1. 检查Cloudflare Pages部署状态"
echo "   2. 查看Functions中间件日志"
echo "   3. 确认_redirects文件正确"
echo "   4. 等待DNS缓存更新"