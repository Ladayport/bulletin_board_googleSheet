# Google Apps Script 後端更新指南

## 需要新增的 GAS 程式碼

請在您的 Google Apps Script `Code.gs` 中的 `handleGetAction` 函式內新增以下 case：

```javascript
case 'getBulletinsByFilter':
  // 依類別與日期範圍查詢公告
  const dataSheet = ss.getSheetByName('公佈欄資料');
  if (!dataSheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

  const category = params.category;
  const startDate = params.startDate; // 格式: YYYY-MM-DD
  const endDate = params.endDate;     // 格式: YYYY-MM-DD

  const rows = dataSheet.getDataRange().getValues();
  rows.shift(); // 移除標題列

  // 過濾條件：
  // 1. 狀態不是 'D' (未刪除)
  // 2. 類別符合
  // 3. 開始日期在範圍內
  const filtered = rows.filter(row => {
    // 狀態檢查 (欄位 11)
    if ((row[11] || '') === 'D') return false;
    
    // 類別檢查 (欄位 3)
    if (row[3] !== category) return false;
    
    // 日期檢查 (欄位 4: 開始日期)
    const bulletinDate = formatDate(row[4]); // 轉換為 YYYY/MM/DD
    const bulletinDateObj = new Date(bulletinDate.replace(/\//g, '-')); // 轉為 Date 物件
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    
    if (bulletinDateObj < filterStart || bulletinDateObj > filterEnd) return false;
    
    return true;
  });

  const bulletins = filtered.map(row => ({
    id: row[0],
    title: row[1],
    content: row[2],
    category: row[3],
    startDate: formatDate(row[4]),
    startTime: formatTime(row[5]),
    endDate: formatDate(row[6]),
    endTime: formatTime(row[7]),
    isUrgent: row[8],
    fileUrl: row[9],
    fileType: row[10]
  }));

  return { success: true, bulletins };
```

## 完整的 handleGetAction 函式範例

將上述 case 加入到您現有的 `handleGetAction` 函式中，位置如下：

```javascript
function handleGetAction(action, params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  switch(action) {
    case 'getHomeData':
      // ... 現有程式碼 ...
      
    case 'getBulletinsByFilter':
      // ← 在這裡加入上面的程式碼
      
    default:
      return { success: false, message: 'Unknown action' };
  }
}
```

## 部署步驟

1. 複製上述程式碼到您的 `Code.gs`
2. 點擊「部署」→「管理部署」
3. 點擊現有部署旁的「編輯」圖示
4. 選擇「新版本」
5. 點擊「部署」

> **注意**：使用「新版本」更新不會改變部署網址，前端不需要修改 `.env` 檔案。

## 測試建議

1. **查詢測試**：
   - 在前端選擇類別與日期範圍
   - 點擊查詢，確認結果正確顯示
   
2. **編輯測試**：
   - 點擊編輯按鈕，確認在新分頁開啟
   - 修改資料後儲存，檢查 Google Sheet 是否更新
   - 檢查 Log 工作表是否記錄「修改公告」

3. **刪除測試**：
   - 點擊刪除按鈕，確認有確認對話框
   - 刪除後檢查 Google Sheet 狀態欄位是否變為 `D`
    - 確認前端列表不再顯示該公告
    - 檢查 Log 工作表是否記錄「刪除公告」

---

## 2026/06/14 更新：工程詢價與報價歷程管理功能

為了解決工程項目發起前的前期詢價比價、多廠商報價管理、投票單彙整匯出需求，GAS 後端程式碼 `Code.gs` 已新增下列幾個 Action 處理：

### 1. 讀取與新增 Action (handleGetAction & handlePostAction)
請將 `Code.gs` 中新增的 case 區段完整部署至您的 GAS Web App：
- `handleGetAction` 新增了 `getInquiryData` case
- `handlePostAction` 新增了 `addInquiry`、`addQuote`、`updateInquiryStatus`、`deleteInquiry` 等 case

並於 `Code.gs` 的最底部加上 `getOrCreateInquirySheet(ss)` 輔助函式。這會在您第一次讀取詢價資料時，**自動在您的 Google 試算表中建立一個名為「工程詢價資料」的新分頁/工作表**。

### 2. 部署新版本
請務必照著「部署步驟」建立一個**新版本**（不要建立新部署網址，僅以新版本升級），讓前端可以直接與新增的 API 方法通訊。
