# Note-of-Beginning-React
- 🇯🇵 [Japanese README](https://zenn.dev/gratien583/articles/38183372dbbd7d)
---
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**Note-of-Beginning** is the first blog/memo application I planned, designed, and developed from scratch.

## 📖 Name Origin

The name **Note-of-Beginning** has the following meaning:

- **Note** → Memo or record  
- **of** → Indicates possession  
- **Beginning** → The start

In other words, it represents “a note marking the beginning” or “a record of the first step,” symbolizing my first step as a developer.

## 🛠 Project Background

This project originated from a simple memo app made with **HTML / CSS / JavaScript + LocalStorage**.  
I expanded the idea using **React** and **Supabase**, adding login features, image uploads, and category management to build a more practical blog system.

## 🛠 Tech Stack

- Frontend: React (TypeScript)
- Backend: Supabase
- Editor: Quill  

## 🎯 Features

- Create / edit / delete blog posts
- Toggle post visibility (public/private)
- Upload thumbnail images (via Supabase Storage)
- Add/select multiple categories
- Basic account list and deletion

---

## 🧩 Database Structure

The project uses three main tables in Supabase:

### 🗃 Table Overview

| Table Name   | Purpose                   |
|--------------|---------------------------|
| `accounts`   | User account management   |
| `blogs`      | Blog content              |
| `categories` | Blog categories           |

---

### 💾 Table Schemas

#### `accounts`

| Column       | Type         | Description                             |
|--------------|--------------|-----------------------------------------|
| `id`         | `uuid`       | Primary key (auto-generated)            |
| `username`   | `varchar`    | Username                                |
| `password`   | `text`       | Password (should be encrypted)          |
| `created_at` | `timestamptz`| Account creation timestamp              |

#### `blogs`

| Column         | Type         | Description                               |
|----------------|--------------|-------------------------------------------|
| `id`           | `uuid`       | Primary key                               |
| `title`        | `varchar`    | Post title                                |
| `thumbnail`    | `text`       | Thumbnail image URL (from Storage)        |
| `content`      | `text`       | HTML content                              |
| `published`    | `boolean`    | Visibility flag                           |
| `created_at`   | `timestamptz`| Post creation timestamp                   |
| `category_ids` | `int[]`      | Array of selected category IDs            |

#### `categories`

| Column | Type   | Description     |
|--------|--------|------------------|
| `id`   | `int4` | Primary key      |
| `name` | `text` | Category name    |

---

### 🧪 SQL

```sql
-- User accounts
create table accounts (
  id uuid primary key default gen_random_uuid(),
  username varchar not null,
  password text not null,
  created_at timestamptz default now()
);

-- Blog posts
create table blogs (
  id uuid primary key default gen_random_uuid(),
  title varchar not null,
  thumbnail text,
  content text not null,
  published boolean default false,
  created_at timestamptz default now(),
  category_ids int[]
);

-- Categories
create table categories (
  id serial primary key,
  name text not null unique
);
```

### 📂 Supabase Setup

- Create a `thumbnails` bucket in Supabase Storage.
- Add the following to your `.env` file:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-key
```

---

## 🧠 Implementation Highlights

### ✅ Category Selection Without Join Tables

```tsx
const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

await supabase.from("blogs").insert([
  {
    title,
    content: contentHtml,
    category_ids: selectedCategoryIds,
  },
]);
```

Thanks to Supabase’s `int[]` support, many-to-many category selection can be handled without a join table.  
You can easily check selection state using `category_ids.includes(id)`.

---

### ✍️ Rich Text Editor with Quill

```tsx
useEffect(() => {
  if (quillRef.current && !quillInstance.current) {
    quillInstance.current = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
        ],
      },
    });
  }
}, []);
```

The editor is initialized via `ref` and saves the post as HTML using `quillInstance.current.root.innerHTML`.  
For display, `dangerouslySetInnerHTML` is used.

### 🧰 Supported Features

#### ✅ Core Formatting

- **Headings** (H1, H2, normal text)
- **Text styles** (Bold, Italic, Underline)
- **Lists** (Ordered, Bullet)
- **Links** (Hyperlinks)

#### 🔧 Other Features

- **Real-time HTML rendering**
- **Modular toolbar customization**
- **Theme support** (`snow`, `bubble`, etc.)

> Currently supports headings, formatting, lists, and links.  
> Features like image insertion and code blocks may be added in the future.

---

### 🖼 Thumbnail Upload with Supabase Storage

```tsx
const handleUpload = async (file: File) => {
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("thumbnails")
    .upload(filePath, file);

  if (!error) {
    const { data: publicUrlData } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(filePath);
    setThumbnailUrl(publicUrlData.publicUrl);
  }
};
```

- Generates a unique filename using `Date.now()`
- Uploads the file to the `thumbnails` bucket
- Fetches the public URL for preview and storage

> Validation such as file type or size is not yet implemented.

---

### 🔐 Basic Account Management (Demo Login)

Uses the `accounts` table for a simple login mechanism (not secure for production).

#### 👤 Creating Accounts

```tsx
const handleCreateAccount = async (username: string, password: string) => {
  const { data, error } = await supabase.from("accounts").insert([
    {
      username,
      password, // NOTE: use hashed passwords in production
    },
  ]);
};
```

> ⚠️ Passwords are currently stored in plain text. Use `bcrypt` or similar in production.

#### 📋 Fetching Accounts

```tsx
useEffect(() => {
  const fetchAccounts = async () => {
    const { data, error } = await supabase.from("accounts").select("*");
    setAccounts(data || []);
  };
  fetchAccounts();
}, []);
```

#### 🗑 Deleting Accounts

```tsx
const handleDeleteAccount = async (accountId: string) => {
  await supabase.from("accounts").delete().eq("id", accountId);
  setAccounts((prev) => prev.filter((a) => a.id !== accountId));
};
```

---

### ⚠️ Security and Future Enhancements

Planned future improvements:

- 🔐 Integrate **Supabase Auth** for real login
- 🔒 **Password hashing** with bcrypt
- 👥 **User roles** like Admin/Writer

> This is an experimental learning project, so I prioritized making a working prototype first. I’ll continue improving it as I learn more.

---

## 🖼 Screenshots (Coming Soon)

Visuals will be added in the future.

---

## 🔗 Related Projects

- 📄 LocalStorage Version  
  [https://github.com/Gratien583/Note-of-Beginning](https://github.com/Gratien583/Note-of-Beginning-js)  

- ⚛️ React + Supabase (Beta): This repository. Frontend in React, backend with Supabase.  

- 🐘 PHP + MySQL Version: Uses PHP on the server side and MySQL for data storage  
  [https://github.com/Gratien583/Note-of-Beginning-PHP](https://github.com/Gratien583/Note-of-Beginning-PHP)  

