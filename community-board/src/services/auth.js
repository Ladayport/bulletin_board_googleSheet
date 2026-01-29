// 模擬的登入邏輯
export const authService = {
    login: async (username, password) => {
        // 階段四將替換為呼叫 GAS API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin') {
                    localStorage.setItem('authToken', 'mock-token-123');
                    resolve({ success: true, user: { name: '管理員' } });
                } else {
                    reject({ success: false, message: '帳號或密碼錯誤' });
                }
            }, 800); // 模擬網路延遲
        });
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};
