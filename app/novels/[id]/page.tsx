import { redirect } from 'next/navigation'

// 静态生成参数
export async function generateStaticParams() {
  // 返回空数组，表示不预生成任何页面
  return []
}

export default function NovelDetailPage() {
  // 重定向到小说列表
  redirect('/novels')
  
  return null
}