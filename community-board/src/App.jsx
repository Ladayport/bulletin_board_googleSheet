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

function App() {
    return (
        <Router>
            <ScrollToTop />
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
        </Router>
    );
}

export default App;
