/**
 * 主題排程表
 * 系統會由上而下檢查,只要符合當前時間,就套用該樣式。
 * 若都沒有符合,則套用 'default'。
 * 
 * 格式範例：
 * {
 *   id: 'newyear',          // 對應 CSS 的 [data-theme="..."]
 *   start: '2026-02-01',    // 開始日期 (包含)
 *   end: '2026-02-20',      // 結束日期 (包含)
 *   description: '農曆新年' // 備註 (程式不讀取,給人看的)
 * }
 */

export const THEME_SCHEDULE = [
    {
        id: 'newyear',
        start: '2026-02-15',
        end: '2026-02-22',
        description: '農曆新年'
    },
    {
        id: 'spring',
        start: '2026-03-01',
        end: '2026-04-30',
        description: '春季櫻花'
    },
    {
        id: 'summer',
        start: '2026-06-01',
        end: '2026-08-31',
        description: '夏季海洋'
    },
    {
        id: 'halloween',
        start: '2026-10-25',
        end: '2026-10-31',
        description: '萬聖節'
    },
    {
        id: 'autumn',
        start: '2026-09-01',
        end: '2026-11-30',
        description: '秋季'
    },
    {
        id: 'winter',
        start: '2026-12-01',
        end: '2026-12-20',
        description: '冬季'
    },
    {
        id: 'newyear', // 聖誕節用 NewYear 紅色系替代,或建立 christmas
        start: '2026-12-21',
        end: '2026-12-31',
        description: '聖誕跨年'
    },
    // --- 測試用：您可以把下方時間改成今天的日期來測試「溫馨風」是否生效 ---
    {
        id: 'cozy',
        start: '2026-01-01',
        end: '2026-02-14', // 假設現在是這段期間,會顯示溫馨風
        description: '日常溫馨風 (測試)'
    }
];
