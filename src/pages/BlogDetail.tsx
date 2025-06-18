import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./css/BlogDetail.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

type Blog = {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  created_at: string;
  categories: string[];
};

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        console.error("IDがありません");
        return;
      }

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

      const { data: categoryData, error: categoryError } = await supabase
        .from("blog_categories")
        .select("category_name")
        .eq("blog_id", id);

      if (categoryError) {
        console.error("カテゴリの取得に失敗しました:", categoryError.message);
      }

      setBlog({
        ...blogData,
        categories:
          categoryData?.map(
            (cat: { category_name: string }) => cat.category_name
          ) || [],
      });
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
      {/* タイトルの表示 */}
      <h1>{blog.title}</h1>

      {/* 投稿日時の表示 */}
      <p>作成日: {new Date(blog.created_at).toLocaleDateString()}</p>

      {/* サムネイルの表示 */}
      {blog.thumbnail && (
        <img src={blog.thumbnail} alt="サムネイル" style={{ width: "100%" }} />
      )}

      {/* カテゴリの表示 */}
      <div className={styles.categoryContainer}>
        {blog.categories.length > 0 ? `#${blog.categories.join("   #")}` : ""}
      </div>

      {/* 目次の表示 */}
      <div className={styles.tableOfContents}>
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
      </div>

      <div
        className={styles.blogContent}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
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
