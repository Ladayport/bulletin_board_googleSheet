const GAS_URL = import.meta.env.VITE_GAS_URL;

export const api = {
  /**
   * 發送 POST 請求
   */
  post: async (action, data = {}) => {
    try {
      const payload = {
        action,
        ...data
      };

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * 發送 GET 請求
   */
  get: async (action, params = {}) => {
    try {
      const url = new URL(GAS_URL);
      url.searchParams.append('action', action);

      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }
};
