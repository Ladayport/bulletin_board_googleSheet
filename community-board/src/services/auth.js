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
    }
};
