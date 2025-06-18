import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/login.module.css";

const Login: React.FC = () => {
  // ユーザー名・パスワード・エラーメッセージの状態を管理
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルト送信をキャンセル

    try {
      // 入力されたユーザー名でアカウント情報を取得（1件）
      const { data: account, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("username", username)
        .single();

      // アカウントが存在しない、またはエラーがある場合
      if (error || !account) {
        setErrorMessage("ユーザー名またはパスワードが間違っています。");
        return;
      }

      // パスワード検証（※簡易的な比較、実運用ではハッシュ化推奨）
      const isPasswordValid = await verifyPassword(
        password,
        account.password
      );

      if (!isPasswordValid) {
        setErrorMessage("ユーザー名またはパスワードが間違っています。");
        return;
      }

      // ログイン成功：ユーザー情報をローカルストレージに保存
      localStorage.setItem("logged_in_user", username);
      alert("ログイン成功！");
      navigate("/admin/dashboard"); // 管理画面へ遷移
    } catch (error) {
      // エラー発生時
      setErrorMessage("ログイン中にエラーが発生しました。");
      console.error(error);
    }
  };

  // パスワード検証関数（仮：平文比較）
  const verifyPassword = async (inputPassword: string, storedHash: string) => {
    return inputPassword === storedHash;
  };

  return (
    <>
      {/* 共通ヘッダー */}
      <Header />

      {/* ログインフォーム本体 */}
      <div className={styles.content}>
        <h1>ログイン</h1>

        {/* エラーメッセージがあれば表示 */}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <form id="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">ユーザー名：</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">パスワード：</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">ログイン</button>
        </form>
      </div>

      {/* 共通フッター */}
      <Footer />
    </>
  );
};

export default Login;
