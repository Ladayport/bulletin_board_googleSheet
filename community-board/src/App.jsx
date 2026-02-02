// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import ScrollToTop from './components/ui/ScrollToTop';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAnnouncement from './pages/admin/AddAnnouncement';
import ManageBulletins from './pages/admin/ManageBulletins';
import EditBulletin from './pages/admin/EditBulletin';
import PrivateRoute from './components/layout/PrivateRoute';

import Footer from './components/layout/Footer';

function App() {
    return (
        <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }}>
            <ScrollToTop />

            {/* 內容區域用 div 包裹以確保 Footer 被推到最底 (Sticky Footer 結構可選) */}
            <div style={{ minHeight: 'calc(100vh - 150px)' }}>
                <Routes>
                    {/* 公開頁面 */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/category/:type" element={<CategoryPage />} />

                    {/* 後台保護區域 */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/add" element={<AddAnnouncement />} />
                        <Route path="/admin/manage" element={<ManageBulletins />} />
                        <Route path="/admin/edit/:id" element={<EditBulletin />} />
                    </Route>
                </Routes>
            </div>

            {/* 2. 加入 Footer */}
            <Footer />
        </Router>
    );
}

export default App;
