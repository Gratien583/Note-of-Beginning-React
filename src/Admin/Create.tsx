import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "./css/create.module.css";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// カテゴリの型定義
type Category = { id: number; name: string };

const Create: React.FC = () => {
  // 入力状態の管理
  const [title, setTitle] = useState(""); // 記事タイトル
  const [thumbnail, setThumbnail] = useState(""); // サムネイル画像URL
  const [newCategory, setNewCategory] = useState(""); // 新しく追加するカテゴリ名
  const [categories, setCategories] = useState<Category[]>([]); // 既存カテゴリ一覧
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); // 選択されたカテゴリID
  const quillRef = useRef<HTMLDivElement>(null); // QuillエディタのDOM参照
  const quillInstance = useRef<Quill | null>(null); // Quillエディタインスタンス
  const navigate = useNavigate(); // ページ遷移用

  // Quillエディタの初期化
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

  // カテゴリ一覧の取得
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // 新しいカテゴリの追加
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: newCategory })
      .select();
    if (error || !data) {
      alert("カテゴリ追加に失敗しました");
      return;
    }
    setCategories((prev) => [...prev, data[0]]);
    setSelectedCategoryIds((prev) => [...prev, data[0].id]);
    setNewCategory("");
  };

  // カテゴリの選択・解除
  const toggleCategorySelection = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // 記事の送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quillInstance.current) return;

    const contentHtml = quillInstance.current.root.innerHTML;

    try {
      const { error } = await supabase.from("blogs").insert([
        {
          title,
          thumbnail,
          content: contentHtml,
          created_at: new Date().toISOString(),
          category_ids: selectedCategoryIds, // カテゴリは数値配列で保存
        },
      ]);

      if (error) throw error;
      navigate("/Admin/dashboard");
    } catch (error) {
      alert(`エラーが発生しました: ${error}`);
    }
  };

  // サムネイル画像のアップロード処理
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          <div className={styles.leftColumn}>
            {/* タイトル入力欄 */}
            <label>タイトル:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.inputField}
            />

            {/* 本文（Quillエディタ） */}
            <label>本文:</label>
            <div ref={quillRef} className={styles.quillEditor}></div>

            {/* サムネイル画像アップロード */}
            <label>サムネイル画像:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className={styles.inputField}
            />

            {/* 新規カテゴリ入力 */}
            <label>カテゴリ追加:</label>
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

            {/* カテゴリ選択 */}
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <label key={category.id} className={styles.categoryItem}>
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => toggleCategorySelection(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* 送信ボタン */}
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
