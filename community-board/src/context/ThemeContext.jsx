import { createContext, useContext, useState, useEffect } from 'react';
import { THEME_SCHEDULE } from '../config/themeSchedule';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('default');

    // 核心邏輯：檢查現在時間應該用什麼主題
    const checkTimeBasedTheme = () => {
        const now = new Date();
        // 將時間正規化 (只比對日期，忽略幾點幾分)
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentDate = String(now.getDate()).padStart(2, '0');

        const todayString = `${currentYear}-${currentMonth}-${currentDate}`;

        // 預設主題
        let matchedTheme = 'default';

        // 遍歷排程表
        for (const item of THEME_SCHEDULE) {
            if (todayString >= item.start && todayString <= item.end) {
                matchedTheme = item.id;
                break; // 找到第一個符合的就停止 (優先權由上而下)
            }
        }

        return matchedTheme;
    };

    useEffect(() => {
        // 1. 初次載入時執行一次
        const currentTheme = checkTimeBasedTheme();
        setTheme(currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);
        console.log(`目前主題：${currentTheme} (依據時間排程)`);

        // 2. 設定計時器，每 60 秒檢查一次 (避免使用者跨日掛網沒更新)
        const intervalId = setInterval(() => {
            const newTheme = checkTimeBasedTheme();
            if (newTheme !== theme) {
                setTheme(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        }, 60000);

        return () => clearInterval(intervalId); // 清除計時器
    }, [theme]); // 加入 theme 依賴以確保比較正確

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
