'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/auth-context'

interface Stats {
  totalNovels: number
  totalChapters: number
  totalComments: number
  totalUsers: number
}

interface RecentNovel {
  id: string
  title: string
  author_username: string
  created_at: string
}

interface RecentComment {
  id: string
  user_username: string
  content: string
  created_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalNovels: 0,
    totalChapters: 0,
    totalComments: 0,
    totalUsers: 0
  })
  const [recentNovels, setRecentNovels] = useState<RecentNovel[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    try {
      // 加载统计数据
      const statsRes = await fetch('/api/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats({
            totalNovels: statsData.stats.published_novels,
            totalChapters: statsData.stats.chapters,
            totalComments: statsData.stats.comments,
            totalUsers: statsData.stats.users
          })
        }
      }

      // 加载最新小说
      const novelsRes = await fetch('/api/novels')
      if (novelsRes.ok) {
        const novelsData = await novelsRes.json()
        if (novelsData.success) {
          // 获取最新的5本小说
          const recent = novelsData.novels.slice(0, 5).map((novel: any) => ({
            id: novel.id,
            title: novel.title,
            author_username: novel.author_username,
            created_at: novel.created_at
          }))
          setRecentNovels(recent)
        }
      }

      // 加载最新评论
      // 这里需要实现获取最新评论的API
      // 暂时使用模拟数据
      setRecentComments([
        {
          id: '1',
          user_username: '小明同学',
          content: '这个故事真精彩！',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_username: '小作家',
          content: '期待下一章！',
          created_at: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('加载管理数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 检查管理员权限
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
          <p className="text-gray-600 mb-6">您需要管理员权限才能访问此页面</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载管理数据...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">后台管理</h1>
        <p className="text-gray-600">管理平台内容和用户</p>
      </div>

      {/* 管理导航 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
              👥
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">用户管理</h3>
              <p className="text-sm text-gray-600">管理注册用户</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-500">注册用户</div>
        </Link>

        <Link
          href="/admin/novels"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
              📚
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">小说管理</h3>
              <p className="text-sm text-gray-600">管理所有小说</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.totalNovels}</div>
          <div className="text-sm text-gray-500">已发布小说</div>
        </Link>

        <Link
          href="/admin/comments"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
              💬
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">评论管理</h3>
              <p className="text-sm text-gray-600">管理用户评论</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
          <div className="text-sm text-gray-500">用户评论</div>
        </Link>
      </div>

      {/* 平台统计概览 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">平台统计概览</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
            <div className="text-sm font-medium text-gray-700">注册用户</div>
            <div className="text-xs text-gray-500 mt-1">平台创作者</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalNovels}</div>
            <div className="text-sm font-medium text-gray-700">已发布小说</div>
            <div className="text-xs text-gray-500 mt-1">原创作品</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalChapters}</div>
            <div className="text-sm font-medium text-gray-700">章节总数</div>
            <div className="text-xs text-gray-500 mt-1">创作内容</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalComments}</div>
            <div className="text-sm font-medium text-gray-700">用户评论</div>
            <div className="text-xs text-gray-500 mt-1">读者互动</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最新小说 */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">最新发布的小说</h3>
              <Link
                href="/admin/novels"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                查看全部 →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentNovels.length > 0 ? (
              <div className="space-y-4">
                {recentNovels.map((novel) => (
                  <div key={novel.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{novel.title}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">作者：{novel.author_username}</span>
                          <span>{new Date(novel.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                      <Link
                        href={`/novels/${novel.id}`}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        查看
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📚</div>
                <p className="text-gray-600">暂无小说</p>
              </div>
            )}
          </div>
        </div>

        {/* 最新评论 */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">最新评论</h3>
              <Link
                href="/admin/comments"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                查看全部 →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentComments.length > 0 ? (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                          {comment.user_username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700">
                          {comment.user_username}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-gray-600">暂无评论</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 管理操作 */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">管理操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white p-4 rounded-lg border border-gray-300 hover:border-red-300 hover:bg-red-50 transition-all text-center">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-medium text-gray-700">刷新缓存</div>
          </button>
          
          <button className="bg-white p-4 rounded-lg border border-gray-300 hover:border-green-300 hover:bg-green-50 transition-all text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-700">导出数据</div>
          </button>
          
          <button className="bg-white p-4 rounded-lg border border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-gray-700">系统设置</div>
          </button>
          
          <button className="bg-white p-4 rounded-lg border border-gray-300 hover:border-yellow-300 hover:bg-yellow-50 transition-all text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-700">发布公告</div>
          </button>
        </div>
      </div>

      {/* 管理提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">⚠️ 管理注意事项</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>谨慎操作删除功能，删除后数据无法恢复</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>处理用户举报时，请核实情况后再做处理</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>定期备份重要数据</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>尊重用户隐私，不泄露用户信息</span>
          </li>
        </ul>
      </div>
    </div>
  )
}