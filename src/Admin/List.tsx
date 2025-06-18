import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toggleBlogPublishStatus } from "./hooks/useTogglePublish";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "./css/list.module.css";

// ブログデータ型の定義
type Blog = {
  id: string;
  title: string;
  thumbnail?: string;
  published: boolean;
};

const List: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  // 初回マウント時にブログ一覧を取得
  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false }); // 新しい順で取得
      if (error) {
        alert("記事の取得に失敗しました。");
      } else {
        setBlogs(data || []);
      }
    };
    fetchBlogs();
  }, []);

  // 公開/非公開の切り替え処理
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = await toggleBlogPublishStatus(id, currentStatus); // 外部フックの利用
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === id ? { ...blog, published: newStatus } : blog
        )
      );
    } catch (error) {
      alert("公開状態の変更に失敗しました。");
    }
  };

  // 記事削除処理（確認後にSupabaseから削除）
  const deleteBlog = async (id: string) => {
    if (window.confirm("この記事を削除しますか？")) {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) {
        alert("記事の削除に失敗しました。");
      } else {
        alert("記事を削除しました。");
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      }
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* サイドナビゲーション */}
      <SideNav />

      <div className={styles.contentContainer}>
        <h1>記事一覧</h1>

        {/* ブログ一覧テーブル */}
        <table className={styles.blogTable}>
          <thead>
            <tr>
              <th>タイトル</th>
              <th>サムネイル</th>
              <th>状態</th>
              <th>操作</th>
              <th>編集</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                {/* 記事タイトル */}
                <td>{blog.title}</td>

                {/* サムネイル画像 or テキスト */}
                <td>
                  {blog.thumbnail ? (
                    <img
                      src={blog.thumbnail}
                      alt="サムネイル"
                      className={styles.blogThumbnail}
                    />
                  ) : (
                    "サムネイルなし"
                  )}
                </td>

                {/* 公開状態（スタイル切替あり） */}
                <td
                  className={
                    blog.published
                      ? styles.statusPublished
                      : styles.statusUnpublished
                  }
                >
                  {blog.published ? "公開中" : "非公開"}
                </td>

                {/* 公開・非公開切替ボタン */}
                <td>
                  <button
                    onClick={() => handleTogglePublish(blog.id, blog.published)}
                  >
                    {blog.published ? "非公開にする" : "公開する"}
                  </button>
                </td>

                {/* 編集ページへの遷移ボタン */}
                <td>
                  <button onClick={() => navigate(`/admin/edit/${blog.id}`)}>
                    編集
                  </button>
                </td>

                {/* 削除ボタン */}
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteBlog(blog.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* フッター */}
      <Footer />
    </div>
  );
};

export default List;
