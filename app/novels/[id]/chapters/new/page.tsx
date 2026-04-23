import { redirect } from 'next/navigation'

// 静态生成参数
export async function generateStaticParams() {
  // 返回空数组，表示不预生成任何页面
  return []
}

export default function NewChapterPage() {
  // 重定向到登录页面
  redirect('/login')
  
  return null
}