import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/home.module.css";

type Blog = {
  id: string;
  title: string;
  thumbnail?: string;
  created_at: string;
  category_ids: number[];
};

type Category = {
  id: number;
  name: string;
};

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const navigate = useNavigate();

  const fetchBlogs = useCallback(async () => {
    let query = supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (searchKeyword) {
      query = query.ilike("title", `%${searchKeyword}%`);
    }

    if (selectedCategoryId) {
      query = query.contains("category_ids", [Number(selectedCategoryId)]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("ブログの取得に失敗しました:", error.message);
    } else {
      setBlogs(data || []);
    }
  }, [searchKeyword, selectedCategoryId]);

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

  useEffect(() => {
    const fetchData = async () => {
      await fetchBlogs();
      await fetchCategories();
    };
    fetchData();
  }, [fetchBlogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
  };

  return (
    <>
      <Header />
      <div className={styles.main}>
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

        <input
          type="text"
          placeholder="検索キーワード"
          value={searchKeyword}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <div className={styles.blogList}>
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => navigate(`/blog/${blog.id}`)}
                className={styles.blogBoxLink}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.blogBox}>
                  {blog.thumbnail && (
                    <div className={styles.thumbnailContainer}>
                      <img
                        src={blog.thumbnail}
                        alt="サムネイル"
                        className={styles.blogThumbnail}
                      />
                    </div>
                  )}
                  <h2>{blog.title}</h2>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noBlogs}>記事がありません。</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
