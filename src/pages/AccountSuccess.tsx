import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./css/account_success.module.css";

const AccountSuccess: React.FC = () => {
  return (
    <>
      <Header />
      <div className={styles.content}>
        <h1>アカウント作成完了</h1>
        <p>アカウントが正常に作成されました。</p>
        {/* トップページへのリンク */}
        <Link to="/" className={styles.link}>
          トップページに戻る
        </Link>
      </div>
      <Footer />
    </>
  );
};

export default AccountSuccess;
