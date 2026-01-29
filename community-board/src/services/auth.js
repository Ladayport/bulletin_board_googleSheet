import { api } from './api';

export const authService = {
    login: async (username, password) => {
        try {
            const result = await api.post('login', { username, password });

            if (result.success) {
                localStorage.setItem('authToken', result.token);
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
        return !!localStorage.getItem('authToken');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
