'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/auth-context'

interface Novel {
  id: string
  title: string
  description: string | null
  author_id: string
  author_username: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

interface Chapter {
  id: string
  title: string
  chapter_number: number
  created_at: string
}

interface Comment {
  id: string
  user_username: string
  content: string
  created_at: string
}

export default function NovelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const novelId = params.id as string
  
  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChapter, setActiveChapter] = useState<number>(1)
  const [chapterContent, setChapterContent] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (novelId) {
      loadNovelData()
    }
  }, [novelId])

  const loadNovelData = async () => {
    try {
      // 加载小说信息、章节和评论
      const novelRes = await fetch(`/api/novels/${novelId}`)
      if (novelRes.ok) {
        const data = await novelRes.json()
        if (data.success) {
          setNovel(data.novel)
          setIsOwner(user?.id === data.novel.author_id)
          
          // 设置章节列表
          setChapters(data.novel.chapters || [])
          
          // 设置评论列表
          setComments(data.novel.comments || [])
          
          // 加载第一章内容
          if (data.novel.chapters && data.novel.chapters.length > 0) {
            setChapterContent(data.novel.chapters[0].content)
            setActiveChapter(data.novel.chapters[0].chapter_number)
          }
        }
      }
    } catch (error) {
      console.error('加载小说数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChapterContent = async (chapterId: string) => {
    try {
      // 从已加载的章节中查找内容
      const chapter = chapters.find(chap => chap.id === chapterId)
      if (chapter) {
        // 这里需要获取完整的章节内容
        const res = await fetch(`/api/chapters/${chapterId}`)
        if (res.ok) {
          const chapterData = await res.json()
          if (chapterData.success) {
            setChapterContent(chapterData.chapter.content)
            setActiveChapter(chapterData.chapter.chapter_number)
          }
        }
      }
    } catch (error) {
      console.error('加载章节内容失败:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !novel) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novel_id: novel.id,
          user_id: user.id,
          user_username: user.username,
          content: newComment
        })
      })

      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          // 添加新评论到列表
          setComments([result.comment, ...comments])
          setNewComment('')
        }
      }
    } catch (error) {
      console.error('发表评论失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载小说内容...</div>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">小说不存在</h2>
          <p className="text-gray-600 mb-6">您访问的小说可能已被删除或不存在</p>
          <Link
            href="/novels"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回作品库
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 小说头部信息 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{novel.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center">
                <span className="mr-1">👤</span>
                {novel.author_username}
              </span>
              <span className="flex items-center">
                <span className="mr-1">📅</span>
                {new Date(novel.created_at).toLocaleDateString('zh-CN')}
              </span>
              {novel.status === 'draft' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  草稿
                </span>
              )}
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-3">
              <Link
                href={`/novels/${novelId}/edit`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                编辑信息
              </Link>
              <Link
                href={`/novels/${novelId}/chapters/new`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                续写新章
              </Link>
            </div>
          )}
        </div>

        {novel.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">故事简介</h3>
            <p className="text-blue-700 leading-relaxed">{novel.description}</p>
          </div>
        )}
      </div>

      {/* 主要内容区域 - 左右布局 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧：章节列表 */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">章节列表</h3>
              {chapters.length > 0 ? (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => loadChapterContent(chapter.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeChapter === chapter.chapter_number
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{chapter.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        第 {chapter.chapter_number} 章
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">📝</div>
                  <p className="text-gray-600">暂无章节</p>
                  {isOwner && (
                    <Link
                      href={`/novels/${novelId}/chapters/new`}
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      添加第一章
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            {/* 作者操作区域 */}
            {isOwner && (
              <div className="p-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">作者操作</h4>
                <div className="space-y-2">
                  <Link
                    href={`/novels/${novelId}/chapters/new`}
                    className="block w-full text-center py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    续写新章节
                  </Link>
                  <Link
                    href={`/novels/${novelId}/chapters`}
                    className="block w-full text-center py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    管理所有章节
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：章节内容和评论 */}
        <div className="lg:w-3/4">
          {/* 章节内容 */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {chapters.find(c => c.chapter_number === activeChapter)?.title || '选择章节'}
                </h3>
                <div className="text-gray-600">
                  第 {activeChapter} 章
                  {chapters.length > 0 && ` / 共 ${chapters.length} 章`}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {chapterContent ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-800 font-serif text-lg">
                    {chapterContent.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph || <br />}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📖</div>
                  <p className="text-gray-600">请从左侧选择章节开始阅读</p>
                </div>
              )}
            </div>

            {/* 章节导航 */}
            {chapters.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      const prevChapter = chapters.find(c => c.chapter_number === activeChapter - 1)
                      if (prevChapter) loadChapterContent(prevChapter.id)
                    }}
                    disabled={activeChapter <= 1}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 上一章
                  </button>
                  
                  <div className="text-gray-600">
                    {activeChapter} / {chapters.length}
                  </div>
                  
                  <button
                    onClick={() => {
                      const nextChapter = chapters.find(c => c.chapter_number === activeChapter + 1)
                      if (nextChapter) loadChapterContent(nextChapter.id)
                    }}
                    disabled={activeChapter >= chapters.length}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一章 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 评论区域 */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">读者评论</h3>
              <p className="text-gray-600">分享您的阅读感受</p>
            </div>
            
            {/* 发表评论 */}
            {user ? (
              <div className="p-6 border-b border-gray-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下您的评论..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    文明发言，尊重作者和其他读者
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    发表评论
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b border-gray-200 text-center">
                <p className="text-gray-600 mb-4">登录后即可发表评论</p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    立即登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    注册账号
                  </Link>
                </div>
              </div>
            )}

            {/* 评论列表 */}
            <div className="p-6">
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
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
                      <p className="text-gray-800 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-600">还没有评论，快来发表第一条评论吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}