# 階段四：後端 API 開發與資料串接 (Phase 4: Backend API & Integration) - V2

🎯 **階段目標**
1. **Google Sheets 資料庫建置**：依照最新的欄位規格建立工作表。
2. **Google Drive 資料夾**：建立指定名稱資料夾並設定權限。
3. **Google Apps Script (GAS) 開發**：
    - 實作 `doGet` 與 `doPost`。
    - 配合新的 Users 表進行登入驗證（含 `is_use` 檢查）。
    - 配合新的 Bulletin 表欄位寫入資料。
    - 實作 Log 寫入功能。

---

## 1. Google Sheets 資料庫配置 (Database Setup)

請建立一個新的 Google Sheet，並依照下方規格建立 5 個工作表 (Tabs)。**請務必確保工作表名稱與欄位順序完全一致。**

### 1.1 工作表清單與欄位

**1. 網站設定 (Config)**
*   **用途**：儲存全域變數。
*   **欄位配置**：
    *   A1: Key, B1: Value
    *   A2: site_title, B2: 幸福社區雲端公佈欄

**2. 帳號管理 (Users)**
*   **用途**：管理後台登入者。
*   **欄位配置**：
    *   第一列 (Header): `usr_code`, `usr_pass`, `usr_name`, `usr_mail`, `usr_tel1`, `grp_code`, `is_use`
    *   第二列 (預設資料): `admin`, `admin`, `管理員`, `001@gmail.com`, `0912345678`, `0001`, `Y`
*   **備註**：`usr_code` 為登入帳號，`usr_pass` 為密碼，`is_use` 為 'Y' 才可登入。

**3. 公佈欄資料 (Bulletin)**
*   **用途**：儲存所有公告內容。
*   **欄位配置**：
    *   第一列 (Header): `id`, `標題`, `內容`, `類別`, `開始日期`, `開始時間`, `結束日期`, `結束時間`, `緊急公告標記`, `檔案連結`, `檔案類型`
*   **程式邏輯**：系統會將資料寫入此表，並依此讀取顯示於前台。

**4. 類別選單 (Category)**
*   **用途**：定義公告的分類。
*   **欄位配置**：
    *   第一列 (Header): `類別代碼`, `類別名稱`
    *   內容範例：
        ```text
        A0010, 公告通知
        B0020, 活動通知
        C0030, 會議通知
        D0040, 失物招領
        E0050, 其他通知
        ```

**5. 操作紀錄 (Log)**
*   **用途**：記錄後台操作行為。
*   **欄位配置**：
    *   第一列 (Header): `寫入日期`, `寫入時間`, `使用者`, `行為`

---

## 2. Google Drive 資料夾準備

1. 在您的 Google Drive 建立一個資料夾，命名為「**File_幸福社區雲端公佈欄**」。
2. 進入資料夾，複製網址列最後一串 ID (例如 `1A2b3C...`)。
3. ⚠️ **重要權限設定**：點擊共用，將此資料夾的權限設為 「**知道連結的任何人都能檢視**」(Viewer)。

---

## 3. Google Apps Script 後端開發 (Backend Code)

在 Google Sheet 中，點擊 **擴充功能 > Apps Script**，清空 `Code.gs`，貼上以下代碼：

### 3.1 Code.gs 完整代碼

