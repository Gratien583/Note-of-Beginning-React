import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/new_account.module.css";

const NewAccount: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from("accounts")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        setErrorMessage("このユーザー名は既に使用されています。");
        return;
      }

      const { error } = await supabase
        .from("accounts")
        .insert([{ username, password: password }]);

      if (error) {
        setErrorMessage("アカウント作成中にエラーが発生しました。");
      } else {
        alert("アカウント作成に成功しました！");
        navigate("/account-success");
      }
    } catch (error) {
      setErrorMessage("サーバーエラーが発生しました。");
      console.error("エラー:", error);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.content}>
        <h1>アカウント作成</h1>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <form id="signup-form" onSubmit={handleSubmit}>
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

          <label htmlFor="confirm-password">パスワード確認：</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">アカウント作成</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default NewAccount;
