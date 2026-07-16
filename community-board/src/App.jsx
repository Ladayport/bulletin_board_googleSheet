// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import EngineeringPage from './pages/EngineeringPage';
import EngineeringListPage from './pages/EngineeringListPage';
import EngineeringDetail from './pages/EngineeringDetail';
import ScrollToTop from './components/ui/ScrollToTop';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAnnouncement from './pages/admin/AddAnnouncement';
import ManageBulletins from './pages/admin/ManageBulletins';
import EditBulletin from './pages/admin/EditBulletin';
import QuoteInquiryPage from './pages/admin/QuoteInquiryPage';
import QuoteVotePage from './pages/admin/QuoteVotePage';
import InquiryViewPage from './pages/InquiryViewPage';
import PrivateRoute from './components/layout/PrivateRoute';
import Footer from './components/layout/Footer';

// 新增功能建議版型頁面
import RepairPage from './pages/RepairPage';
import DownloadPage from './pages/DownloadPage';
import ForumPage from './pages/ForumPage';
import GasPage from './pages/GasPage';
import BookingPage from './pages/BookingPage';
import PackagePage from './pages/PackagePage';
import VisitorPage from './pages/VisitorPage';

function App() {
    return (
        <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }} basename="/bulletin_board_googleSheet">
            <ScrollToTop />

            {/* 內容區域用 div 包裹以確保 Footer 被推到最底 (Sticky Footer 結構可選) */}
            <div style={{ minHeight: 'calc(100vh - 150px)' }}>
                <Routes>
                    {/* 公開頁面 */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/category/lost-found" element={<EngineeringListPage />} />
                    <Route path="/category/lost-found/board" element={<EngineeringPage />} />
                    <Route path="/category/lost-found/:id" element={<EngineeringDetail />} />
                    <Route path="/category/engineering" element={<EngineeringListPage />} />
                    <Route path="/category/engineering/board" element={<EngineeringPage />} />
                    <Route path="/category/engineering/:id" element={<EngineeringDetail />} />
                    <Route path="/engineering/inquiries" element={<InquiryViewPage />} />
                    
                    {/* 新增的卡片對應路由 */}
                    <Route path="/repair" element={<RepairPage />} />
                    <Route path="/download" element={<DownloadPage />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/gas" element={<GasPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/package" element={<PackagePage />} />
                    <Route path="/visitor" element={<VisitorPage />} />

                    <Route path="/category/:type" element={<CategoryPage />} />

                    {/* 後台保護區域 */}
                    <Route element={<PrivateRoute requiredLevel={99} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/add" element={<AddAnnouncement />} />
                        <Route path="/admin/manage" element={<ManageBulletins />} />
                        <Route path="/admin/edit/:id" element={<EditBulletin />} />
                        <Route path="/admin/inquiry" element={<QuoteInquiryPage />} />
                        <Route path="/admin/inquiry/vote" element={<QuoteVotePage />} />
                    </Route>
                </Routes>
            </div>

            {/* 2. 加入 Footer */}
            <Footer />
        </Router>
    );
}

export default App;
