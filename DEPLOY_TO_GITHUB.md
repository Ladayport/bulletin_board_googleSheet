# GitHub Pages 部署指南 (React + Vite)

本文件說明如何將此 React 專案設定並部署至 GitHub Pages。請依序完成以下四個步驟。

> **注意**：本指南假設您的 GitHub Repository 名稱是 `bulletin_board_googlesheet`。如果您的專案名稱不同，請自行替換下方程式碼中的名稱。

---

## 步驟 1：修改 `vite.config.js`

設定 `base` 路徑，讓 Vite 知道網站在 GitHub 上的子路徑位置。

**檔案位置：** `community-board/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  // --- [修改] 新增 base 設定 (前後都要有斜線) ---
  base: '/bulletin_board_googlesheet/', 
})

```

---

## 步驟 2：修改 `src/App.jsx`

將路由模式從 `BrowserRouter` 改為 `HashRouter`，以避免 GitHub Pages 重新整理後發生 404 錯誤。

**檔案位置：** `community-board/src/App.jsx`

```javascript
// --- [修改] 將 BrowserRouter 改為 HashRouter ---
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// --------------------------------------------------

import Home from './pages/Home';
// ... (其他 imports 保持不變)

function App() {
    return (
        <Router>
            {/* ... (內容保持不變) */}
        </Router>
    );
}

export default App;

```

---

## 步驟 3：修改 `package.json`

安裝部署工具並新增執行腳本。

**檔案位置：** `community-board/package.json`

在 `scripts` 區塊中加入 `predeploy` 與 `deploy` 指令：

```json
{
  "name": "community-board",
  // ...
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",

    // --- [修改] 新增這兩行 ---
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    // -----------------------
  },
  // ...
}

```

---

## 步驟 4：執行部署 (終端機操作)

請開啟終端機 (Terminal)，確保路徑位於 `community-board` 資料夾內，然後依序執行：

### 1. 安裝部署套件 (只需執行一次)

```bash
npm install gh-pages --save-dev

```

### 2. 執行部署

每次更新網站內容後，都需要執行此指令：

```bash
npm run deploy

```

### 3. 驗證

當終端機顯示 **Published** 字樣後，等待約 1~2 分鐘，前往您的 GitHub Repository 頁面：

* 點選 **Settings** > **Pages**
* 上方會顯示綠色的成功訊息與您的網站網址 (例如：`https://您的帳號.github.io/bulletin_board_googlesheet/`)
