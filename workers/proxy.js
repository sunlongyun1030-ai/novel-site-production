// 文件名: /mnt/d/novel-site-production/workers/proxy.js
// 这是一个完整的反向代理Worker，将novel-site-d1.pages.dev代理到novel-site-omega.vercel.app

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = 'https://novel-site-omega.vercel.app';
    
    console.log(`📡 代理请求: ${url.pathname} -> ${targetUrl}${url.pathname}`);
    
    // 修改请求头，确保正确转发
    const headers = new Headers(request.headers);
    
    // 设置必要的请求头
    headers.set('Host', 'novel-site-omega.vercel.app');
    headers.set('X-Forwarded-Host', 'novel-site-d1.pages.dev');
    headers.set('X-Forwarded-Proto', 'https');
    headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '');
    
    // 创建新的请求对象
    const proxyRequest = new Request(
      `${targetUrl}${url.pathname}${url.search}`,
      {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'manual'
      }
    );
    
    try {
      // 发送请求到Vercel
      const response = await fetch(proxyRequest);
      
      // 修改响应头
      const responseHeaders = new Headers(response.headers);
      
      // 移除可能引起问题的头
      responseHeaders.delete('Content-Security-Policy');
      responseHeaders.delete('X-Frame-Options');
      
      // 设置CORS头
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      
      // 修改响应中的链接（将Vercel域名替换为Pages域名）
      const contentType = responseHeaders.get('Content-Type') || '';
      
      if (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('application/javascript')) {
        // 需要处理HTML、CSS、JS中的链接
        const text = await response.text();
        const modifiedText = text
          .replace(/https:\/\/novel-site-omega\.vercel\.app/g, 'https://novel-site-d1.pages.dev')
          .replace(/novel-site-omega\.vercel\.app/g, 'novel-site-d1.pages.dev')
          .replace(/\/\/novel-site-omega\.vercel\.app/g, '//novel-site-d1.pages.dev');
        
        return new Response(modifiedText, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      } else {
        // 其他类型直接返回
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      }
      
    } catch (error) {
      console.error('❌ 代理请求失败:', error);
      
      // 返回错误页面
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>简阅小说 - 服务暂时不可用</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .retry { background: #2563eb; color: white; padding: 10px 20px; 
                     border-radius: 5px; text-decoration: none; display: inline-block; 
                     margin: 20px; }
          </style>
        </head>
        <body>
          <h1>⚠️ 服务暂时不可用</h1>
          <p>正在尝试连接服务器，请稍后重试</p>
          <a href="/" class="retry">刷新页面</a>
          <p style="color: #666; margin-top: 30px;">
            如果问题持续，请稍后再试
          </p>
          <script>
            // 5秒后自动重试
            setTimeout(() => location.reload(), 5000);
          </script>
        </body>
        </html>
      `;
      
      return new Response(errorHtml, {
        status: 502,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }
  }
}