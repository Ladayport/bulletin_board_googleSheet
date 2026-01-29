export const mockSiteData = {
    title: "幸福社區雲端公佈欄",
};

// 緊急跑馬燈資料
export const mockEmergency = [
    "【緊急】本社區將於 10/28 上午 9:00 - 12:00 進行水塔清洗，屆時將暫停供水，請住戶提早儲水備用。",
    "【防災】颱風警報發布，請做好防颱準備，並檢查門窗是否緊閉。"
];

export const mockBulletins = [
    // isEmergency: true 會強制置頂並顯示為「緊急」
    { id: 10, date: "2023-11-01", category: "活動", title: "社區中庭花園維護通知 (置頂測試)", content: "...", isEmergency: true },
    { id: 1, date: "2023-10-25", category: "緊急", title: "社區停水通知", content: "...", isEmergency: true },
    { id: 2, date: "2023-10-24", category: "活動", title: "中秋晚會舉辦流程", content: "..." },
    { id: 3, date: "2023-10-22", category: "公告", title: "梯廳維修進度報告", content: "..." },
    { id: 4, date: "2023-10-20", category: "會議", title: "10月份管委會會議記錄", content: "..." },
    { id: 5, date: "2023-10-18", category: "招領", title: "B1停車場拾獲藍色水壺", content: "..." },
    { id: 6, date: "2023-10-15", category: "其他", title: "社區包裹代收規範更新", content: "..." },
    { id: 7, date: "2023-10-12", category: "QA", title: "如何申請門禁卡設定？", content: "..." },
];

export const mockStats = {
    notice: 28,     // 公告通知
    activities: 8,  // 活動通知
    meeting: 45,    // 會議記錄
    lostAndFound: 12, // 失物招領
    others: 5,      // 其他項目
    qa: 10          // Q&A
};
