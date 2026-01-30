import { createContext, useContext, useState, useEffect } from 'react';
import { THEME_SCHEDULE } from '../config/themeSchedule';

// 建立主題上下文 (Context),用於跨組件傳遞主題狀態
const ThemeContext = createContext();

/**
 * 主題供應器組件 (ThemeProvider)
 * 負責管理系統主題的初始化與切換邏輯
 */
export const ThemeProvider = ({ children }) => {
    // 主題狀態,預設為 'default'
    const [theme, setTheme] = useState('default');

    /**
     * 核心邏輯：根據當前時間(月日)判斷應該套用的主題
     * 避免使用複雜的 Array 方法(如 find/filter),改用傳統 for 迴圈
     */
    const checkTimeBasedTheme = () => {
        // 取得當前系統時間
        const now = new Date();
        // 取得月份 (0-11,需 +1) 並補零
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        // 取得日期並補零
        const currentDate = String(now.getDate()).padStart(2, '0');

        // 組合為 MM-DD 格式 (例如: "01-30")
        const todayString = `${currentMonth}-${currentDate}`;

        // 預設套用的主題
        let matchedTheme = 'default';

        // 遍歷主題排程表 (THEME_SCHEDULE)
        // 使用傳統 for 迴圈,確保非專業工程人員也能輕易閱讀邏輯
        for (let i = 0; i < THEME_SCHEDULE.length; i++) {
            const scheduleItem = THEME_SCHEDULE[i];

            // 判斷今天是否在排程的開始與結束日期之間
            // 這裡使用字串直接比較 (串格式為 MM-DD)
            if (todayString >= scheduleItem.start && todayString <= scheduleItem.end) {
                // 若符合條件,紀錄主題名稱並跳出迴圈
                matchedTheme = scheduleItem.id;
                break;
            }
        }

        return matchedTheme;
    };

    /**
     * 當組件掛載(Mount)時執行
     * 只在網頁開啟時檢查一次,不使用定時器以節省效能
     */
    useEffect(() => {
        // 執行主題檢查
        const currentTheme = checkTimeBasedTheme();

        // 更新 React 狀態
        setTheme(currentTheme);

        // 將主題名稱寫入 HTML 標籤的 data-theme 屬性
        // 這樣 CSS 就能透過 [data-theme="cozy"] 等選擇器變更顏色
        document.documentElement.setAttribute('data-theme', currentTheme);

        // 於 Console 輸出日誌,方便維護人員追蹤
        console.log(`[ThemeSystem] 系統初始主題：${currentTheme} (檢查時間：${new Date().toLocaleString()})`);
    }, []); // 空陣列表示僅在頁面載入時執行一次

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * 自定義 Hook：供其他組件快速取得當前主題
 */
export const useTheme = () => useContext(ThemeContext);
