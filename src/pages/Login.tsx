import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/login.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: account, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !account) {
        setErrorMessage("ユーザー名またはパスワードが間違っています。");
        return;
      }

      const isPasswordValid = await verifyPassword(
        password,
        account.password
      );
      if (!isPasswordValid) {
        setErrorMessage("ユーザー名またはパスワードが間違っています。");
        return;
      }

      localStorage.setItem("logged_in_user", username);
      alert("ログイン成功！");
      navigate("/admin/dashboard");
    } catch (error) {
      setErrorMessage("ログイン中にエラーが発生しました。");
      console.error(error);
    }
  };

  const verifyPassword = async (inputPassword: string, storedHash: string) => {
    return inputPassword === storedHash;
  };

  return (
    <>
      <Header />
      <div className={styles.content}>
        <h1>ログイン</h1>
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
      <Footer />
    </>
  );
};

export default Login;
