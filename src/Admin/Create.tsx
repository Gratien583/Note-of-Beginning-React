import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "./css/create.module.css";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Create: React.FC = () => {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const navigate = useNavigate();

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

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    } else {
      alert("カテゴリ名が空か、すでに存在しています。");
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((cat) => cat !== category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quillInstance.current) return;

    const contentHtml = quillInstance.current.root.innerHTML;

    try {
      const { data, error } = await supabase
        .from("blogs")
        .insert([
          {
            title,
            thumbnail,
            content: contentHtml,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id");

      if (error) throw error;

      const blogId = data?.[0]?.id;
      if (!blogId) throw new Error("記事のIDが取得できませんでした。");

      for (const category of categories) {
        await supabase
          .from("blog_categories")
          .insert([{ blog_id: blogId, category_name: category }]);
      }

      navigate("/Admin/dashboard");
    } catch (error) {
      alert(`エラーが発生しました: ${error}`);
    }
  };

const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(filePath, file);

  if (error) {
    alert("画像のアップロードに失敗しました：" + error.message);
    return;
  }

  const { data } = supabase.storage.from("thumbnails").getPublicUrl(filePath);
  setThumbnail(data.publicUrl);
};


  return (
    <div className={styles.adminContainer}>
      <SideNav />
      <div className={styles.formContainer}>
        <h1>新しい記事作成</h1>
        <form onSubmit={handleSubmit}>
          {/* 左側の入力エリア */}
          <div className={styles.leftColumn}>
            <label>タイトル:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.inputField}
            />

            <label>サムネイル画像:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className={styles.inputField}
            />

            <label>カテゴリの追加:</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={addCategory}
              className={styles.categoryButton}
            >
              カテゴリ追加
            </button>

            <div className={styles.categoryList}>
              {categories.map((category, index) => (
                <div key={index} className={styles.categoryItem}>
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className={styles.deleteCategoryButton}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 右側のエディターエリア */}
          <div className={styles.rightColumn}>
            <label>本文:</label>
            <div ref={quillRef} className={styles.quillEditor}></div>
          </div>

          <button type="submit" className={styles.submitButton}>
            記事を作成
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Create;
