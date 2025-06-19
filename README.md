## 📦 Technologies Used

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📦 Database Schema
```sql
-- ユーザーアカウント
create table accounts (
  id uuid primary key default gen_random_uuid(),
  username varchar not null,
  password text not null,
  created_at timestamptz default now()
);

-- ブログ記事
create table blogs (
  id uuid primary key default gen_random_uuid(),
  title varchar not null,
  thumbnail text,
  content text not null,
  published boolean default false,
  created_at timestamptz default now(),
  category_ids int[]
);

-- カテゴリ
create table categories (
  id serial primary key,
  name text not null unique
);
```

## 🔗 関連プロジェクト

- 📄 ローカルストレージ版  
  [https://github.com/Gratien583/Note-of-Beginning](https://github.com/Gratien583/Note-of-Beginning-js)  

- ⚛️ React + Supabase (β)：フロントエンドを React、バックエンドに Supabase を使用 （このリポジトリ） 

- 🐘 PHP + MySQL 版：サーバーサイドを PHP、データ保存に MySQL を使用  
  [https://github.com/Gratien583/Note-of-Beginning-PHP](https://github.com/Gratien583/Note-of-Beginning-PHP)  

- 🐳 Docker 対応版 (β)  
  [https://github.com/Gratien583/Note-of-Beginning-Docker](https://github.com/Gratien583/Note-of-Beginning-Docker)
