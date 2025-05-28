import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import { useNavigate } from "react-router-dom";
import styles from "./css/new_account.module.css";

const NewAccount: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!username.trim()) newErrors.username = "ユーザー名を入力してください。";
    if (!password) newErrors.password = "パスワードを入力してください。";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "パスワードが一致しません。";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { data: existingUser } = await supabase
        .from("accounts")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        setErrors({ username: "このユーザー名は既に使用されています。" });
        return;
      }

      const { error } = await supabase
        .from("accounts")
        .insert([{ username, password_hash: password }]);

      if (error) {
        setErrors({ general: "アカウント作成中にエラーが発生しました。" });
        return;
      }

      alert("アカウント作成に成功しました！");
      navigate("/Admin/dashboard");
    } catch (error) {
      console.error("エラー:", error);
      setErrors({ general: "サーバーエラーが発生しました。" });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.adminContainer}>
        <div className={styles.sideNav}>
          <SideNav />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formWrapper}>
            <h1>アカウント作成</h1>
            {errors.general && (
              <p className={styles["error-message"]}>{errors.general}</p>
            )}
            <form onSubmit={handleSubmit}>
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

              <button type="submit">アカウント作成</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewAccount;
