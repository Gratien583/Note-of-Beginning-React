import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/new_account.module.css";

const NewAccount: React.FC = () => {
  // 入力フォームの状態管理
  const [username, setUsername] = useState(""); // ユーザー名
  const [password, setPassword] = useState(""); // パスワード
  const [confirmPassword, setConfirmPassword] = useState(""); // 確認用パスワード
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ

  const navigate = useNavigate();

  // アカウント作成処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // デフォルトの送信を防止

    // パスワード一致チェック
    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。");
      return;
    }

    try {
      // 既存ユーザーの確認
      const { data: existingUser } = await supabase
        .from("accounts")
        .select("username")
        .eq("username", username)
        .single();

      // 同一ユーザー名が既に存在する場合
      if (existingUser) {
        setErrorMessage("このユーザー名は既に使用されています。");
        return;
      }

      // 新規アカウント作成（※現在は平文で保存。実運用ではハッシュ化推奨）
      const { error } = await supabase
        .from("accounts")
        .insert([{ username, password: password }]);

      if (error) {
        setErrorMessage("アカウント作成中にエラーが発生しました。");
      } else {
        alert("アカウント作成に成功しました！");
        navigate("/account-success"); // 成功時の遷移
      }
    } catch (error) {
      // その他予期せぬエラー
      setErrorMessage("サーバーエラーが発生しました。");
      console.error("エラー:", error);
    }
  };

  return (
    <>
      {/* 共通ヘッダー */}
      <Header />

      {/* コンテンツエリア */}
      <div className={styles.content}>
        <h1>アカウント作成</h1>

        {/* エラーがあれば表示 */}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        {/* アカウント作成フォーム */}
        <form id="signup-form" onSubmit={handleSubmit}>
          {/* ユーザー名入力 */}
          <label htmlFor="username">ユーザー名：</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* パスワード入力 */}
          <label htmlFor="password">パスワード：</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* パスワード確認入力 */}
          <label htmlFor="confirm-password">パスワード確認：</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* 送信ボタン */}
          <button type="submit">アカウント作成</button>
        </form>
      </div>

      {/* 共通フッター */}
      <Footer />
    </>
  );
};

export default NewAccount;
