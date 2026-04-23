'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

interface Novel {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  chapters_count?: number
}

export default function MyNovelsPage() {
  const { user } = useAuth()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all')

  useEffect(() => {
    if (user) {
      loadMyNovels()
    }
  }, [user])

  const loadMyNovels = async () => {
    if (!user) return
    
    try {
      // 调用获取用户作品的API
      const response = await fetch(`/api/my-novels?author_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNovels(data.novels || [])
      }
    } catch (error) {
      console.error('加载我的作品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNovels = novels.filter(novel => {
    if (activeTab === 'all') return true
    if (activeTab === 'published') return novel.status === 'published'
    if (activeTab === 'drafts') return novel.status === 'draft'
    return true
  })

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">需要登录</h2>
          <p className="text-gray-600 mb-6">请登录后查看您的作品</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              立即登录
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              注册账号
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载您的作品...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">我的作品</h1>
        <p className="text-gray-600">管理您创作的所有小说</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部作品
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已发布
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              草稿箱
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/novels/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              创作新小说
            </Link>
          </div>
        </div>
      </div>

      {/* 作品统计 */}
      <div className="mb-6">
        <div className="text-gray-600">
          共 <span className="font-semibold text-blue-600">{filteredNovels.length}</span> 部作品
          {activeTab !== 'all' && (
            <span className="ml-2">
              （{activeTab === 'published' ? '已发布' : '草稿'}）
            </span>
          )}
        </div>
      </div>

      {/* 作品列表 */}
      {filteredNovels.length > 0 ? (
        <div className="space-y-6">
          {filteredNovels.map((novel) => (
            <div key={novel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {novel.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        novel.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {novel.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {novel.description || '暂无描述'}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>📖</span>
                        <span>{novel.chapters_count || 0} 章</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>创建于 {new Date(novel.created_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span>更新于 {new Date(novel.updated_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/novels/${novel.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      阅读作品
                    </Link>
                    
                    {novel.status === 'published' ? (
                      <Link
                        href={`/novels/${novel.id}/chapters/new`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
                      >
                        续写新章
                      </Link>
                    ) : (
                      <Link
                        href={`/novels/${novel.id}/edit`}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors text-center"
                      >
                        继续创作
                      </Link>
                    )}
                    
                    <Link
                      href={`/novels/${novel.id}/edit`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      编辑信息
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* 章节管理 */}
              {novel.status === 'published' && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">章节管理</h4>
                    <Link
                      href={`/novels/${novel.id}/chapters`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      查看所有章节 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'all' 
              ? '您还没有创作任何作品'
              : activeTab === 'published'
                ? '您还没有发布任何作品'
                : '草稿箱空空如也'
            }
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {activeTab === 'drafts'
              ? '开始创作您的第一部小说吧！'
              : '创作您的第一部小说，分享给其他小读者'
            }
          </p>
          <Link
            href="/novels/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            开始创作
          </Link>
        </div>
      )}

      {/* 创作提示 */}
      {novels.length === 0 && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">创作指南</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl mb-2">1️⃣</div>
                <h4 className="font-semibold mb-2">构思故事</h4>
                <p className="text-sm text-gray-600">想一个有趣的故事情节和角色</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl mb-2">2️⃣</div>
                <h4 className="font-semibold mb-2">创作章节</h4>
                <p className="text-sm text-gray-600">为故事添加章节，可以随时保存草稿</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl mb-2">3️⃣</div>
                <h4 className="font-semibold mb-2">发布分享</h4>
                <p className="text-sm text-gray-600">发布作品，让其他小读者阅读和评论</p>
              </div>
            </div>
            <Link
              href="/novels/new"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              开始我的第一部创作
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}