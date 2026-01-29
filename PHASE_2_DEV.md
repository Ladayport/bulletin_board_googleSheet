# 階段二：前端 UI 系統化與 CSS 統整 (Phase 2: UI Refinement & CSS System)

## 🎯 階段目標

1. 建立完整的 **CSS Variable 系統**，集中管理色票、圓角、陰影與間距。
2. 將行內樣式 (Inline Styles) 重構為 **CSS Modules** 或 **Class-based** 樣式，提升效能與可維護性。
3. 實作 **Modal (彈窗) 組件**，用於顯示公告詳情（不換頁體驗）。
4. 增強 **RWD 響應式設計**，確保手機版瀏覽順暢。
5. 增加微互動動畫 (Hover effects, Fade-in)。

---

## 1. CSS 架構重整 (CSS Architecture)

我們將樣式拆分為三個核心檔案。

### 1.1 `src/styles/variables.css` (全站設定檔)

這是未來您唯一需要調整的檔案。

```css
:root {
  /* --- 品牌色系 (Brand Colors) --- */
  --primary-color: #007bff;        /* 主色：按鈕、連結、強調 */
  --primary-hover: #0056b3;        /* 主色懸停 */
  --secondary-color: #6c757d;      /* 次要色：輔助文字、取消按鈕 */
  --success-color: #28a745;        /* 成功/活動 */
  --warning-color: #ffc107;        /* 警告/失物 */
  --danger-color: #dc3545;         /* 危險/緊急 */
  --info-color: #17a2b8;           /* 資訊/會議 */

  /* --- 背景與文字 (Background & Text) --- */
  --bg-body: #ffe29eff;              /* 網頁背景 */
  --bg-card: #ffffff;              /* 卡片背景 */
  --text-main: #333333;            /* 主要文字 */
  --text-muted: #666666;           /* 次要文字 */
  --border-color: #e9ecef;         /* 邊框顏色 */

  /* --- 佈局與形狀 (Layout & Shape) --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;               /* 卡片圓角 */
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 48px;

  /* --- 陰影 (Shadows) --- */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-hover: 0 10px 25px rgba(0,0,0,0.15);

  /* --- 動畫 (Transitions) --- */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}
```

### 1.2 `src/styles/animations.css` (動畫庫)

增加質感，避免畫面切換過於生硬。

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn var(--transition-normal) forwards;
}
```

### 1.3 `src/styles/main.css` (通用樣式)

取代原本的 `global.css`，並定義常用的 Utility Classes。

```css
@import './variables.css';
@import './animations.css';

body {
  background-color: var(--bg-body);
  color: var(--text-main);
  font-family: 'Segoe UI', system-ui, sans-serif;
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

/* 通用按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  gap: 8px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-body);
  color: var(--text-main);
}
.btn-secondary:hover {
  background-color: var(--border-color);
}

/* 標籤樣式 */
.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
}
```

---

## 2. 核心組件重構 (Component Refactoring)

將 Inline Style 移除，改用 ClassName。

### 2.1 卡片組件優化 (`src/components/ui/Card.jsx`)

新增 `.card` CSS 類別到 `main.css`，並在此引用。

```javascript
/* src/styles/main.css 追加內容
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: var(--transition-fast);
  border: 1px solid var(--border-color);
}
.card.interactive {
  cursor: pointer;
}
.card.interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
*/

import React from 'react';

const Card = ({ children, onClick, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`card ${onClick ? 'interactive' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
```

---

## 3. 新增功能組件 (New Features)

### 3.1 彈窗組件 (`src/components/ui/Modal.jsx`)

這是實現「不需換頁即可查看詳情」的關鍵組件。

```javascript
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '../../styles/Modal.css'; // 需要建立此 CSS

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // 鎖定背景滾動
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="btn-icon">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

**對應 CSS (`src/styles/Modal.css`)**:

```css
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px); /* 毛玻璃效果 */
}

.modal-content {
  background: var(--bg-card);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
}
.btn-icon:hover { color: var(--text-main); }
```

---

## 4. 首頁邏輯整合 (Home Logic Integration)

更新 `src/pages/Home.jsx` 以使用 Modal。

```javascript
import { useState } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import Modal from '../components/ui/Modal';
import { mockSiteData, mockBulletins, mockStats } from '../utils/mockData';

const Home = () => {
  // Modal 狀態管理
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  return (
    <div className="fade-in">
      <Header title={mockSiteData.title} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* 功能區塊 */}
        <section style={{ marginBottom: '32px' }}>
          <FeatureGrid stats={mockStats} />
        </section>

        {/* 公告區塊 - 傳入點擊處理函式 */}
        <section>
          <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>最新公告</h2>
          <BulletinSection 
            bulletins={mockBulletins} 
            onBulletinClick={(item) => setSelectedBulletin(item)} 
          />
        </section>
      </main>

      {/* 詳情彈窗 */}
      <Modal 
        isOpen={!!selectedBulletin} 
        onClose={() => setSelectedBulletin(null)}
        title={selectedBulletin?.category || '公告詳情'}
      >
        {selectedBulletin && (
          <div>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>
              {selectedBulletin.title}
            </h2>
            <div style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              發佈日期：{selectedBulletin.date}
            </div>
            <div style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {selectedBulletin.content}
            </div>
            {/* 未來這裡可以放附件下載按鈕 */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
```

---

## 5. 響應式優化 (Responsive Adjustments)

在 `src/styles/main.css` 中添加 Media Query，確保手機版排版正確。

```css
/* 手機版適配 */
@media (max-width: 768px) {
  :root {
    --spacing-lg: 16px; /* 縮小手機版間距 */
  }

  /* 功能區塊改為單欄 */
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  /* Modal 滿版顯示 */
  .modal-content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
```

---

## ✅ 階段二驗收標準

1. **全站變色測試**：試著將 `variables.css` 中的 `--primary-color` 改為紅色 (`#e63946`)，儲存後應看到按鈕、標題、Icon 顏色立即全部變更。
2. **Modal 測試**：點擊首頁任一公告卡片，應跳出彈窗顯示內容，且背景變暗模糊。點擊右上角 X 或背景可關閉彈窗。
3. **手機版測試**：使用瀏覽器開發者工具 (F12) 切換至手機模式 (iPhone SE)，確認卡片排版是否變為垂直堆疊，且間距舒適不擁擠。
4. **視覺一致性**：所有卡片圓角、陰影深度應完全一致。
