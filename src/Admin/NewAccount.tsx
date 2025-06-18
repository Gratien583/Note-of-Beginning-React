import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import { useNavigate } from "react-router-dom";
import styles from "./css/new_account.module.css";

const NewAccount: React.FC = () => {
  // 入力値とエラーメッセージの状態を管理
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // フォームのバリデーションチェック
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!username.trim()) newErrors.username = "ユーザー名を入力してください。";
    if (!password) newErrors.password = "パスワードを入力してください。";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "パスワードが一致しません。";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // バリデーション失敗時は処理中断

    try {
      // ユーザー名の重複チェック
      const { data: existingUser } = await supabase
        .from("accounts")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        setErrors({ username: "このユーザー名は既に使用されています。" });
        return;
      }

      // 新規アカウントの作成（パスワードは password_hash に保存）
      const { error } = await supabase
        .from("accounts")
        .insert([{ username, password_hash: password }]);

      if (error) {
        setErrors({ general: "アカウント作成中にエラーが発生しました。" });
        return;
      }

      alert("アカウント作成に成功しました！");
      navigate("/Admin/dashboard"); // ダッシュボードへ遷移
    } catch (error) {
      console.error("エラー:", error);
      setErrors({ general: "サーバーエラーが発生しました。" });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.adminContainer}>
        {/* サイドナビゲーション（管理用） */}
        <div className={styles.sideNav}>
          <SideNav />
        </div>

        {/* アカウント作成フォームのラッパー */}
        <div className={styles.contentContainer}>
          <div className={styles.formWrapper}>
            <h1>アカウント作成</h1>

            {/* 一般エラーメッセージ表示 */}
            {errors.general && (
              <p className={styles["error-message"]}>{errors.general}</p>
            )}

            <form onSubmit={handleSubmit}>
              {/* ユーザー名入力 */}
              <label htmlFor="username">ユーザー名：</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? styles.error : ""}
              />
              {errors.username && (
                <p className={styles["error-message"]}>{errors.username}</p>
              )}

              {/* パスワード入力 */}
              <label htmlFor="password">パスワード：</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? styles.error : ""}
              />
              {errors.password && (
                <p className={styles["error-message"]}>{errors.password}</p>
              )}

              {/* パスワード確認 */}
              <label htmlFor="confirmPassword">パスワード確認：</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? styles.error : ""}
              />
              {errors.confirmPassword && (
                <p className={styles["error-message"]}>
                  {errors.confirmPassword}
                </p>
              )}

              {/* 送信ボタン */}
              <button type="submit">アカウント作成</button>
            </form>
          </div>
        </div>
      </div>

      {/* フッター表示 */}
      <Footer />
    </div>
  );
};

export default NewAccount;
