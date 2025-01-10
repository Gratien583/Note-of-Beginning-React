## 📦 Technologies Used

![React](https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg)  
![Supabase](https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png)

- **Frontend:** React (TypeScript)
- **Backend:** Supabase (PostgreSQL, Authentication, Storage)
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
