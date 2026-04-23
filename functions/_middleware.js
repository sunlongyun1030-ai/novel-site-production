// functions/_middleware.js
// Cloudflare Pages Functions middleware for Next.js App Router

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  console.log(`Request: ${url.pathname}`);
  
  // 静态文件直接通过
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/api/') ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/robots.txt') {
    return next();
  }
  
  // 对于所有其他路由，重写到index.html
  // 这样Next.js客户端路由可以处理
  try {
    // 尝试直接返回响应
    return next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // 如果失败，返回简单的HTML响应
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Novel Site</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">Loading...</div>
          <script>
            // 简单的重定向到首页
            window.location.href = '/';
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}