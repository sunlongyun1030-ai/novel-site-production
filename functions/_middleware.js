export async function onRequest(context) {
  // 处理所有请求，让Next.js处理路由
  return await context.next();
}