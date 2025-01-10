import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import styles from "./css/account-list.module.css";

type Account = {
  id: string;
  username: string;
};

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // アカウント一覧取得
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
        setAccounts(data);
      } catch (error) {
        console.error(error);
        alert("アカウントの取得に失敗しました。");
      }
    };

    fetchAccounts();
  }, []);

  // アカウント削除処理
  const handleDeleteAccount = async (accountId: string) => {
    const confirmDelete = window.confirm("このアカウントを削除しますか？");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) {
        throw new Error("アカウントの削除に失敗しました");
      }

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
        {message && <p className={styles.successMessage}>{message}</p>}
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
