import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import { useNavigate } from "react-router-dom";
import styles from "./css/dashboard.module.css";

type Blog = {
  id: string;
  title: string;
  thumbnail?: string;
  published: boolean;
};

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert("ブログ記事の取得に失敗しました。");
      } else {
        setBlogs(data || []);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.mainContent}>
        <SideNav />
        <div className={styles.contentContainer}>
          <h1>管理者メインページ</h1>
          <div className={styles.blogContainer}>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div
                  key={blog.id}
                  onClick={() => navigate(`/Admin/edit/${blog.id}`)}
                  className={`${styles.blogBox} ${
                    blog.published ? styles.published : styles.unpublished
                  }`}
                >
                  {blog.thumbnail && (
                    <div className={styles.thumbnailContainer}>
                      <img
                        src={blog.thumbnail}
                        alt="サムネイル"
                        loading="lazy"
                        decoding="async"
                        className={styles.blogThumbnail}
                      />
                    </div>
                  )}
                  <h2>{blog.title}</h2>
                </div>
              ))
            ) : (
              <p>記事がありません。</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
