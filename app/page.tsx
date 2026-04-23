'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalChapters: 0,
    totalComments: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentNovels, setRecentNovels] = useState<Array<{
    id: string
    title: string
    description: string | null
    author_username: string
  }>>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 加载统计数据
      const statsRes = await fetch('/api/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats({
          totalNovels: statsData.stats.published_novels,
          totalChapters: statsData.stats.chapters,
          totalComments: statsData.stats.comments,
          totalUsers: statsData.stats.users
        })
      }

      // 加载最新小说
      const novelsRes = await fetch('/api/novels')
      if (novelsRes.ok) {
        const novelsData = await novelsRes.json()
        setRecentNovels(novelsData.novels || [])
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 欢迎区域 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6">
          <span className="text-sm font-medium">
            欢迎来到简阅小说创作平台
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          简阅小说创作平台
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          专为5-6年级小学生设计的简约小说创作空间
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            立即注册
          </Link>
          <Link
            href="/novels"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            浏览作品
          </Link>
        </div>
      </div>

      {/* 平台概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {stats.totalNovels}
          </div>
          <div className="text-lg font-medium text-blue-800">
            已发布小说
          </div>
          <div className="text-sm text-gray-600 mt-2">
            来自小作者们的精彩作品
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <div className="text-3xl font-bold text-red-700 mb-2">
            免费
          </div>
          <div className="text-lg font-medium text-red-800">
            完全免费使用
          </div>
          <div className="text-sm text-gray-600 mt-2">
            为小学生提供零成本创作环境
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-700 mb-2">
            简约
          </div>
          <div className="text-lg font-medium text-green-800">
            界面简洁易用
          </div>
          <div className="text-sm text-gray-600 mt-2">
            专为小学生设计的友好界面
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
          <div className="text-3xl font-bold text-purple-700 mb-2">
            {stats.totalUsers}
          </div>
          <div className="text-lg font-medium text-purple-800">
            注册作者
          </div>
          <div className="text-sm text-gray-600 mt-2">
            正在创作精彩故事的小作者
          </div>
        </div>
      </div>

      {/* 最新作品 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          最新作品
        </h2>
        
        {recentNovels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNovels.map((novel) => (
              <div key={novel.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {novel.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {novel.description || '暂无描述'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    作者：{novel.author_username}
                  </span>
                  <Link
                    href={`/novels/${novel.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    阅读 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-gray-500 mb-4">暂无作品</div>
            <Link
              href="/novels/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              成为第一个创作者 →
            </Link>
          </div>
        )}
        
        {recentNovels.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/novels"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              浏览所有作品
            </Link>
          </div>
        )}
      </div>

      {/* 平台特色 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          平台特色
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-xl font-semibold mb-3 text-blue-700">
              🎨 简约设计
            </div>
            <p className="text-gray-600">
              界面简洁明了，没有复杂装饰，适合小学生专注创作
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-xl font-semibold mb-3 text-green-700">
              📚 章节管理
            </div>
            <p className="text-gray-600">
              轻松添加和管理章节，支持草稿保存和继续创作
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-xl font-semibold mb-3 text-purple-700">
              💬 互动评论
            </div>
            <p className="text-gray-600">
              读者可以给喜欢的小说留言，作者可以回复交流
            </p>
          </div>
        </div>
      </div>

      {/* 使用指南 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
        <h3 className="text-xl font-bold mb-4 text-yellow-800">
          📝 使用指南
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-yellow-900">
          <li>注册账号（支持中文用户名）</li>
          <li>登录后点击"创作新小说"开始写作</li>
          <li>为小说添加章节，支持草稿保存</li>
          <li>发布后其他用户可以在作品库阅读</li>
          <li>读者可以给喜欢的小说留言评论</li>
        </ol>
      </div>

      {/* 创作号召 */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          开始你的创作之旅
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          无论你是想写奇幻冒险、校园故事还是科幻想象，这里都是你展示才华的舞台
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            立即注册
          </Link>
          <Link
            href="/novels/new"
            className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            开始创作
          </Link>
        </div>
      </div>
    </div>
  )
}