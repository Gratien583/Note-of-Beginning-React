import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./css/BlogDetail.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// カテゴリ情報の型定義
type Category = { id: number; name: string };

// ブログ記事の型定義
type Blog = {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  created_at: string;
  category_ids: number[];
};

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URLパラメータからブログIDを取得
  const [blog, setBlog] = useState<Blog | null>(null); // 表示するブログデータ
  const [categories, setCategories] = useState<Category[]>([]); // 対応するカテゴリ一覧
  const navigate = useNavigate(); // 画面遷移用

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        console.error("IDがありません");
        return;
      }

      // ブログ記事の取得（IDと公開状態でフィルター）
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();

      // エラー処理：非公開や取得失敗時
      if (blogError || !blogData) {
        console.error("記事の取得に失敗しました:", blogError?.message);
        alert("この記事は非公開です。");
        setTimeout(() => navigate("/"), 3000); // トップに3秒後戻る
        return;
      }

      // 関連カテゴリの取得（category_ids に含まれるID一覧で抽出）
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .in("id", blogData.category_ids);

      if (categoryError) {
        console.error("カテゴリの取得に失敗しました:", categoryError.message);
      }

      // 状態を更新
      setBlog(blogData);
      setCategories(categoryData || []);
    };

    fetchBlog(); // 初回マウント時に実行
  }, [id, navigate]);

  if (!blog) {
    return <p>記事を読み込んでいます...</p>; // ローディング表示
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* 記事タイトルと作成日 */}
        <h1>{blog.title}</h1>
        <p>作成日: {new Date(blog.created_at).toLocaleDateString()}</p>

        {/* サムネイル画像の表示 */}
        {blog.thumbnail && (
          <img
            src={blog.thumbnail}
            alt="サムネイル"
            style={{ width: "100%" }}
          />
        )}

        {/* 
          目次生成（現在はコメントアウト中）
          - HTMLからh1/h2タグを抽出し目次リストを生成する構造
          - 将来の再有効化に備えて残してある 
        */}
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

        {/* ブログ本文の表示（HTML文字列をそのままレンダリング） */}
        <div
          className={styles.blogContent}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* カテゴリバッジの表示 */}
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

// HTMLの見出し要素（h1, h2）を抽出し、目次用にIDとテキストを整形する関数
// 現時点では未使用だが、目次機能実装時に利用予定
// const extractHeadings = (html: string) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");
//   const headings = Array.from(doc.querySelectorAll("h1, h2")).map(
//     (heading, index) => ({
//       id: `heading_${index}`,
//       text: heading.textContent || "",
//       level: heading.tagName === "H1" ? 1 : 2,
//     })
//   );
//   return headings;
// };

export default BlogDetail;
