import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import NewAccount from './pages/NewAccount';
import AccountSuccess from './pages/AccountSuccess';
import Dashboard from './Admin/Dashboard';
import List from './Admin/List';
import Create from './Admin/Create';
import Edit from './Admin/Edit';
import AccountList from './Admin/AccountList';
import AdminNewAccount from './Admin/NewAccount';
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* 一般ユーザー向けのルート */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/new-account" element={<NewAccount />} />
                <Route path="/account-success" element={<AccountSuccess />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                {/* 管理者向けのルート */}
                <Route path="/Admin/dashboard" element={<Dashboard />} />
                <Route path="/Admin/list" element={<List />} />
                <Route path="/Admin/create" element={<Create />} />
                <Route path="/Admin/edit/:id" element={<Edit />} />
                <Route path="/Admin/account-list" element={<AccountList />} />
                <Route path="/Admin/new-account" element={<AdminNewAccount />} />
            </Routes>
        </Router>
    );
};

export default App;
