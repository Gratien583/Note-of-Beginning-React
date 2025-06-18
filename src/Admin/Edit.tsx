import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./css/edit.module.css";

// カテゴリの型定義
type Category = { id: number; name: string };

const Edit: React.FC = () => {
  // ルートパラメータからブログIDを取得
  const { id } = useParams<{ id: string }>();

  // 各種ステート定義
  const [title, setTitle] = useState(""); // タイトル
  const [thumbnail, setThumbnail] = useState(""); // サムネイルURL
  const [categories, setCategories] = useState<Category[]>([]); // すべてのカテゴリ
  const [newCategory, setNewCategory] = useState(""); // 新規カテゴリ名
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); // 選択されたカテゴリID群
  const quillRef = useRef<HTMLDivElement>(null); // QuillエディタのDOM参照
  const quillInstance = useRef<Quill | null>(null); // Quillインスタンス参照
  const navigate = useNavigate();

  useEffect(() => {
    // ブログ記事の取得
    const fetchBlog = async () => {
      if (!id) {
        alert("ブログIDが指定されていません");
        navigate("/Admin/list");
        return;
      }

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setThumbnail(data.thumbnail);
        setSelectedCategoryIds(data.category_ids || []);
        // Quillエディタに本文を表示
        if (quillInstance.current) {
          quillInstance.current.root.innerHTML = data.content;
        }
      } else {
        alert("記事が見つかりません");
        navigate("/Admin/list");
      }
    };

    // カテゴリ一覧の取得
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    };

    fetchBlog();
    fetchCategories();

    // Quillエディタ初期化（1度だけ）
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
  }, [id, navigate]);

  // カテゴリの選択・解除
  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 新規カテゴリの追加処理
  const addNewCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.some((c) => c.name === trimmed)) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: trimmed })
      .select();

    if (error || !data) {
      alert("カテゴリ追加に失敗しました");
      return;
    }

    // 追加後にカテゴリ一覧と選択に反映
    setCategories((prev) => [...prev, data[0]]);
    setSelectedCategoryIds((prev) => [...prev, data[0].id]);
    setNewCategory("");
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

  // フォーム送信時の記事更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quillInstance.current) return;

    const contentHtml = quillInstance.current.root.innerHTML;

    try {
      await supabase
        .from("blogs")
        .update({
          title,
          content: contentHtml,
          thumbnail,
          category_ids: selectedCategoryIds,
        })
        .eq("id", id);

      navigate("/Admin/dashboard");
    } catch (error) {
      alert("エラーが発生しました: " + error);
    }
  };

  return (
    <>
      <div className={styles.adminContainer}>
        <SideNav />

        <div className={styles.formContainer}>
          <h1>記事を編集</h1>
          <form onSubmit={handleSubmit}>
            {/* タイトル入力 */}
            <label className={styles.label}>タイトル:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.inputField}
            />

            {/* 本文エディタ（Quill） */}
            <label className={styles.label}>本文:</label>
            <div ref={quillRef} className={styles.quillEditor}></div>

            {/* サムネイル画像の表示とアップロード */}
            <label className={styles.label}>サムネイル画像:</label>
            {thumbnail && (
              <img
                src={thumbnail}
                alt="現在のサムネイル"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className={styles.inputField}
            />

            {/* 新規カテゴリの追加 */}
            <label className={styles.label}>カテゴリの追加:</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={addNewCategory}
              className={styles.categoryButton}
            >
              カテゴリ追加
            </button>

            {/* カテゴリの選択リスト */}
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <label key={category.id} className={styles.categoryLabel}>
                  <input
                    type="checkbox"
                    value={category.id}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => toggleCategorySelection(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>

            {/* 保存ボタン */}
            <button type="submit" className={styles.submitButton}>
              記事を保存
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Edit;
