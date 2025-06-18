import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../css/sidenav.module.css";
import { IonIcon } from "@ionic/react";
import {
  homeOutline,
  listOutline,
  addOutline,
  personAddOutline,
  personOutline,
  logOutOutline,
} from "ionicons/icons";

const SideNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("本当にログアウトしますか？")) {
      localStorage.removeItem("logged_in_user");
      navigate("/login");
    }
  };

  const navLinks = [
    { path: "/Admin/dashboard", icon: homeOutline, title: "記事編集" },
    { path: "/Admin/list", icon: listOutline, title: "記事一覧" },
    { path: "/Admin/create", icon: addOutline, title: "記事作成" },
    // { path: '/Admin/user-view', icon: eyeOutline, title: 'ユーザー表示' },
    {
      path: "/Admin/new-account",
      icon: personAddOutline,
      title: "アカウント作成",
    },
    {
      path: "/Admin/account-list",
      icon: personOutline,
      title: "アカウントリスト",
    },
  ];

  return (
    <div className={styles.sidenav}>
      <ul>
        {navLinks.map((link, index) => (
          <li
            key={index}
            className={
              location.pathname
                .toLowerCase()
                .startsWith(link.path.toLowerCase())
                ? styles.activeList
                : styles.list
            }
          >
            <Link to={link.path}>
              <span className={styles.icon}>
                <IonIcon icon={link.icon} />
              </span>
              <span className={styles.title}>{link.title}</span>
            </Link>
          </li>
        ))}
        {/* ログアウトボタン */}
        <li className={styles.list}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.icon}>
              <IonIcon icon={logOutOutline} />
            </span>
            <span className={styles.title}>ログアウト</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;
