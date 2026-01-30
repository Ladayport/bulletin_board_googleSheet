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
        
        // 過濾掉狀態為 'D' (刪除) 的資料
        // 對應欄位索引: id(0)... 狀態(11)
        // 如果狀態欄位不存在（row.length < 12），視為未刪除
        const activeRows = rows.filter(row => {
          if (row.length < 12) return true; // 沒有狀態欄位，視為有效資料
          return (row[11] || '') !== 'D';
        });

        // 對應欄位: id(0), 標題(1), 內容(2), 類別(3), 開始日期(4), 開始時間(5), 結束日期(6), 結束時間(7), 緊急公告標記(8), 檔案連結(9), 檔案類型(10)
        bulletins = activeRows.map(row => ({
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
        })).reverse(); // 反轉順序，讓最新的在前面
      }

      // 3. 取得統計數據 (只統計未刪除的)
      const stats = {
        notice: bulletins.filter(b => b.category === '公告').length,
        activities: bulletins.filter(b => b.category === '活動').length,
        meeting: bulletins.filter(b => b.category === '會議').length,
        lostAndFound: bulletins.filter(b => b.category === '失物').length,
        others: bulletins.filter(b => b.category === '其他').length,
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

    case 'getBulletinsByFilter':
      // 依類別與日期範圍查詢公告
      const filterDataSheet = ss.getSheetByName('公佈欄資料');
      if (!filterDataSheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

      const category = params.category;
      const startDate = params.startDate; // 格式: YYYY-MM-DD
      const endDate = params.endDate;     // 格式: YYYY-MM-DD

      const filterRows = filterDataSheet.getDataRange().getValues();
      filterRows.shift(); // 移除標題列

      // Debug: 記錄查詢條件
      Logger.log('查詢條件 - 類別: ' + category + ', 開始: ' + startDate + ', 結束: ' + endDate);
      Logger.log('總資料筆數: ' + filterRows.length);

      // 過濾條件：
      // 1. 狀態不是 'D' (未刪除)
      // 2. 類別符合
      // 3. 開始日期在範圍內
      const filtered = filterRows.filter(row => {
        // 狀態檢查 (欄位 11)
        if (row.length >= 12 && (row[11] || '') === 'D') {
          Logger.log('過濾: 狀態為 D - ID: ' + row[0]);
          return false;
        }
        
        // 類別檢查 (欄位 3)
        if (row[3] !== category) {
          Logger.log('過濾: 類別不符 - ID: ' + row[0] + ', 類別: ' + row[3] + ' vs ' + category);
          return false;
        }
        
        // 日期檢查 (欄位 4: 開始日期)
        try {
          const bulletinDate = formatDate(row[4]); // 轉換為 YYYY/MM/DD
          Logger.log('公告日期: ' + bulletinDate + ' (原始: ' + row[4] + ')');
          
          // 將 YYYY/MM/DD 轉為 Date 物件
          const dateParts = bulletinDate.split('/');
          const bulletinDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          
          // 將 YYYY-MM-DD 轉為 Date 物件
          const filterStart = new Date(startDate);
          const filterEnd = new Date(endDate);
          
          Logger.log('比較: ' + bulletinDateObj.toISOString() + ' vs ' + filterStart.toISOString() + ' ~ ' + filterEnd.toISOString());
          
          if (bulletinDateObj < filterStart || bulletinDateObj > filterEnd) {
            Logger.log('過濾: 日期不在範圍 - ID: ' + row[0]);
            return false;
          }
        } catch (e) {
          Logger.log('日期解析錯誤: ' + e.toString());
          return false;
        }
        
        Logger.log('通過: ID: ' + row[0]);
        return true;
      });

      Logger.log('過濾後筆數: ' + filtered.length);

      const filteredBulletins = filtered.map(row => ({
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

      return { success: true, bulletins: filteredBulletins };

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
        '', // 結束日期
        '', // 結束時間
        data.isUrgent || '',
        fileUrl,
        data.fileType,
        '' // 狀態欄位 (預設為空)
      ]);

      writeLog(ss, data.operator || 'Admin', `新增公告: ${data.title}`);
      return { success: true, message: '發佈成功' };

    case 'editBulletin':
      return updateBulletin(ss, data, false); // false 代表不是刪除

    case 'deleteBulletin':
      return updateBulletin(ss, data, true); // true 代表是刪除模式

    default:
      return { success: false, message: 'Unknown POST action' };
  }
}

// --- 處理修改與刪除的邏輯 ---
function updateBulletin(ss, data, isDelete) {
  const sheet = ss.getSheetByName('公佈欄資料');
  if (!sheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

  const rows = sheet.getDataRange().getValues();
  // 尋找對應 ID 的列索引 (Row Index)
  // rows[i][0] 是 ID 欄位
  const rowIndex = rows.findIndex(row => row[0].toString() === data.id.toString());

  if (rowIndex === -1) {
    return { success: false, message: '找不到該筆資料 ID: ' + data.id };
  }

  // 試算表的列號是從 1 開始，陣列是從 0 開始，所以實際列號是 rowIndex + 1
  const actualRow = rowIndex + 1;

  if (isDelete) {
    // --- 刪除模式 (Soft Delete) ---
    // 第 12 欄是「狀態」，寫入 'D'
    sheet.getRange(actualRow, 12).setValue('D');
    
    // 寫入 Log - 包含 ID 資訊
    const logMessage = `刪除公告 [ID: ${data.id}] 標題: ${rows[rowIndex][1]}`;
    writeLog(ss, data.operator || 'Admin', logMessage);
    return { success: true, message: '刪除成功' };
    
  } else {
    // --- 修改模式 ---
    
    // 記錄修改前的資料
    const oldData = {
      title: rows[rowIndex][1],
      content: rows[rowIndex][2],
      category: rows[rowIndex][3],
      isUrgent: rows[rowIndex][8],
      fileUrl: rows[rowIndex][9]
    };
    
    // 1. 如果有新圖片，先上傳並取得新連結
    let newFileUrl = data.originalFileUrl; // 預設保留舊連結
    if (data.fileData && data.fileName) {
       newFileUrl = saveFileToDrive(data.fileData, data.fileName, data.fileType);
    }

    // 2. 更新欄位 (依序更新，不變更 ID)
    // 欄位順序: id(1), 標題(2), 內容(3), 類別(4), 開始日期(5), 時間(6), 結日(7), 結時(8), 緊急(9), 連結(10), 類型(11)
    
    sheet.getRange(actualRow, 2).setValue(data.title);       // 標題
    sheet.getRange(actualRow, 3).setValue(data.content);     // 內容
    sheet.getRange(actualRow, 4).setValue(data.category);    // 類別
    sheet.getRange(actualRow, 9).setValue(data.isUrgent || ''); // 緊急
    sheet.getRange(actualRow, 10).setValue(newFileUrl);      // 檔案連結
    sheet.getRange(actualRow, 11).setValue(data.fileType);   // 檔案類型

    // 建立修改記錄
    const changes = [];
    if (oldData.title !== data.title) changes.push(`標題: "${oldData.title}" → "${data.title}"`);
    if (oldData.content !== data.content) changes.push(`內容已修改`);
    if (oldData.category !== data.category) changes.push(`類別: "${oldData.category}" → "${data.category}"`);
    if (oldData.isUrgent !== (data.isUrgent || '')) changes.push(`緊急標記: "${oldData.isUrgent}" → "${data.isUrgent || ''}"`);
    if (oldData.fileUrl !== newFileUrl) changes.push(`檔案已更新`);
    
    const changeLog = changes.length > 0 ? ` | 變更: ${changes.join('; ')}` : '';
    const logMessage = `修改公告 [ID: ${data.id}] 標題: ${data.title}${changeLog}`;
    
    // 寫入 Log
    writeLog(ss, data.operator || 'Admin', logMessage);
    return { success: true, message: '修改成功' };
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