```javascript
// --- 設定區 ---
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
// ⚠️ 請在此貼上步驟 2 取得的資料夾 ID
const IMAGE_FOLDER_ID = '1VbBxXXncyaAQdlv_x8-UYnq_LeDPgm_4'; 

// --- 核心入口 ---
function doGet(e) {
  const action = e.parameter.action;
  const result = handleGetAction(action, e.parameter);
  return responseJSON(result);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const result = handlePostAction(action, postData);
    return responseJSON(result);
  } catch (err) {
    return responseJSON({ success: false, message: "Server Error: " + err.toString() });
  }
}

// --- 邏輯分發 (Controller) ---

function handleGetAction(action, params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  switch(action) {
    case 'getHomeData':
      // 1. 取得標題 (工作表: 網站設定)
      const titleSheet = ss.getSheetByName('網站設定');
      const title = titleSheet ? titleSheet.getRange("B2").getValue() : "網站設定讀取失敗";
      
      // 2. 取得公告 (工作表: 公佈欄資料)
      const dataSheet = ss.getSheetByName('公佈欄資料');
      let bulletins = [];
      if (dataSheet) {
        const rows = dataSheet.getDataRange().getValues();
        rows.shift(); // 移除標題列
        
        // 對應欄位: id(0), 標題(1), 內容(2), 類別(3), 開始日期(4), 檔案連結(9), 檔案類型(10)
        bulletins = rows.map(row => ({
          id: row[0],
          title: row[1],
          content: row[2],
          category: row[3],
          date: formatDate(row[4]),
          fileUrl: row[9],
          fileType: row[10]
        })).reverse().slice(0, 20);
      }

      // 3. 取得統計數據
      // 對應類別: A0010(公告通知), B0020(活動通知), C0030(會議通知), D0040(失物招領), E0050(其他通知), QA(QA)
      const stats = {
        notice: bulletins.filter(b => b.category === '公告通知').length,
        activities: bulletins.filter(b => b.category === '活動通知').length,
        meeting: bulletins.filter(b => b.category === '會議通知').length,
        lostAndFound: bulletins.filter(b => b.category === '失物招領').length,
        others: bulletins.filter(b => b.category === '其他通知').length,
        qa: bulletins.filter(b => b.category === 'QA').length
      };

      // 4. 取得類別選單 (工作表: 類別選單)
      const catSheet = ss.getSheetByName('類別選單');
      let categories = [];
      if (catSheet) {
        const catRows = catSheet.getDataRange().getValues();
        catRows.shift();
        categories = catRows.map(r => ({ code: r[0], name: r[1] }));
      }

      return { success: true, siteTitle: title, bulletins, stats, categories };

    default:
      return { success: false, message: 'Unknown action' };
  }
}

function handlePostAction(action, data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  switch(action) {
    case 'login':
      // 工作表: 帳號管理
      const userSheet = ss.getSheetByName('帳號管理');
      if (!userSheet) return { success: false, message: '找不到 [帳號管理] 工作表' };
      
      const users = userSheet.getDataRange().getValues();
      users.shift(); // 移除 Header
      
      // 欄位: usr_code(0), usr_pass(1), usr_name(2), grp_code(5), is_use(6)
      const user = users.find(row => 
        row[0] == data.username && 
        row[1] == data.password && 
        row[6] == 'Y'
      );
      
      if (user) {
        writeLog(ss, user[2], '登入系統');
        return { success: true, token: 'gas-token-' + new Date().getTime(), user: { name: user[2], role: user[5] } };
      } else {
        return { success: false, message: '帳號密碼錯誤或帳號已停用' };
      }

    case 'addBulletin':
      // 工作表: 公佈欄資料
      const sheet = ss.getSheetByName('公佈欄資料');
      if (!sheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

      let fileUrl = '';
      if (data.fileData && data.fileName) {
        fileUrl = saveFileToDrive(data.fileData, data.fileName, data.fileType);
      }

      const newId = new Date().getTime().toString();
      const now = new Date();
      
      sheet.appendRow([
        newId,
        data.title,
        data.content,
        data.category,
        formatDate(now),
        formatTime(now),
        '',
        '',
        data.isUrgent || '',
        fileUrl,
        data.fileType
      ]);

      writeLog(ss, data.operator || 'Admin', `新增公告: ${data.title}`);
      return { success: true, message: '發佈成功' };

    default:
      return { success: false, message: 'Unknown POST action' };
  }
}

// --- 輔助函式 ---

function writeLog(ss, user, action) {
  const logSheet = ss.getSheetByName('Log');
  if (logSheet) {
    const now = new Date();
    logSheet.appendRow([
      formatDate(now),
      formatTime(now),
      user,
      action
    ]);
  }
}

function saveFileToDrive(base64Data, fileName, contentType) {
  try {
    const data = base64Data.split(',')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(data), contentType, fileName);
    const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    if (contentType.includes('image')) {
      return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
    } else {
      return file.getUrl();
    }
  } catch (e) {
    return 'Upload Failed: ' + e.toString();
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss");
}
```

### 3.2 部署 (Deployment)

1. 點擊右上角 **部署 (Deploy) > 新增部署 (New deployment)**。
2. 左側選擇 **網頁應用程式 (Web app)**。
3. 執行身分 (Execute as): 選擇 「**我 (Me)**」。
4. 誰可以存取 (Who has access): 選擇 「**所有人 (Anyone)**」。
5. 點擊 **部署**，複製產生的 **網頁應用程式網址 (Web App URL)**。

---

## 4. 前端對接說明 (Frontend Update)

由於資料庫欄位變更，前端在發送資料時需注意以下幾點（已包含在階段三的程式碼邏輯中，此處為再次確認）：

1. **環境變數**：在專案根目錄 `.env` 填入上述步驟產生的 URL。
   ```text
   VITE_GAS_URL=https://script.google.com/macros/s/AKfycbx-ojIJHoU01KNQCR_-Uw20iLDamIHHuqSUyRpY6zEBQZIkyESMn6BBfTa2SVEh_14/exec
   ```

2. **分類名稱對應**：
   前端下拉選單的 `value` 建議直接使用「中文名稱」（如 `公告通知`），這樣寫入資料庫時會直接存入中文，方便前台直接讀取顯示。若前端傳送的是代碼（如 `A0010`），則 GAS 或前端顯示時需再做一次對應轉換。目前 GAS 程式碼設計為直接儲存前端傳來的 `value`。

3. **登入測試帳號**：
   - 帳號：`admin`
   - 密碼：`admin`

---

## ✅ 階段四最終驗收

1. **Log 驗證**：使用 `admin` 登入後，檢查 Google Sheet 的 `Log` 工作表，應該會多一筆「登入系統」的紀錄。
2. **資料寫入**：發布一篇新公告，檢查 `Bulletin` 工作表是否依照新的欄位順序（id, 標題... 檔案類型）正確寫入。
3. **權限測試**：將 `Users` 表的 `is_use` 改為 `N`，嘗試登入，系統應拒絕登入。
