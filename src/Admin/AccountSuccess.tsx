import React from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "../css/account_success.module.css";

const AccountSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.adminContainer}>
      <SideNav />
      <div className={styles.content}>
        <h1>アカウント作成完了</h1>
        <p>アカウントが正常に作成されました。</p>
        <button
          onClick={() => navigate("/Admin/dashboard")}
          className={styles.successButton}
        >
          トップページに戻る
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSuccess;
