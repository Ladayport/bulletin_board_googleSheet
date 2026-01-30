// --- 設定區 ---
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
// ⚠️ 請在此貼上步驟 2 取得的資料夾 ID
const IMAGE_FOLDER_ID = '1VbBxXXncyaAQdlv_x8-UYnq_LeDPgm_4'; 

/**
 * 處理 GET 請求
 * 主要用於讀取資料
 */
function doGet(e) {
  const action = e.parameter.action;
  const result = handleGetAction(action, e.parameter);
  return responseJSON(result);
}

/**
 * 處理 POST 請求
 * 主要用於新增、修改、刪除資料或登入
 */
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

/**
 * handleGetAction: 根據 action 執行對應的資料取回邏輯
 */
function handleGetAction(action, params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  switch(action) {
    case 'getHomeData':
      // 1. 取得網站標題 (從「網站設定」工作表的 B2 儲存格)
      const titleSheet = ss.getSheetByName('網站設定');
      const title = titleSheet ? titleSheet.getRange("B2").getValue() : "網站設定讀取失敗";
      
      // 2. 取得公告資料 (從「公佈欄資料」工作表)
      const dataSheet = ss.getSheetByName('公佈欄資料');
      let bulletins = [];
      if (dataSheet) {
        const rows = dataSheet.getDataRange().getValues();
        const header = rows.shift(); // 移除標題列
        
        const activeRows = [];
        // 使用傳統迴圈過濾掉已刪除 (狀態為 'D') 的資料
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // 如果狀態欄位(第 12 欄,索引 11) 不是 'D',則視為有效資料
          if (row.length < 12 || (row[11] || '') !== 'D') {
            activeRows.push(row);
          }
        }

        // 將原始陣列轉換為物件格式,方便前端使用
        // 改用迴圈逐筆處理,不使用 .map()
        const tempBulletins = [];
        for (let j = 0; j < activeRows.length; j++) {
          const r = activeRows[j];
          tempBulletins.push({
            id: r[0],
            title: r[1],
            content: r[2],
            category: r[3],
            startDate: formatDate(r[4]),
            startTime: formatTime(r[5]),
            endDate: formatDate(r[6]),
            endTime: formatTime(r[7]),
            isUrgent: r[8],
            fileUrl: r[9],
            fileType: r[10],
            status: r[11] || '' // 新增狀態欄位 (例如 'D' 為刪除)
          });
        }
        // 反轉陣列讓最新公告在最前面
        bulletins = tempBulletins.reverse();
      }

      // 3. 計算各類別統計數據 (僅計算今日有效的公告)
      const stats = { notice: 0, activities: 0, meeting: 0, lostAndFound: 0, others: 0, qa: 0 };
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 僅比較日期部分

      for (let k = 0; k < bulletins.length; k++) {
        const b = bulletins[k];
        
        // 解析資料中的日期 (格式為 YYYY/MM/DD)
        const sParts = b.startDate.split('/');
        const bStart = new Date(sParts[0], sParts[1] - 1, sParts[2]);
        
        let isValidToday = (bStart <= today); // 預設：已開始就算有效
        
        // 如果有結束日期，則需額外判斷是否已過期
        if (b.endDate) {
          const eParts = b.endDate.split('/');
          const bEnd = new Date(eParts[0], eParts[1] - 1, eParts[2]);
          bEnd.setHours(23, 59, 59, 999);
          if (today > bEnd) {
            isValidToday = false;
          }
        }

        // 只有今日有效且未被刪除的，才納入統計
        if (isValidToday && b.status !== 'D') {
          if (b.category === '公告') stats.notice++;
          else if (b.category === '活動') stats.activities++;
          else if (b.category === '會議') stats.meeting++;
          else if (b.category === '失物') stats.lostAndFound++;
          else if (b.category === '其他') stats.others++;
          else if (b.category === 'QA') stats.qa++;
        }
      }

      // 4. 取得類別選單 (用於後台下拉選單)
      const catSheet = ss.getSheetByName('類別選單');
      let categories = [];
      if (catSheet) {
        const catRows = catSheet.getDataRange().getValues();
        catRows.shift();
        for (let m = 0; m < catRows.length; m++) {
          categories.push({ code: catRows[m][0], name: catRows[m][1] });
        }
      }

      return { success: true, siteTitle: title, bulletins, stats, categories };

    case 'getBulletinsByFilter':
      // 依類別與日期範圍過濾公告
      const filterDataSheet = ss.getSheetByName('公佈欄資料');
      if (!filterDataSheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

      const filterRows = filterDataSheet.getDataRange().getValues();
      filterRows.shift(); // 移除標題列

      const category = params.category;
      const startDate = params.startDate; // 格式: YYYY-MM-DD
      const endDate = params.endDate;     // 格式: YYYY-MM-DD

      const filteredRows = [];
      // 依序執行過濾條件
      for (let n = 0; n < filterRows.length; n++) {
        const row = filterRows[n];
        
        // 條件 1: 檢查類別是否符合
        if (row[3] !== category) continue;
        
        // 條件 3: 檢查日期是否在範圍內
        const bDate = formatDate(row[4]); // "YYYY/MM/DD"
        if (!bDate) continue;
        
        const dateParts = bDate.split('/');
        const bulletinDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        
        if (bulletinDateObj >= filterStart && bulletinDateObj <= filterEnd) {
          filteredRows.push(row);
        }
      }

      // 轉換為物件列表
      const finalBulletins = [];
      for (let p = 0; p < filteredRows.length; p++) {
        const fr = filteredRows[p];
        finalBulletins.push({
          id: fr[0], title: fr[1], content: fr[2], category: fr[3],
          startDate: formatDate(fr[4]), startTime: formatTime(fr[5]),
          endDate: formatDate(fr[6]), endTime: formatTime(fr[7]),
          isUrgent: fr[8], fileUrl: fr[9], fileType: fr[10],
          status: fr[11] || '' // 新增狀態欄位
        });
      }

      return { success: true, bulletins: finalBulletins };

    default:
      return { success: false, message: 'Unknown action' };
  }
}

