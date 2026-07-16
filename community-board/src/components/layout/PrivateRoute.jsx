import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';

const PrivateRoute = ({ requiredLevel = 99 }) => {
    // 檢查是否登入
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 檢查權限等級
    const userLevel = authService.getUserLevel();
    if (userLevel < requiredLevel) {
        // 權限不足，重導向到首頁
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
