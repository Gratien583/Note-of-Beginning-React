import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "./css/account-list.module.css";

// アカウント型定義
type Account = {
  id: string;
  username: string;
};

const AccountList: React.FC = () => {
  // アカウント一覧と通知メッセージ用の状態を管理
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // ページ読み込み時にアカウント一覧を取得
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          throw new Error("アカウントの取得に失敗しました");
        }
        setAccounts(data); // アカウント一覧をstateにセット
      } catch (error) {
        console.error(error);
        alert("アカウントの取得に失敗しました。");
      }
    };

    fetchAccounts();
  }, []);

  // アカウント削除の処理（確認ダイアログあり）
  const handleDeleteAccount = async (accountId: string) => {
    const confirmDelete = window.confirm("このアカウントを削除しますか？");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId); // id に一致するアカウントを削除

      if (error) {
        throw new Error("アカウントの削除に失敗しました");
      }

      // 削除成功時：メッセージ表示と状態更新
      setMessage("アカウントが削除されました");
      setAccounts((prev) => prev.filter((account) => account.id !== accountId));
    } catch (error) {
      console.error(error);
      setMessage("アカウント削除に失敗しました");
    }
  };

  return (
    <div className={styles.adminContainer}>
      <SideNav />

      <div className={styles.contentContainer}>
        <h1>アカウント一覧</h1>

        {/* 削除成功/失敗メッセージの表示 */}
        {message && <p className={styles.successMessage}>{message}</p>}

        {/* アカウント一覧テーブル */}
        <table className={styles.accountTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>ユーザー名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.username}</td>
                <td>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className={styles.deleteButton}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
};

export default AccountList;
