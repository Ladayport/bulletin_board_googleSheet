import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useEffect } from 'react';

const PrivateRoute = ({ requiredLevel = 99 }) => {
    // 檢查是否登入
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 檢查權限等級
    const userLevel = authService.getUserLevel();
    if (userLevel < requiredLevel) {
        // 權限不足，透過 setTimeout 確保在重新導向前能順利彈出提示
        setTimeout(() => {
            alert('您的權限不足，無法進入此頁面！');
        }, 10);
        // 權限不足，重導向到首頁
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
