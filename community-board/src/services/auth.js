import { api } from './api';

export const authService = {
    login: async (username, password) => {
        try {
            const result = await api.post('login', { username, password });

            if (result.success) {
                const tokenData = {
                    token: result.token,
                    expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 小時後過期
                };
                localStorage.setItem('authToken', JSON.stringify(tokenData));
                localStorage.setItem('user', JSON.stringify(result.user));
                return { success: true, user: result.user };
            } else {
                throw new Error(result.message || '登入失敗');
            }
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('pagePermissions');
    },

    isAuthenticated: () => {
        try {
            const tokenData = localStorage.getItem('authToken');
            if (!tokenData) return false;

            const parsed = JSON.parse(tokenData);

            // 檢查 token 是否過期
            if (parsed.expiry && Date.now() > parsed.expiry) {
                // Token 已過期，清除
                authService.logout();
                return false;
            }

            return !!parsed.token;
        } catch (error) {
            // 如果解析失敗（可能是舊格式），清除並要求重新登入
            authService.logout();
            return false;
        }
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getUserLevel: () => {
        const user = authService.getUser();
        if (!user) return 0;
        if (user.level !== undefined) return parseInt(user.level, 10);
        return (user.role === 'admin' || user.role === '管理員') ? 99 : 1;
    },

    setPagePermissions: (permissions) => {
        localStorage.setItem('pagePermissions', JSON.stringify(permissions));
    },

    getPagePermissions: () => {
        const perms = localStorage.getItem('pagePermissions');
        return perms ? JSON.parse(perms) : [];
    },

    getPagePermission: (pageCode) => {
        const perms = authService.getPagePermissions();
        const found = perms.find(p => p.code === pageCode);
        if (found) return found;
        // 若找不到（可能是剛新增尚未同步），預設回傳 99 (最嚴格)
        return { code: pageCode, level: 99, is_use: 'Y' };
    }
};