/**
 * handlePostAction: 根據 action 執行寫入或修改邏輯
 */
function handlePostAction(action, data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  switch(action) {
    case 'login':
      const userSheet = ss.getSheetByName('帳號管理');
      if (!userSheet) return { success: false, message: '找不到 [帳號管理] 工作表' };
      
      const users = userSheet.getDataRange().getValues();
      users.shift();
      
      let authenticatedUser = null;
      // 遍歷所有使用者紀錄進行比對
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        if (u[0] == data.username && u[1] == data.password && u[6] == 'Y') {
          authenticatedUser = { name: u[2], role: u[5] };
          break;
        }
      }
      
      if (authenticatedUser) {
        writeLog(ss, authenticatedUser.name, '登入系統');
        return { success: true, token: 'gas-token-' + new Date().getTime(), user: authenticatedUser };
      } else {
        return { success: false, message: '帳號密碼錯誤或帳號已停用' };
      }

    case 'addBulletin':
      const sheet = ss.getSheetByName('公佈欄資料');
      if (!sheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

      let fileUrl = '';
      if (data.fileData && data.fileName) {
        fileUrl = saveFileToDrive(data.fileData, data.fileName, data.fileType);
      }

      const newId = new Date().getTime().toString();
      const now = new Date();
      
      sheet.appendRow([
        newId, data.title, data.content, data.category,
        formatDate(now), formatTime(now),
        '', '', // 結束日期/時間
        data.isUrgent || '', fileUrl, data.fileType,
        '' // 狀態
      ]);

      writeLog(ss, data.operator || 'Admin', `新增公告: ${data.title}`);
      return { success: true, message: '發佈成功' };

    case 'editBulletin':
      return updateBulletin(ss, data, false);

    case 'deleteBulletin':
      return updateBulletin(ss, data, true);

    default:
      return { success: false, message: 'Unknown POST action' };
  }
}

/**
 * updateBulletin: 執行修改或刪除動作
 */
function updateBulletin(ss, data, isDelete) {
  const sheet = ss.getSheetByName('公佈欄資料');
  if (!sheet) return { success: false, message: '找不到 [公佈欄資料] 工作表' };

  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  // 傳統迴圈尋找指定 ID 的行
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0].toString() === data.id.toString()) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: '找不到該筆資料 ID: ' + data.id };
  }

  const actualRow = rowIndex + 1;

  if (isDelete) {
    // 軟刪除：將第 12 欄設為 'D'
    sheet.getRange(actualRow, 12).setValue('D');
    writeLog(ss, data.operator || 'Admin', `刪除公告 [ID: ${data.id}] 標題: ${rows[rowIndex][1]}`);
    return { success: true, message: '刪除成功' };
    
  } else {
    // 記錄修改前的數據以便對比
    const oldTitle = rows[rowIndex][1];
    const oldContent = rows[rowIndex][2];
    const oldCat = rows[rowIndex][3];
    const oldUrgent = rows[rowIndex][8];
    const oldFile = rows[rowIndex][9];
    
    // 如果有新圖片則上傳
    let newFileUrl = data.originalFileUrl;
    if (data.fileData && data.fileName) {
       newFileUrl = saveFileToDrive(data.fileData, data.fileName, data.fileType);
    }

    // 更新資料列
    sheet.getRange(actualRow, 2).setValue(data.title);
    sheet.getRange(actualRow, 3).setValue(data.content);
    sheet.getRange(actualRow, 4).setValue(data.category);
    sheet.getRange(actualRow, 9).setValue(data.isUrgent || '');
    sheet.getRange(actualRow, 10).setValue(newFileUrl);
    sheet.getRange(actualRow, 11).setValue(data.fileType);

    // 建立變更記錄字串
    const changes = [];
    if (oldTitle !== data.title) changes.push(`標題: "${oldTitle}" → "${data.title}"`);
    if (oldContent !== data.content) changes.push(`內容已修改`);
    if (oldCat !== data.category) changes.push(`類別: "${oldCat}" → "${data.category}"`);
    if (oldUrgent !== (data.isUrgent || '')) changes.push(`緊急標記: "${oldUrgent}" → "${data.isUrgent || ''}"`);
    if (oldFile !== newFileUrl) changes.push(`檔案已更新`);
    
    const changeLog = changes.length > 0 ? ` | 變更: ${changes.join('; ')}` : '';
    writeLog(ss, data.operator || 'Admin', `修改公告 [ID: ${data.id}] 標題: ${data.title}${changeLog}`);
    return { success: true, message: '修改成功' };
  }
}

/**
 * 寫入操作日誌 (Log)
 */
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

/**
 * 將檔案儲存至 Google Drive
 */
function saveFileToDrive(base64Data, fileName, contentType) {
  try {
    const data = base64Data.split(',')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(data), contentType, fileName);
    const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    const file = folder.createFile(blob);
    // 設定共用權限為「知道連結的人皆可觀看」
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 如果是圖片,傳回直接顯示的連結
    if (contentType.indexOf('image') !== -1) {
      return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
    } else {
      return file.getUrl();
    }
  } catch (e) {
    return 'Upload Failed: ' + e.toString();
  }
}

/**
 * 輔助：傳回 JSON 格式回應
 */
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 輔助：格式化日期為 yyyy/MM/dd
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

/**
 * 輔助：格式化時間為 HH:mm:ss
 */
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss");
}
