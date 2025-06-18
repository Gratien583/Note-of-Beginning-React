import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./css/edit.module.css";

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
        if (quillInstance.current) {
          quillInstance.current.root.innerHTML = data.content;
        }
      } else {
        console.error("エラー:", error);
        alert("記事が見つかりません");
        navigate("/Admin/list");
      }
    };

    const fetchCategories = async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("category_name");

      if (data) {
        setCategories(
          data.map(
            (category: { category_name: string }) => category.category_name
          )
        );
      }
    };

    const fetchSelectedCategories = async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("category_name")
        .eq("blog_id", id);

      if (data) {
        setSelectedCategories(
          data.map(
            (category: { category_name: string }) => category.category_name
          )
        );
      }
    };

    fetchBlog();
    fetchCategories();
    fetchSelectedCategories();

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

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSelectedCategories([...selectedCategories, newCategory]);
      setNewCategory("");
    }
  };

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
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("画像のアップロードに失敗しました：" + error.message);
      return;
    }

    const { data } = supabase.storage.from("thumbnails").getPublicUrl(filePath);
    setThumbnail(data.publicUrl);
  };

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
        })
        .eq("id", id);

      await supabase.from("blog_categories").delete().eq("blog_id", id);

      for (const category of selectedCategories) {
        await supabase.from("blog_categories").insert({
          blog_id: id,
          category_name: category,
        });
      }
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
            <label className={styles.label}>タイトル:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.inputField}
            />

            <label className={styles.label}>本文:</label>
            <div ref={quillRef} className={styles.quillEditor}></div>

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
                  display: "block",
                  marginLeft: "0",
                }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className={styles.inputField}
            />

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
              className={styles.addButton}
            >
              カテゴリ追加
            </button>

            <div className={styles.categoryList}>
              {categories.map((category: string) => (
                <label key={category} className={styles.categoryLabel}>
                  <input
                    type="checkbox"
                    value={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>

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
