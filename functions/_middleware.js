// 文件名: /mnt/d/novel-site-production/functions/_middleware.js
// Cloudflare Pages Functions 中间件，处理所有请求

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // 如果请求的是静态文件，直接返回
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg')) {
    return next();
  }
  
  // 否则代理到Vercel
  return handleProxy(request);
}

async function handleProxy(request) {
  const targetUrl = 'https://novel-site-omega.vercel.app';
  const url = new URL(request.url);
  
  console.log(`🔀 代理请求: ${url.pathname}`);
  
  // 创建代理请求
  const proxyUrl = `${targetUrl}${url.pathname}${url.search}`;
  const proxyHeaders = new Headers(request.headers);
  
  // 设置必要的头
  proxyHeaders.set('Host', 'novel-site-omega.vercel.app');
  proxyHeaders.set('X-Forwarded-Host', 'novel-site-d1.pages.dev');
  proxyHeaders.set('X-Forwarded-Proto', 'https');
  
  try {
    const proxyRequest = new Request(proxyUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.body,
      redirect: 'manual'
    });
    
    const response = await fetch(proxyRequest);
    
    // 处理响应
    const responseHeaders = new Headers(response.headers);
    
    // 移除可能引起问题的头
    responseHeaders.delete('Content-Security-Policy');
    responseHeaders.delete('X-Frame-Options');
    
    // 设置CORS
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    // 如果是HTML，需要替换内容中的域名
    const contentType = responseHeaders.get('Content-Type') || '';
    
    if (contentType.includes('text/html')) {
      const text = await response.text();
      const modifiedText = text
        .replace(/https:\/\/novel-site-omega\.vercel\.app/g, 'https://novel-site-d1.pages.dev')
        .replace(/novel-site-omega\.vercel\.app/g, 'novel-site-d1.pages.dev')
        .replace(/href="\/\//g, 'href="https://novel-site-d1.pages.dev/')
        .replace(/src="\/\//g, 'src="https://novel-site-d1.pages.dev/');
      
      return new Response(modifiedText, {
        status: response.status,
        headers: responseHeaders
      });
    }
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('代理失败:', error);
    
    // 返回错误页面
    const errorPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>简阅小说 - 连接中...</title>
        <meta http-equiv="refresh" content="3;url=/">
        <style>
          body { font-family: Arial; text-align: center; padding: 100px; }
          .spinner { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; 
                     border-radius: 50%; width: 50px; height: 50px; 
                     animation: spin 2s linear infinite; margin: 0 auto 30px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>正在连接服务器...</h2>
        <p>请稍候，正在尝试重新连接</p>
        <p style="color: #666; margin-top: 30px;">
          如果长时间无法连接，请检查网络设置
        </p>
      </body>
      </html>
    `;
    
    return new Response(errorPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
}