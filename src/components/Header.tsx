import React from "react";
import { Link } from "react-router-dom";
import styles from "../pages/css/header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.headerRight}>
        <Link className={styles.link} to="/">
          トップ
        </Link>
        <Link className={styles.link} to="/login">
          ログイン
        </Link>
        <Link className={styles.link} to="/new-account">
          アカウント新規作成
        </Link>
      </nav>
    </header>
  );
};

export default Header;
