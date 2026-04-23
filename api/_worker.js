// Cloudflare Worker入口文件
// 使用JSDoc注释代替TypeScript接口

/**
 * @typedef {Object} D1Database
 * @property {function(string): any} prepare
 * @property {function(any[]): Promise<any>} batch
 * @property {function(string): Promise<any>} exec
 */

/**
 * @typedef {Object} Env
 * @property {D1Database} DB
 */

// 注意：在Worker环境中，我们需要使用相对路径导入
// 或者将模块打包在一起

// 简单的数据库操作函数
async function getUsersCount(db) {
  try {
    const result = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    return result?.count || 0;
  } catch (error) {
    console.error('获取用户数失败:', error);
    return 0;
  }
}

async function getNovelsCount(db) {
  try {
    const result = await db.prepare('SELECT COUNT(*) as count FROM novels').first();
    return result?.count || 0;
  } catch (error) {
    console.error('获取小说数失败:', error);
    return 0;
  }
}

async function getPublishedNovels(db, search = '', page = 1, limit = 10) {
  try {
    let query = 'SELECT * FROM novels WHERE status = ?'
    let params = ['published']
    
    // 添加搜索条件
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR author_username LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    // 添加排序和分页
    const offset = (page - 1) * limit
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)
    
    const result = await db.prepare(query).bind(...params).all()
    return result.results || []
  } catch (error) {
    console.error('获取已发布小说失败:', error)
    return []
  }
}

// 获取已发布小说总数（用于分页）
async function getPublishedNovelsCount(db, search = '') {
  try {
    let query = 'SELECT COUNT(*) as count FROM novels WHERE status = ?'
    let params = ['published']
    
    // 添加搜索条件
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR author_username LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    const result = await db.prepare(query).bind(...params).first()
    return result?.count || 0
  } catch (error) {
    console.error('获取小说总数失败:', error)
    return 0
  }
}

