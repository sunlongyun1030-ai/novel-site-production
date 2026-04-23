// functions/_middleware.js
// Cloudflare Pages Functions middleware for Next.js App Router

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // 检查是否是静态文件
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/api/') ||
      url.pathname === '/favicon.ico') {
    return next();
  }
  
  // 对于所有其他路由，返回index.html
  // Cloudflare Pages会自动处理路由
  return next();
}