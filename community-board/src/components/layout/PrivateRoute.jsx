import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useEffect } from 'react';

const PrivateRoute = ({ pageCode, requiredLevel = null }) => {
    // 檢查是否登入
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 取得使用者真實層級
    const userLevel = authService.getUserLevel();
    
    // 如果傳入了 pageCode，表示使用動態權限
    let finalRequiredLevel = requiredLevel !== null ? requiredLevel : 99;
    let isFeatureEnabled = 'Y';

    if (pageCode) {
        const perm = authService.getPagePermission(pageCode);
        finalRequiredLevel = perm.level;
        isFeatureEnabled = perm.is_use;
    }

    if (userLevel < finalRequiredLevel || isFeatureEnabled !== 'Y') {
        // 權限不足或功能未啟用，透過 setTimeout 確保在重新導向前能順利彈出提示
        setTimeout(() => {
            if (isFeatureEnabled !== 'Y') {
                alert('該功能目前尚未開放使用！');
            } else {
                alert('您的權限不足，無法進入此頁面！');
            }
        }, 10);
        // 重導向到首頁
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