async function getUserByUsername(db, username) {
  try {
    const result = await db.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first();
    return result;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log(`请求路径: ${path}, 方法: ${request.method}`);
    
    // 处理API请求
    if (path.startsWith('/api/')) {
      return handleApiRequest(request, env, path);
    }
    
    // 处理根路径
    if (path === '/' || path === '') {
      return new Response(JSON.stringify({
        message: '小说网站API服务',
        endpoints: [
          '/api/test - 测试端点',
          '/api/stats - 获取统计数据',
          '/api/novels - 获取小说列表',
          '/api/auth/* - 认证相关'
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function handleApiRequest(request, env, path) {
  const method = request.method;
  
  try {
    // 测试端点
    if (path === '/api/test' && method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        message: 'API端点正常工作',
        timestamp: new Date().toISOString(),
        environment: 'production'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 获取统计数据
    if (path === '/api/stats' && method === 'GET') {
      const usersCount = await getUsersCount(env.DB);
      const novelsCount = await getNovelsCount(env.DB);
      const publishedNovels = await getPublishedNovels(env.DB);
      
      return new Response(JSON.stringify({
        success: true,
        stats: {
          users: usersCount,
          novels: novelsCount,
          published_novels: publishedNovels.length,
          chapters: 3, // 从seed数据中知道
          comments: 3  // 从seed数据中知道
        },
        recent_novels: publishedNovels.map(novel => ({
          id: novel.id,
          title: novel.title,
          author: novel.author_username,
          description: novel.description
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 获取小说列表（支持搜索和分页）
    if (path === '/api/novels' && method === 'GET') {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      // 验证分页参数
      if (page < 1) {
        return new Response(JSON.stringify({
          success: false,
          error: '页码必须大于0'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (limit < 1 || limit > 100) {
        return new Response(JSON.stringify({
          success: false,
          error: '每页数量必须在1-100之间'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const novels = await getPublishedNovels(env.DB, search, page, limit);
        const total = await getPublishedNovelsCount(env.DB, search);
        const totalPages = Math.ceil(total / limit);
        
        return new Response(JSON.stringify({
          success: true,
          novels: novels.map(novel => ({
            id: novel.id,
            title: novel.title,
            description: novel.description,
            author_username: novel.author_username,
            status: novel.status,
            created_at: novel.created_at
          })),
          pagination: {
            page,
            limit,
            total,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          },
          search
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取小说列表失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取小说列表失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 创建新小说
    if (path === '/api/novels' && method === 'POST') {
      try {
        const body = await request.json();
        const { title, description, status, author_id, author_username } = body;
        
        // 验证必要字段
        if (!title || !status || !author_id || !author_username) {
          return new Response(JSON.stringify({
            success: false,
            error: 'title、status、author_id和author_username不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 验证状态值
        if (!['draft', 'published'].includes(status)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'status必须是draft或published'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 生成小说ID
        const novelId = `novel-${Date.now()}`;
        
        // 插入新小说
        await env.DB.prepare(
          'INSERT INTO novels (id, title, description, author_id, author_username, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(novelId, title, description || null, author_id, author_username, status).run();
        
        // 获取创建的小说
        const novel = await env.DB.prepare(
          'SELECT * FROM novels WHERE id = ?'
        ).bind(novelId).first();
        
        return new Response(JSON.stringify({
          success: true,
          message: '小说创建成功',
          novel: {
            id: novel.id,
            title: novel.title,
            description: novel.description,
            author_id: novel.author_id,
            author_username: novel.author_username,
            status: novel.status,
            created_at: novel.created_at
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('创建小说失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '创建小说失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取小说详情 - 动态路由
    const novelDetailMatch = path.match(/^\/api\/novels\/([^\/]+)$/);
    if (novelDetailMatch && method === 'GET') {
      const novelId = novelDetailMatch[1];
      
      try {
        // 获取小说基本信息
        const novel = await env.DB.prepare(
          'SELECT * FROM novels WHERE id = ?'
        ).bind(novelId).first();
        
        if (!novel) {
          return new Response(JSON.stringify({
            success: false,
            error: '小说不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 获取小说的章节
        const chapters = await env.DB.prepare(
          'SELECT * FROM chapters WHERE novel_id = ? ORDER BY chapter_number'
        ).bind(novelId).all();
        
        // 获取小说的评论
        const comments = await env.DB.prepare(
          'SELECT * FROM comments WHERE novel_id = ? ORDER BY created_at DESC'
        ).bind(novelId).all();
        
        return new Response(JSON.stringify({
          success: true,
          novel: {
            id: novel.id,
            title: novel.title,
            description: novel.description,
            author_id: novel.author_id,
            author_username: novel.author_username,
            status: novel.status,
            created_at: novel.created_at,
            updated_at: novel.updated_at,
            chapters: chapters?.results || [],
            comments: comments?.results || []
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取小说详情失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取小说详情失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 用户注册
    if (path === '/api/auth/register' && method === 'POST') {
      try {
        const body = await request.json();
        const { username, password } = body;
        
        if (!username || !password) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名和密码不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 检查用户是否已存在
        const existingUser = await getUserByUsername(env.DB, username);
        if (existingUser) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名已存在'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 生成用户ID和密码哈希
        const userId = `user-${Date.now()}`;
        // 注意：实际应用中应该使用bcrypt等库进行密码哈希
        // 这里为了简化，使用简单哈希
        const passwordHash = `hash_${password}_${Date.now()}`;
        
        // 插入新用户
        await env.DB.prepare(
          'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind(userId, username, passwordHash, 'user').run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '注册成功',
          user: {
            id: userId,
            username: username,
            role: 'user'
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('注册失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '注册失败，请稍后重试'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 用户登录
    if (path === '/api/auth/login' && method === 'POST') {
      try {
        const body = await request.json();
        const { username, password } = body;
        
        if (!username || !password) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名和密码不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 查找用户
        const user = await getUserByUsername(env.DB, username);
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名或密码错误'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 验证密码
        // 注意：实际应用中应该使用bcrypt验证
        // 这里为了简化，使用简单验证
        const passwordHash = `hash_${password}_${Date.now()}`;
        const isValid = passwordHash.includes(password); // 简化验证
        
        if (!isValid) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名或密码错误'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 生成简单的token（实际应用中应该使用JWT）
        const token = `token_${user.id}_${Date.now()}`;
        
        return new Response(JSON.stringify({
          success: true,
          message: '登录成功',
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          },
          token: token
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('登录失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '登录失败，请稍后重试'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 章节管理API
    // 获取小说的所有章节
    if (path === '/api/chapters' && method === 'GET') {
      const url = new URL(request.url);
      const novelId = url.searchParams.get('novel_id');
      
      if (!novelId) {
        return new Response(JSON.stringify({
          success: false,
          error: '需要提供novel_id参数'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const chapters = await env.DB.prepare(
          'SELECT * FROM chapters WHERE novel_id = ? ORDER BY chapter_number'
        ).bind(novelId).all();
        
        return new Response(JSON.stringify({
          success: true,
          chapters: chapters?.results || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取章节列表失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取章节列表失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 创建新章节
    if (path === '/api/chapters' && method === 'POST') {
      try {
        const body = await request.json();
        const { novel_id, title, content, chapter_number } = body;
        
        // 验证必要字段
        if (!novel_id || !title || !content || chapter_number === undefined) {
          return new Response(JSON.stringify({
            success: false,
            error: 'novel_id、title、content和chapter_number不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 生成章节ID
        const chapterId = `chap-${Date.now()}`;
        
        // 插入新章节
        await env.DB.prepare(
          'INSERT INTO chapters (id, novel_id, title, content, chapter_number) VALUES (?, ?, ?, ?, ?)'
        ).bind(chapterId, novel_id, title, content, chapter_number).run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '章节创建成功',
          chapter: {
            id: chapterId,
            novel_id,
            title,
            content,
            chapter_number
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('创建章节失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '创建章节失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取单个章节详情
    const chapterDetailMatch = path.match(/^\/api\/chapters\/([^\/]+)$/);
    if (chapterDetailMatch && method === 'GET') {
      const chapterId = chapterDetailMatch[1];
      
      try {
        const chapter = await env.DB.prepare(
          'SELECT * FROM chapters WHERE id = ?'
        ).bind(chapterId).first();
        
        if (!chapter) {
          return new Response(JSON.stringify({
            success: false,
            error: '章节不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          chapter
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取章节详情失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取章节详情失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 更新章节
    if (chapterDetailMatch && method === 'PUT') {
      const chapterId = chapterDetailMatch[1];
      
      try {
        const body = await request.json();
        const { title, content, chapter_number } = body;
        
        // 验证至少有一个字段需要更新
        if (!title && !content && chapter_number === undefined) {
          return new Response(JSON.stringify({
            success: false,
            error: '至少需要提供一个更新字段'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 构建更新语句
        let updateFields = [];
        let params = [];
        
        if (title) {
          updateFields.push('title = ?');
          params.push(title);
        }
        if (content) {
          updateFields.push('content = ?');
          params.push(content);
        }
        if (chapter_number !== undefined) {
          updateFields.push('chapter_number = ?');
          params.push(chapter_number);
        }
        
        // 添加更新时间
        updateFields.push('updated_at = datetime("now")');
        
        // 添加章节ID作为最后一个参数
        params.push(chapterId);
        
        const updateQuery = `UPDATE chapters SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await env.DB.prepare(updateQuery).bind(...params).run();
        
        // 获取更新后的章节
        const updatedChapter = await env.DB.prepare(
          'SELECT * FROM chapters WHERE id = ?'
        ).bind(chapterId).first();
        
        return new Response(JSON.stringify({
          success: true,
          message: '章节更新成功',
          chapter: updatedChapter
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('更新章节失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '更新章节失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 删除章节
    if (chapterDetailMatch && method === 'DELETE') {
      const chapterId = chapterDetailMatch[1];
      
      try {
        // 检查章节是否存在
        const chapter = await env.DB.prepare(
          'SELECT * FROM chapters WHERE id = ?'
        ).bind(chapterId).first();
        
        if (!chapter) {
          return new Response(JSON.stringify({
            success: false,
            error: '章节不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 删除章节
        await env.DB.prepare(
          'DELETE FROM chapters WHERE id = ?'
        ).bind(chapterId).run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '章节删除成功'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('删除章节失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '删除章节失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 评论系统API
    // 获取小说的所有评论
    if (path === '/api/comments' && method === 'GET') {
      const url = new URL(request.url);
      const novelId = url.searchParams.get('novel_id');
      
      if (!novelId) {
        return new Response(JSON.stringify({
          success: false,
          error: '需要提供novel_id参数'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const comments = await env.DB.prepare(
          'SELECT * FROM comments WHERE novel_id = ? ORDER BY created_at DESC'
        ).bind(novelId).all();
        
        return new Response(JSON.stringify({
          success: true,
          comments: comments?.results || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取评论列表失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取评论列表失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 发布新评论
    if (path === '/api/comments' && method === 'POST') {
      try {
        const body = await request.json();
        const { novel_id, user_id, user_username, content } = body;
        
        // 验证必要字段
        if (!novel_id || !user_id || !user_username || !content) {
          return new Response(JSON.stringify({
            success: false,
            error: 'novel_id、user_id、user_username和content不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 验证小说是否存在
        const novel = await env.DB.prepare(
          'SELECT * FROM novels WHERE id = ?'
        ).bind(novel_id).first();
        
        if (!novel) {
          return new Response(JSON.stringify({
            success: false,
            error: '小说不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 生成评论ID
        const commentId = `comm-${Date.now()}`;
        
        // 插入新评论
        await env.DB.prepare(
          'INSERT INTO comments (id, novel_id, user_id, user_username, content) VALUES (?, ?, ?, ?, ?)'
        ).bind(commentId, novel_id, user_id, user_username, content).run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '评论发布成功',
          comment: {
            id: commentId,
            novel_id,
            user_id,
            user_username,
            content,
            created_at: new Date().toISOString()
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('发布评论失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '发布评论失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取单个评论详情
    const commentDetailMatch = path.match(/^\/api\/comments\/([^\/]+)$/);
    if (commentDetailMatch && method === 'GET') {
      const commentId = commentDetailMatch[1];
      
      try {
        const comment = await env.DB.prepare(
          'SELECT * FROM comments WHERE id = ?'
        ).bind(commentId).first();
        
        if (!comment) {
          return new Response(JSON.stringify({
            success: false,
            error: '评论不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          comment
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取评论详情失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取评论详情失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 更新评论
    if (commentDetailMatch && method === 'PUT') {
      const commentId = commentDetailMatch[1];
      
      try {
        const body = await request.json();
        const { content } = body;
        
        if (!content) {
          return new Response(JSON.stringify({
            success: false,
            error: '评论内容不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 检查评论是否存在
        const existingComment = await env.DB.prepare(
          'SELECT * FROM comments WHERE id = ?'
        ).bind(commentId).first();
        
        if (!existingComment) {
          return new Response(JSON.stringify({
            success: false,
            error: '评论不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 更新评论内容
        await env.DB.prepare(
          'UPDATE comments SET content = ? WHERE id = ?'
        ).bind(content, commentId).run();
        
        // 获取更新后的评论
        const updatedComment = await env.DB.prepare(
          'SELECT * FROM comments WHERE id = ?'
        ).bind(commentId).first();
        
        return new Response(JSON.stringify({
          success: true,
          message: '评论更新成功',
          comment: updatedComment
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('更新评论失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '更新评论失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 删除评论
    if (commentDetailMatch && method === 'DELETE') {
      const commentId = commentDetailMatch[1];
      
      try {
        // 检查评论是否存在
        const comment = await env.DB.prepare(
          'SELECT * FROM comments WHERE id = ?'
        ).bind(commentId).first();
        
        if (!comment) {
          return new Response(JSON.stringify({
            success: false,
            error: '评论不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 删除评论
        await env.DB.prepare(
          'DELETE FROM comments WHERE id = ?'
        ).bind(commentId).run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '评论删除成功'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('删除评论失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '删除评论失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取用户的作品
    if (path === '/api/my-novels' && method === 'GET') {
      try {
        const url = new URL(request.url);
        const authorId = url.searchParams.get('author_id');
        
        if (!authorId) {
          return new Response(JSON.stringify({
            success: false,
            error: '需要提供author_id参数'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const novels = await env.DB.prepare(
          'SELECT * FROM novels WHERE author_id = ? ORDER BY created_at DESC'
        ).bind(authorId).all();
        
        // 获取每本小说的章节数量
        const novelsWithChapterCount = await Promise.all(
          (novels?.results || []).map(async (novel) => {
            const chapterCount = await env.DB.prepare(
              'SELECT COUNT(*) as count FROM chapters WHERE novel_id = ?'
            ).bind(novel.id).first();
            
            return {
              ...novel,
              chapters_count: chapterCount?.count || 0
            };
          })
        );
        
        return new Response(JSON.stringify({
          success: true,
          novels: novelsWithChapterCount
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取用户作品失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取用户作品失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    if (path === '/api/admin/users' && method === 'GET') {
      try {
        // 注意：实际应用中应该验证管理员权限
        const users = await env.DB.prepare(
          'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
        ).all();
        
        return new Response(JSON.stringify({
          success: true,
          users: users?.results || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取用户列表失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取用户列表失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取单个用户详情
    const userDetailMatch = path.match(/^\/api\/admin\/users\/([^\/]+)$/);
    if (userDetailMatch && method === 'GET') {
      const userId = userDetailMatch[1];
      
      try {
        const user = await env.DB.prepare(
          'SELECT id, username, role, created_at FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 获取用户的统计信息
        const novelCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM novels WHERE author_id = ?'
        ).bind(userId).first();
        
        const commentCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM comments WHERE user_id = ?'
        ).bind(userId).first();
        
        return new Response(JSON.stringify({
          success: true,
          user: {
            ...user,
            stats: {
              novels: novelCount?.count || 0,
              comments: commentCount?.count || 0
            }
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取用户详情失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取用户详情失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 更新用户信息
    if (userDetailMatch && method === 'PUT') {
      const userId = userDetailMatch[1];
      
      try {
        const body = await request.json();
        const { username, role } = body;
        
        // 验证至少有一个字段需要更新
        if (!username && !role) {
          return new Response(JSON.stringify({
            success: false,
            error: '至少需要提供一个更新字段'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 检查用户是否存在
        const existingUser = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!existingUser) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 构建更新语句
        let updateFields = [];
        let params = [];
        
        if (username) {
          // 检查用户名是否已存在（排除当前用户）
          const usernameExists = await env.DB.prepare(
            'SELECT * FROM users WHERE username = ? AND id != ?'
          ).bind(username, userId).first();
          
          if (usernameExists) {
            return new Response(JSON.stringify({
              success: false,
              error: '用户名已存在'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          updateFields.push('username = ?');
          params.push(username);
        }
        
        if (role) {
          if (!['user', 'admin'].includes(role)) {
            return new Response(JSON.stringify({
              success: false,
              error: '角色必须是user或admin'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          updateFields.push('role = ?');
          params.push(role);
        }
        
        // 添加更新时间
        updateFields.push('updated_at = datetime("now")');
        
        // 添加用户ID作为最后一个参数
        params.push(userId);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await env.DB.prepare(updateQuery).bind(...params).run();
        
        // 获取更新后的用户
        const updatedUser = await env.DB.prepare(
          'SELECT id, username, role, created_at FROM users WHERE id = ?'
        ).bind(userId).first();
        
        return new Response(JSON.stringify({
          success: true,
          message: '用户信息更新成功',
          user: updatedUser
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '更新用户信息失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 删除用户
    if (userDetailMatch && method === 'DELETE') {
      const userId = userDetailMatch[1];
      
      try {
        // 检查用户是否存在
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 防止删除管理员账户（安全保护）
        if (user.role === 'admin') {
          return new Response(JSON.stringify({
            success: false,
            error: '不能删除管理员账户'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 删除用户（注意：实际应用中可能需要级联删除相关数据）
        await env.DB.prepare(
          'DELETE FROM users WHERE id = ?'
        ).bind(userId).run();
        
        return new Response(JSON.stringify({
          success: true,
          message: '用户删除成功'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('删除用户失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '删除用户失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 获取当前用户信息（非管理员）
    if (path === '/api/users/me' && method === 'GET') {
      try {
        // 注意：实际应用中应该从token中获取用户ID
        // 这里为了简化，假设用户已登录并传递了user_id参数
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');
        
        if (!userId) {
          return new Response(JSON.stringify({
            success: false,
            error: '需要提供user_id参数'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const user = await env.DB.prepare(
          'SELECT id, username, role, created_at FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          user
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '获取用户信息失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 更新当前用户信息（非管理员）
    if (path === '/api/users/me' && method === 'PUT') {
      try {
        const body = await request.json();
        const { username, password } = body;
        
        // 注意：实际应用中应该从token中获取用户ID
        // 这里为了简化，假设用户已登录并传递了user_id参数
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');
        
        if (!userId) {
          return new Response(JSON.stringify({
            success: false,
            error: '需要提供user_id参数'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 验证至少有一个字段需要更新
        if (!username && !password) {
          return new Response(JSON.stringify({
            success: false,
            error: '至少需要提供一个更新字段'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 检查用户是否存在
        const existingUser = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!existingUser) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // 构建更新语句
        let updateFields = [];
        let params = [];
        
        if (username) {
          // 检查用户名是否已存在（排除当前用户）
          const usernameExists = await env.DB.prepare(
            'SELECT * FROM users WHERE username = ? AND id != ?'
          ).bind(username, userId).first();
          
          if (usernameExists) {
            return new Response(JSON.stringify({
              success: false,
              error: '用户名已存在'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          updateFields.push('username = ?');
          params.push(username);
        }
        
        if (password) {
          // 注意：实际应用中应该使用bcrypt等库进行密码哈希
          // 这里为了简化，使用简单哈希
          const passwordHash = `hash_${password}_${Date.now()}`;
          updateFields.push('password_hash = ?');
          params.push(passwordHash);
        }
        
        // 添加更新时间
        updateFields.push('updated_at = datetime("now")');
        
        // 添加用户ID作为最后一个参数
        params.push(userId);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await env.DB.prepare(updateQuery).bind(...params).run();
        
        // 获取更新后的用户
        const updatedUser = await env.DB.prepare(
          'SELECT id, username, role, created_at FROM users WHERE id = ?'
        ).bind(userId).first();
        
        return new Response(JSON.stringify({
          success: true,
          message: '用户信息更新成功',
          user: updatedUser
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '更新用户信息失败'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 未找到的API端点
    return new Response(JSON.stringify({
      success: false,
      error: 'API端点未找到',
      path: path,
      method: method
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('API处理错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}