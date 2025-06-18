import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./css/BlogDetail.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

type Category = { id: number; name: string };

type Blog = {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  created_at: string;
  category_ids: number[];
};

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        console.error("IDがありません");
        return;
      }

      // 記事取得
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();

      if (blogError || !blogData) {
        console.error("記事の取得に失敗しました:", blogError?.message);
        alert("この記事は非公開です。");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      // カテゴリ取得
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .in("id", blogData.category_ids);

      if (categoryError) {
        console.error("カテゴリの取得に失敗しました:", categoryError.message);
      }

      setBlog(blogData);
      setCategories(categoryData || []);
    };

    fetchBlog();
  }, [id, navigate]);

  if (!blog) {
    return <p>記事を読み込んでいます...</p>;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1>{blog.title}</h1>
        <p>作成日: {new Date(blog.created_at).toLocaleDateString()}</p>

        {blog.thumbnail && (
          <img
            src={blog.thumbnail}
            alt="サムネイル"
            style={{ width: "100%" }}
          />
        )}

        {/* <div className={styles.tableOfContents}>
          <p className={styles.mokuji}>目次</p>
          <ul>
            {extractHeadings(blog.content).map((heading, index) => (
              <li key={index}>
                <a
                  href={`#${heading.id}`}
                  style={{ marginLeft: heading.level === 2 ? "32px" : "10px" }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div> */}

        <div
          className={styles.blogContent}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className={styles.categoryContainer}>
          {categories.map((cat) => (
            <span key={cat.id} className={styles.categoryBadge}>
              #{cat.name}
            </span>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

const extractHeadings = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = Array.from(doc.querySelectorAll("h1, h2")).map(
    (heading, index) => ({
      id: `heading_${index}`,
      text: heading.textContent || "",
      level: heading.tagName === "H1" ? 1 : 2,
    })
  );
  return headings;
};

export default BlogDetail;
