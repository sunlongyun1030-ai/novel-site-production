// 临时类型定义，避免依赖问题
interface D1Database {
  prepare(query: string): any
  batch(statements: any[]): Promise<any>
  exec(query: string): Promise<any>
}

export interface User {
  id: string
  username: string
  password_hash: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Novel {
  id: string
  title: string
  description: string | null
  author_id: string
  author_username: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  novel_id: string
  title: string
  content: string
  chapter_number: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  novel_id: string
  user_id: string
  user_username: string
  content: string
  created_at: string
}

export interface Draft {
  id: string
  user_id: string
  novel_id: string | null
  title: string
  content: string
  type: 'novel' | 'chapter'
  created_at: string
  updated_at: string
}

export class Database {
  constructor(private db: D1Database) {}

  // 用户相关操作
  async createUser(username: string, passwordHash: string): Promise<User> {
    const id = crypto.randomUUID()
    const result = await this.db.prepare(`
      INSERT INTO users (id, username, password_hash, role)
      VALUES (?, ?, ?, 'user')
      RETURNING *
    `).bind(id, username, passwordHash).first()
    return result as User
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first()
    return result as User | null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE username = ?
    `).bind(username).first()
    return result as User | null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = []
    const values = []
    
    if (updates.username) {
      fields.push('username = ?')
      values.push(updates.username)
    }
    if (updates.password_hash) {
      fields.push('password_hash = ?')
      values.push(updates.password_hash)
    }
    if (updates.role) {
      fields.push('role = ?')
      values.push(updates.role)
    }
    
    if (fields.length === 0) return null
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const result = await this.db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
      RETURNING *
    `).bind(...values).first()
    
    return result as User | null
  }

  // 小说相关操作
  async createNovel(novel: Omit<Novel, 'id' | 'created_at' | 'updated_at'>): Promise<Novel> {
    const id = crypto.randomUUID()
    const result = await this.db.prepare(`
      INSERT INTO novels (id, title, description, author_id, author_username, status)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      id,
      novel.title,
      novel.description,
      novel.author_id,
      novel.author_username,
      novel.status
    ).first()
    return result as Novel
  }

  async getNovelById(id: string): Promise<Novel | null> {
    const result = await this.db.prepare(`
      SELECT * FROM novels WHERE id = ?
    `).bind(id).first()
    return result as Novel | null
  }

  async getNovels(limit = 50, offset = 0): Promise<Novel[]> {
    const result = await this.db.prepare(`
      SELECT * FROM novels 
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()
    return result.results as Novel[]
  }

  async getNovelsByAuthor(authorId: string): Promise<Novel[]> {
    const result = await this.db.prepare(`
      SELECT * FROM novels 
      WHERE author_id = ?
      ORDER BY created_at DESC
    `).bind(authorId).all()
    return result.results as Novel[]
  }

  async updateNovel(id: string, updates: Partial<Novel>): Promise<Novel | null> {
    const fields = []
    const values = []
    
    if (updates.title) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.status) {
      fields.push('status = ?')
      values.push(updates.status)
    }
    
    if (fields.length === 0) return null
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const result = await this.db.prepare(`
      UPDATE novels SET ${fields.join(', ')} WHERE id = ?
      RETURNING *
    `).bind(...values).first()
    
    return result as Novel | null
  }

  async deleteNovel(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM novels WHERE id = ?
    `).bind(id).run()
    return result.success
  }

  // 章节相关操作
  async createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
    const id = crypto.randomUUID()
    const result = await this.db.prepare(`
      INSERT INTO chapters (id, novel_id, title, content, chapter_number)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      id,
      chapter.novel_id,
      chapter.title,
      chapter.content,
      chapter.chapter_number
    ).first()
    return result as Chapter
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const result = await this.db.prepare(`
      SELECT * FROM chapters WHERE id = ?
    `).bind(id).first()
    return result as Chapter | null
  }

  async getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
    const result = await this.db.prepare(`
      SELECT * FROM chapters 
      WHERE novel_id = ?
      ORDER BY chapter_number ASC
    `).bind(novelId).all()
    return result.results as Chapter[]
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    const fields = []
    const values = []
    
    if (updates.title) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.content) {
      fields.push('content = ?')
      values.push(updates.content)
    }
    if (updates.chapter_number !== undefined) {
      fields.push('chapter_number = ?')
      values.push(updates.chapter_number)
    }
    
    if (fields.length === 0) return null
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const result = await this.db.prepare(`
      UPDATE chapters SET ${fields.join(', ')} WHERE id = ?
      RETURNING *
    `).bind(...values).first()
    
    return result as Chapter | null
  }

  async deleteChapter(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM chapters WHERE id = ?
    `).bind(id).run()
    return result.success
  }

  // 评论相关操作
  async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
    const id = crypto.randomUUID()
    const result = await this.db.prepare(`
      INSERT INTO comments (id, novel_id, user_id, user_username, content)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      id,
      comment.novel_id,
      comment.user_id,
      comment.user_username,
      comment.content
    ).first()
    return result as Comment
  }

  async getCommentsByNovelId(novelId: string): Promise<Comment[]> {
    const result = await this.db.prepare(`
      SELECT * FROM comments 
      WHERE novel_id = ?
      ORDER BY created_at DESC
    `).bind(novelId).all()
    return result.results as Comment[]
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM comments WHERE id = ?
    `).bind(id).run()
    return result.success
  }

  // 草稿相关操作
  async createDraft(draft: Omit<Draft, 'id' | 'created_at' | 'updated_at'>): Promise<Draft> {
    const id = crypto.randomUUID()
    const result = await this.db.prepare(`
      INSERT INTO drafts (id, user_id, novel_id, title, content, type)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      id,
      draft.user_id,
      draft.novel_id,
      draft.title,
      draft.content,
      draft.type
    ).first()
    return result as Draft
  }

  async getDraftsByUserId(userId: string): Promise<Draft[]> {
    const result = await this.db.prepare(`
      SELECT * FROM drafts 
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).bind(userId).all()
    return result.results as Draft[]
  }

  async getDraftById(id: string): Promise<Draft | null> {
    const result = await this.db.prepare(`
      SELECT * FROM drafts WHERE id = ?
    `).bind(id).first()
    return result as Draft | null
  }

  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft | null> {
    const fields = []
    const values = []
    
    if (updates.title) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.content) {
      fields.push('content = ?')
      values.push(updates.content)
    }
    if (updates.novel_id !== undefined) {
      fields.push('novel_id = ?')
      values.push(updates.novel_id)
    }
    
    if (fields.length === 0) return null
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const result = await this.db.prepare(`
      UPDATE drafts SET ${fields.join(', ')} WHERE id = ?
      RETURNING *
    `).bind(...values).first()
    
    return result as Draft | null
  }

  async deleteDraft(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM drafts WHERE id = ?
    `).bind(id).run()
    return result.success
  }

  // 统计相关
  async getStats(): Promise<{
    totalNovels: number
    totalChapters: number
    totalComments: number
    totalUsers: number
  }> {
    const novelsResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM novels WHERE status = 'published'
    `).first()
    
    const chaptersResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM chapters
    `).first()
    
    const commentsResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM comments
    `).first()
    
    const usersResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first()
    
    return {
      totalNovels: novelsResult?.count || 0,
      totalChapters: chaptersResult?.count || 0,
      totalComments: commentsResult?.count || 0,
      totalUsers: usersResult?.count || 0,
    }
  }
}