'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/auth-context'

interface Comment {
  id: string
  user_username: string
  novel_title: string
  novel_id: string
  content: string
  created_at: string
  status: 'normal' | 'reported' | 'deleted'
}

export default function CommentManagementPage() {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'reported' | 'deleted'>('all')
  const [selectedComments, setSelectedComments] = useState<string[]>([])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadComments()
    }
  }, [user])

  const loadComments = async () => {
    try {
      // 这里应该调用获取所有评论的API
      // 暂时使用模拟数据
      const mockComments: Comment[] = [
        {
          id: '1',
          user_username: '小明同学',
          novel_title: '奇幻冒险记',
          novel_id: '1',
          content: '这个故事真精彩，期待下一章！',
          created_at: new Date().toISOString(),
          status: 'normal'
        },
        {
          id: '2',
          user_username: '小作家',
          novel_title: '校园秘密',
          novel_id: '2',
          content: '作者写得真好，人物刻画很生动',
          created_at: new Date().toISOString(),
          status: 'normal'
        },
        {
          id: '3',
          user_username: '匿名用户',
          novel_title: '未来世界',
          novel_id: '3',
          content: '内容涉及不当言论，已举报',
          created_at: new Date().toISOString(),
          status: 'reported'
        },
        {
          id: '4',
          user_username: '故事大王',
          novel_title: '恐龙时代',
          novel_id: '4',
          content: '已删除的评论内容',
          created_at: new Date().toISOString(),
          status: 'deleted'
        }
      ]
      setComments(mockComments)
    } catch (error) {
      console.error('加载评论数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter(comment => {
    // 搜索过滤
    if (searchTerm && 
        !comment.user_username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comment.novel_title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // 状态过滤
    if (statusFilter !== 'all' && comment.status !== statusFilter) {
      return false
    }
    
    return true
  })

  const handleSelectComment = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(filteredComments.map(comment => comment.id))
    }
  }

  const handleChangeStatus = async (commentId: string, newStatus: Comment['status']) => {
    try {
      // 这里应该调用更新评论状态的API
      const statusText = {
        normal: '正常',
        reported: '已举报',
        deleted: '已删除'
      }[newStatus]
      
      alert(`已将评论状态修改为：${statusText}`)
      
      // 更新本地状态
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      ))
    } catch (error) {
      console.error('修改评论状态失败:', error)
    }
  }

  const handleDeleteComments = async () => {
    if (selectedComments.length === 0) return
    
    if (!confirm(`确定要删除选中的 ${selectedComments.length} 条评论吗？此操作不可恢复。`)) {
      return
    }

    try {
      // 这里应该调用批量删除评论的API
      alert(`已删除 ${selectedComments.length} 条评论`)
      
      // 更新本地状态
      setComments(comments.map(comment => 
        selectedComments.includes(comment.id) 
          ? { ...comment, status: 'deleted' }
          : comment
      ))
      setSelectedComments([])
    } catch (error) {
      console.error('删除评论失败:', error)
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
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载评论数据...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">评论管理</h1>
        <p className="text-gray-600">管理用户评论内容</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户、小说或评论内容..."
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setStatusFilter('normal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                正常
              </button>
              <button
                onClick={() => setStatusFilter('reported')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'reported'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已举报
              </button>
              <button
                onClick={() => setStatusFilter('deleted')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'deleted'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已删除
              </button>
            </div>
          </div>

          {/* 批量操作 */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              已选中 <span className="font-semibold text-blue-600">{selectedComments.length}</span> 条评论
            </span>
            {selectedComments.length > 0 && (
              <button
                onClick={handleDeleteComments}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                删除选中
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 评论统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
              💬
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{comments.length}</div>
              <div className="text-sm text-gray-600">总评论数</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
              ✓
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {comments.filter(c => c.status === 'normal').length}
              </div>
              <div className="text-sm text-gray-600">正常评论</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mr-4">
              ⚠️
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {comments.filter(c => c.status === 'reported').length}
              </div>
              <div className="text-sm text-gray-600">待处理举报</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mr-4">
              🗑️
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {comments.filter(c => c.status === 'deleted').length}
              </div>
              <div className="text-sm text-gray-600">已删除评论</div>
            </div>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">评论内容</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">用户</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">所属小说</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">状态</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">时间</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-gray-800 line-clamp-2">{comment.content}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                          {comment.user_username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{comment.user_username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 hover:text-blue-600 cursor-pointer">
                        {comment.novel_title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        comment.status === 'normal'
                          ? 'bg-green-100 text-green-800'
                          : comment.status === 'reported'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {comment.status === 'normal' ? '正常' : 
                         comment.status === 'reported' ? '已举报' : '已删除'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {comment.status !== 'normal' && (
                          <button
                            onClick={() => handleChangeStatus(comment.id, 'normal')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            恢复
                          </button>
                        )}
                        {comment.status !== 'reported' && (
                          <button
                            onClick={() => handleChangeStatus(comment.id, 'reported')}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium hover:bg-orange-200 transition-colors"
                          >
                            标记举报
                          </button>
                        )}
                        {comment.status !== 'deleted' && (
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这条评论吗？此操作不可恢复。')) {
                                handleChangeStatus(comment.id, 'deleted')
                              }
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-3xl mb-3">💬</div>
                    <p className="text-gray-600">未找到符合条件的评论</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 评论管理指南 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 评论管理指南</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">✅ 允许的评论：</h4>
            <ul className="space-y-1 text-blue-600 text-sm">
              <li>• 对作品的正面评价和建议</li>
              <li>• 对故事情节的讨论</li>
              <li>• 对作者的鼓励和支持</li>
              <li>• 文明友好的交流</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-2">❌ 需要处理的评论：</h4>
            <ul className="space-y-1 text-red-600 text-sm">
              <li>• 辱骂、人身攻击内容</li>
              <li>• 广告、垃圾信息</li>
              <li>• 涉及政治敏感内容</li>
              <li>• 泄露他人隐私</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 批量操作说明 */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ 批量操作说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-700">批量审核</div>
            <div className="text-sm text-gray-500 mt-1">快速处理大量评论</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-700">导出记录</div>
            <div className="text-sm text-gray-500 mt-1">导出管理操作日志</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">🔔</div>
            <div className="font-medium text-gray-700">通知用户</div>
            <div className="text-sm text-gray-500 mt-1">发送处理结果通知</div>
          </div>
        </div>
      </div>

      {/* 处理流程 */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 评论处理流程</h3>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mb-2 mx-auto">1</div>
            <div className="font-medium">接收举报</div>
            <div className="text-sm text-gray-600">用户举报不当评论</div>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="text-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xl mb-2 mx-auto">2</div>
            <div className="font-medium">审核内容</div>
            <div className="text-sm text-gray-600">管理员审核评论内容</div>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="text-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl mb-2 mx-auto">3</div>
            <div className="font-medium">处理决定</div>
            <div className="text-sm text-gray-600">恢复、警告或删除</div>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl mb-2 mx-auto">4</div>
            <div className="font-medium">记录归档</div>
            <div className="text-sm text-gray-600">保存处理记录</div>
          </div>
        </div>
      </div>
    </div>
  )
}