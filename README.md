# 幸福社區雲端公佈欄 (Community Bulletin Board)

這是一個結合 React 前端與 Google Apps Script (GAS) 後端的公佈欄系統。
資料儲存於 Google Sheets，圖片儲存於 Google Drive。

## 📁 專案結構
- `community-board/`: 前端 React 專案代碼
- `Code.gs`: 後端 Google Apps Script 代碼 (詳見 `PHASE_4_DEV_V2.md`)

## 🚀 快速開始 (Quick Start)

### 1. 環境準備
請確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v16 以上)。

### 2. 安裝依賴
開啟終端機 (Terminal) 或 PowerShell，進入專案資料夾並安裝套件：

```bash
cd community-board
npm install
```

### 3. 設定環境變數
確保 `community-board` 目錄下有 `.env` 檔案，並填入 Google Apps Script 部署網址：

```text
VITE_GAS_URL=https://script.google.com/macros/s/您的GAS_ID/exec
```
*(目前的部署網址已設定於檔案中)*

### 4. 啟動開發伺服器
執行以下指令啟動網頁：

```bash
npm run dev
```

### 5. 開啟網頁
啟動成功後，終端機將顯示網址。請用瀏覽器開啟：

- **首頁**: [http://localhost:5173](http://localhost:5173)
- **後台登入**: [http://localhost:5173/login](http://localhost:5173/login) (預設帳號: `admin` / `admin`)

---

## 🛠️ 功能說明

### 前台 (Home)
- **公告瀏覽**: 支援依照「公告」、「活動」、「會議」等類別篩選。
- **緊急公告**: 紅色標記並置頂顯示。
- **時效過濾**: 自動隱藏過期或尚未開始的公告。
- **圖片預覽**: 點擊列表的縮圖可查看大圖。

### 後台 (Admin)
- **發佈公告**: 支援標題、內容、時間設定、圖片上傳 (自動壓縮)。
- **緊急標記**: 可設定公告是否為緊急狀態。

### 後端 (Google Apps Script)
- 資料庫對應 Google Sheets: `網站設定`, `帳號管理`, `公佈欄資料`, `類別選單`, `Log`。
- 若需修改後端邏輯，請參考 `PHASE_4_DEV_V2.md` 並更新 GAS 專案。
