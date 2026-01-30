# 階段六：自動排程主題系統 (Phase 6: Time-Based Auto Theming)

## 🎯 階段目標

1. **建立 10 種風格樣式庫**：包含您指定的「溫馨奶茶風」，以及節慶、季節等 10 種預設變數。
2. **建立時間排程表**：在前端設定好全年的時間表（如：過年、聖誕節、夏天）。
3. **實作自動切換邏輯**：系統會自動檢查「現在時間」，若落在某個區間內就套用該樣式，否則回歸預設。

---

## 1. 建立樣式庫 (CSS Variables)

我們將 CSS 變數擴充為 10 種主題。

### 修改 `src/styles/variables.css`

請使用以下內容**完全取代**原檔案：

```css
/* =========================================
   1. 預設樣式 (Default) - 科技藍
   ========================================= */
:root, [data-theme="default"] {
  --primary-color: #007bff;
  --primary-hover: #0056b3;
  --secondary-color: #6c757d;
  --accent-color: #ff9800;
  --bg-body: #f4f6f9;
  --bg-card: #ffffff;
  --text-main: #333333;
  --text-muted: #666666;
  --border-color: #e9ecef;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --radius-lg: 16px;
}

/* =========================================
   2. 溫馨奶茶風 (Cozy) - 指定需求
   ========================================= */
[data-theme="cozy"] {
  --primary-color: #8a9a5b;        /* 亞麻綠 */
  --primary-hover: #6e7c49;
  --secondary-color: #8d8070;
  --accent-color: #d4a373;         /* 焦糖色 */
  --bg-body: #f5f0e6;              /* 奶茶/燕麥色背景 */
  --bg-card: #ffffff;
  --text-main: #5c5346;            /* 暖深灰 */
  --text-muted: #9c9285;
  --border-color: #e6e2dd;
  --shadow-sm: 0 2px 4px rgba(138, 154, 91, 0.1);
  --shadow-md: 0 6px 12px rgba(138, 154, 91, 0.15);
  --radius-lg: 20px;
}

/* =========================================
   3. 暗黑模式 (Dark)
   ========================================= */
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --primary-hover: #3b82f6;
  --secondary-color: #94a3b8;
  --accent-color: #fbbf24;
  --bg-body: #0f172a;              /* 深藍黑 */
  --bg-card: #1e293b;              /* 卡片深灰 */
  --text-main: #f1f5f9;            /* 淺白 */
  --text-muted: #94a3b8;
  --border-color: #334155;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.5);
  --radius-lg: 16px;
}

/* =========================================
   4. 新年喜慶 (NewYear) - 紅金配色
   ========================================= */
[data-theme="newyear"] {
  --primary-color: #e11d48;        /* 喜慶紅 */
  --primary-hover: #be123c;
  --secondary-color: #fbbf24;      /* 金色 */
  --accent-color: #f59e0b;
  --bg-body: #fff1f2;              /* 淺粉背景 */
  --bg-card: #ffffff;
  --text-main: #881337;
  --text-muted: #be123c;
  --border-color: #fecdd3;
  --radius-lg: 16px;
}

/* =========================================
   5. 春天櫻花 (Spring) - 粉嫩系
   ========================================= */
[data-theme="spring"] {
  --primary-color: #ec4899;        /* 櫻花粉 */
  --primary-hover: #db2777;
  --secondary-color: #fbcfe8;
  --bg-body: #fdf2f8;
  --bg-card: #ffffff;
  --text-main: #831843;
  --text-muted: #be185d;
  --border-color: #fce7f3;
}

/* =========================================
   6. 夏日海洋 (Summer) - 清涼藍
   ========================================= */
[data-theme="summer"] {
  --primary-color: #06b6d4;        /* 青藍色 */
  --primary-hover: #0891b2;
  --bg-body: #ecfeff;
  --bg-card: #ffffff;
  --text-main: #164e63;
  --text-muted: #155e75;
  --border-color: #cffafe;
}

/* =========================================
   7. 秋日楓葉 (Autumn) - 橘褐系
   ========================================= */
[data-theme="autumn"] {
  --primary-color: #ea580c;        /* 楓葉橘 */
  --primary-hover: #c2410c;
  --bg-body: #fff7ed;
  --bg-card: #ffffff;
  --text-main: #7c2d12;
  --text-muted: #9a3412;
  --border-color: #ffedd5;
}

/* =========================================
   8. 冬日冰雪 (Winter) - 銀白灰
   ========================================= */
[data-theme="winter"] {
  --primary-color: #64748b;        /* 冰雪灰藍 */
  --primary-hover: #475569;
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #334155;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

/* =========================================
   9. 萬聖節 (Halloween) - 紫橘怪誕
   ========================================= */
[data-theme="halloween"] {
  --primary-color: #9333ea;        /* 巫婆紫 */
  --primary-hover: #7e22ce;
  --secondary-color: #f97316;      /* 南瓜橘 */
  --bg-body: #2e1065;              /* 深紫背景 */
  --bg-card: #ffffff;
  --text-main: #3b0764;
  --text-muted: #6b21a8;
  --border-color: #d8b4fe;
}

/* =========================================
   10. 賽博龐克 (Cyberpunk) - 霓虹
   ========================================= */
[data-theme="cyberpunk"] {
  --primary-color: #f000ff;        /* 霓虹粉 */
  --primary-hover: #c000cc;
  --accent-color: #00ff9f;         /* 霓虹綠 */
  --bg-body: #050505;              /* 極黑 */
  --bg-card: #1a1a1a;
  --text-main: #ffffff;
  --text-muted: #a3a3a3;
  --border-color: #333;
  --shadow-sm: 0 0 10px rgba(240, 0, 255, 0.3);
  --shadow-md: 0 0 20px rgba(240, 0, 255, 0.4);
}
```

