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
  },

  /**
   * 依類別與日期範圍查詢公告
   */
  getBulletinsByFilter: async (category, startDate, endDate) => {
    return api.get('getBulletinsByFilter', { category, startDate, endDate });
  },

  /**
   * 編輯公告
   */
  editBulletin: async (bulletinData) => {
    return api.post('editBulletin', bulletinData);
  },

  /**
   * 刪除公告（軟刪除）
   */
  deleteBulletin: async (id, operator) => {
    return api.post('deleteBulletin', { id, operator });
  },

  /**
   * 取得所有詢價項目資料
   */
  getInquiries: async () => {
    return api.get('getInquiryData');
  },

  /**
   * 新增一筆詢價項目
   */
  addInquiry: async (inquiryData) => {
    return api.post('addInquiry', inquiryData);
  },

  /**
   * 為詢價項目新增一筆廠商報價歷程 (包含檔案上傳)
   */
  addQuote: async (quoteData) => {
    return api.post('addQuote', quoteData);
  },

  /**
   * 更新詢價項目狀態 (新單, 詢價, 計畫終止, 結案)
   */
  updateInquiryStatus: async (id, status, operator) => {
    return api.post('updateInquiryStatus', { id, status, operator });
  },

  /**
   * 刪除詢價項目 (軟刪除)
   */
  deleteInquiry: async (id, operator) => {
    return api.post('deleteInquiry', { id, operator });
  },

  /**
   * 取得報修單主檔列表
   */
  getRepairTickets: async (username) => {
    return api.get('getRepairTickets', { username });
  },

  /**
   * 取得報修單的對話歷程
   */
  getRepairLogs: async (ticketId) => {
    return api.get('getRepairLogs', { ticketId });
  },

  /**
   * 新增報修單
   */
  addRepairTicket: async (ticketData) => {
    return api.post('addRepairTicket', ticketData);
  },

  /**
   * 新增報修歷程回覆、住戶補充說明或推進狀態
   */
  addRepairLog: async (logData) => {
    return api.post('addRepairLog', logData);
  },

  /**
   * 同步並取得動態頁面權限設定
   */
  syncPagePermissions: async (operator, pages) => {
    return api.post('syncPagePermissions', { operator, pages });
  },

  /**
   * 更新特定頁面的權限與啟用狀態
   */
  updatePagePermission: async (operator, code, level, is_use) => {
    return api.post('updatePagePermission', { operator, code, level, is_use });
  }
};
