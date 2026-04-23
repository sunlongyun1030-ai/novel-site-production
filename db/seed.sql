-- 创建初始管理员用户
-- 密码: admin123 (经过哈希处理)

INSERT INTO users (id, username, password_hash, role, created_at) 
VALUES 
  ('admin-001', '管理员', '$2b$10$K7L1e5r2z8M9vF6gH3j2NeQwY8xR5tV7cB2dF4gH6j8kL9mN1pQ3r5t', 'admin', CURRENT_TIMESTAMP),
  ('user-001', '小明同学', '$2b$10$K7L1e5r2z8M9vF6gH3j2NeQwY8xR5tV7cB2dF4gH6j8kL9mN1pQ3r5t', 'user', CURRENT_TIMESTAMP),
  ('user-002', '小作家', '$2b$10$K7L1e5r2z8M9vF6gH3j2NeQwY8xR5tV7cB2dF4gH6j8kL9mN1pQ3r5t', 'user', CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

-- 创建一些示例小说
INSERT INTO novels (id, title, description, author_id, author_username, status, created_at) 
VALUES 
  ('novel-001', '奇幻冒险记', '一个关于勇气和友谊的奇幻故事', 'admin-001', '管理员', 'published', CURRENT_TIMESTAMP),
  ('novel-002', '校园秘密', '发生在小学校园里的神秘事件', 'user-001', '小明同学', 'published', CURRENT_TIMESTAMP),
  ('novel-003', '未来世界', '探索科技发展的未来世界', 'user-002', '小作家', 'draft', CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

-- 为第一本小说添加章节
INSERT INTO chapters (id, novel_id, title, content, chapter_number, created_at) 
VALUES 
  ('chap-001', 'novel-001', '第一章：神秘的邀请', '在一个阳光明媚的早晨，小明收到了一封神秘的信...', 1, CURRENT_TIMESTAMP),
  ('chap-002', 'novel-001', '第二章：奇幻森林', '小明跟着信中的指示，来到了一个充满魔法的森林...', 2, CURRENT_TIMESTAMP),
  ('chap-003', 'novel-001', '第三章：新朋友', '在森林里，小明遇到了一只会说话的小狐狸...', 3, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

-- 添加一些示例评论
INSERT INTO comments (id, novel_id, user_id, user_username, content, created_at) 
VALUES 
  ('comm-001', 'novel-001', 'user-001', '小明同学', '这个故事真精彩！期待下一章！', CURRENT_TIMESTAMP),
  ('comm-002', 'novel-001', 'user-002', '小作家', '作者写得真好，人物刻画很生动', CURRENT_TIMESTAMP),
  ('comm-003', 'novel-002', 'admin-001', '管理员', '校园故事很有趣，让我想起了自己的学校生活', CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;