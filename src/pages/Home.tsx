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
};

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("");
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

    if (category) {
      query = query.contains("categories", [category]);
    }

    const { data, error } = await query;
    if (error) {
      console.error("ブログの取得に失敗しました:", error.message);
    } else {
      setBlogs(data || []);
    }
  }, [searchKeyword, category]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("category_name")
      .order("category_name", { ascending: true });

    if (error) {
      console.error("カテゴリの取得に失敗しました:", error.message);
    } else {
      const uniqueCategories: string[] = Array.from(
        new Set(data.map((cat: { category_name: string }) => cat.category_name))
      );
      setCategories(uniqueCategories);
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
    setCategory(e.target.value);
  };

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.container}>
          <label htmlFor="category-select">カテゴリ:</label>
          <select
            id="category-select"
            value={category}
            onChange={handleCategoryChange}
            className={styles.categorySelect}
          >
            <option value="">すべて</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
        <div>
          {blogs.length > 0 ? (
            <div className={styles.blogList}>
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className={styles.blogItem}
                >
                  {blog.thumbnail && (
                    <img
                      src={blog.thumbnail}
                      alt="サムネイル"
                      className={styles.blogThumbnail}
                    />
                  )}
                  <h2 className={styles.blogTitle}>{blog.title}</h2>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noBlogs}></p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
