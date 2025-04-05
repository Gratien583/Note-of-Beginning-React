## 📦 Technologies Used

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📦 Database Schema
```sql
-- accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- blogs table
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    thumbnail TEXT,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- blog_categories table
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

## 🔗 関連プロジェクト

- 📄 ローカルストレージ版  
  [https://github.com/Gratien583/Note-of-Beginning](https://github.com/Gratien583/Note-of-Beginning)  

- ⚛️ React + Supabase (β)：フロントエンドを React、バックエンドに Supabase を使用 （このリポジトリ） 

- 🐘 PHP + MySQL 版：サーバーサイドを PHP、データ保存に MySQL を使用  
  [https://github.com/Gratien583/Note-of-Beginning-PHP](https://github.com/Gratien583/Note-of-Beginning-PHP)  

- 🐳 Docker 対応版 (β)  
  [https://github.com/Gratien583/Note-of-Beginning-Docker](https://github.com/Gratien583/Note-of-Beginning-Docker)
