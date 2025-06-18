import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/home.module.css";

// ブログの型定義（必要なフィールドのみ）
type Blog = {
  id: string;
  title: string;
  thumbnail?: string;
  created_at: string;
  category_ids: number[]; // 紐づくカテゴリIDの配列
};

// カテゴリの型定義
type Category = {
  id: number;
  name: string;
};

const Home: React.FC = () => {
  // 状態管理：ブログ一覧・カテゴリ一覧・検索キーワード・選択中カテゴリ
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const navigate = useNavigate();

  // ブログ一覧の取得（検索キーワード・カテゴリでフィルタ）
  const fetchBlogs = useCallback(async () => {
    let query = supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false }); // 新しい順

    // タイトル検索キーワードでフィルタ
    if (searchKeyword) {
      query = query.ilike("title", `%${searchKeyword}%`);
    }

    // カテゴリ選択があれば category_ids に含まれるブログに絞り込み
    if (selectedCategoryId) {
      query = query.contains("category_ids", [Number(selectedCategoryId)]);
    }

    // クエリ実行
    const { data, error } = await query;

    if (error) {
      console.error("ブログの取得に失敗しました:", error.message);
    } else {
      setBlogs(data || []);
    }
  }, [searchKeyword, selectedCategoryId]);

  // カテゴリ一覧の取得（選択肢用）
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("カテゴリの取得に失敗しました:", error.message);
    } else {
      setAllCategories(data || []);
    }
  };

  // 初回レンダリング時にブログ＆カテゴリを両方取得
  useEffect(() => {
    const fetchData = async () => {
      await fetchBlogs();
      await fetchCategories();
    };
    fetchData();
  }, [fetchBlogs]);

  // 検索キーワード変更時の処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // カテゴリ選択変更時の処理
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
  };

  return (
    <>
      {/* ヘッダー（共通） */}
      <Header />

      {/* メインエリア */}
      <div className={styles.main}>
        {/* カテゴリ選択フォーム */}
        <div className={styles.container}>
          <label htmlFor="category-select">カテゴリ:</label>
          <select
            id="category-select"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className={styles.categorySelect}
          >
            <option value="">すべて</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 検索ボックス */}
        <input
          type="text"
          placeholder="検索キーワード"
          value={searchKeyword}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        {/* ブログ一覧 */}
        <div className={styles.blogList}>
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => navigate(`/blog/${blog.id}`)} // ブログ詳細へ遷移
                className={styles.blogBoxLink}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.blogBox}>
                  {/* サムネイル画像がある場合 */}
                  {blog.thumbnail && (
                    <div className={styles.thumbnailContainer}>
                      <img
                        src={blog.thumbnail}
                        alt="サムネイル"
                        className={styles.blogThumbnail}
                      />
                    </div>
                  )}
                  {/* タイトル */}
                  <h2>{blog.title}</h2>
                </div>
              </div>
            ))
          ) : (
            // 記事がない場合の表示
            <p className={styles.noBlogs}>記事がありません。</p>
          )}
        </div>
      </div>

      {/* フッター（共通） */}
      <Footer />
    </>
  );
};

export default Home;