---

## 2. 建立排程設定檔 (Config File)

請在 `src` 資料夾下建立一個 `config` 資料夾，並新增 `themeSchedule.js`。
這就是您的「控制中心」，您可以在這裡設定每一年的檔期。

### `src/config/themeSchedule.js`

```javascript
/**
 * 主題排程表
 * 系統會由上而下檢查，只要符合當前時間，就套用該樣式。
 * 若都沒有符合，則套用 'default'。
 * 
 * 格式範例：
 * {
 *   id: 'newyear',          // 對應 CSS 的 [data-theme="..."]
 *   start: '2026-02-01',    // 開始日期 (包含)
 *   end: '2026-02-20',      // 結束日期 (包含)
 *   description: '農曆新年' // 備註 (程式不讀取，給人看的)
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
    id: 'newyear', // 聖誕節用 NewYear 紅色系替代，或建立 christmas
    start: '2026-12-21',
    end: '2026-12-31',
    description: '聖誕跨年'
  },
  // --- 測試用：您可以把下方時間改成今天的日期來測試「溫馨風」是否生效 ---
  {
    id: 'cozy',
    start: '2026-01-01', 
    end: '2026-02-14', // 假設現在是這段期間，會顯示溫馨風
    description: '日常溫馨風 (測試)'
  }
];
```

---

## 3. 實作自動判斷邏輯 (Context Logic)

修改 `src/context/ThemeContext.jsx`。
我們加入一個計時器，每分鐘檢查一次時間，確保使用者掛在網頁上也能自動變色。

### `src/context/ThemeContext.jsx`

```javascript
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
  }, []); // 空依賴陣列，只在 component mount 時執行設定

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

---

## 4. 驗證與測試

因為這依賴「真實日期」，測試時請手動修改 `src/config/themeSchedule.js`。

### 測試步驟：

1. **確認今天日期**：例如今天是 `2026-01-30`。
2. **修改排程**：
   開啟 `src/config/themeSchedule.js`，找到 `cozy` (溫馨風) 那一段，確保今天的日期落在它的區間內。
   ```javascript
   {
     id: 'cozy',
     start: '2026-01-29',  // 昨天
     end: '2026-02-05',    // 未來
     description: '強制測試溫馨風'
   }
   ```

3. **觀察網頁**：
   重新整理網頁，您的網站應該會立刻變成 **奶茶色背景 + 亞麻綠按鈕** 的風格。

4. **測試預設值**：
   將 `cozy` 的 `end` 改為 `2026-01-29` (昨天結束)。重新整理網頁，網站應該會變回 **預設藍色**。

---

## 💡 小提示

* **優先權**：排程陣列 (`THEME_SCHEDULE`) 是**由上而下**判斷的。如果時間有重疊（例如「冬季」和「聖誕節」重疊），**寫在上面的會優先被採用**。
* **跨年份**：目前的字串比對邏輯 `'2026-12-01'` 適合單一年份。如果要每年自動循環，邏輯會更複雜一點（忽略年份只比對月日）。目前的寫法是最穩定的，您只需要每年年初更新一次這個檔案即可。
