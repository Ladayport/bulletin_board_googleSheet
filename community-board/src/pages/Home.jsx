import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import EmergencyTicker from '../components/home/EmergencyTicker';
import Modal from '../components/ui/Modal';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { api } from '../services/api';

// 保留 mockData 作為初始或失敗時的備案
import { mockSiteData } from '../utils/mockData';

/**
 * 首頁組件 (Home)
 * 負責展示最新公告、緊急跑馬燈與分類捷徑
 */
const Home = () => {
  // --- 狀態定義 ---
  const [siteTitle, setSiteTitle] = useState(mockSiteData.title);
  const [bulletins, setBulletins] = useState([]);
  const [stats, setStats] = useState({
    notice: 0, activities: 0, meeting: 0, lostAndFound: 0, others: 0, qa: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [emergencyMessages, setEmergencyMessages] = useState([]);

  // --- 頁面初始載入 ---
  useEffect(() => {
    fetchHomeData();
  }, []);

  /**
   * 取得並處理首頁所需的全部資料
   */
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // 呼叫 GAS 後端 API
      const data = await api.get('getHomeData');

      if (data.success) {
        setSiteTitle(data.siteTitle);
        setStats(data.stats);

        // 1. 處理緊急跑馬燈訊息
        const activeMessages = [];
        const rawBulletins = data.bulletins || [];
        for (let i = 0; i < rawBulletins.length; i++) {
          if (rawBulletins[i].isUrgent === 'Y') {
            activeMessages.push(rawBulletins[i].title);
          }
        }
        setEmergencyMessages(activeMessages);

        // 2. 準備分類對照表 (確保與 FeatureGrid 的選單對應)
        const categoryMap = {
          '公告': '公告',
          '活動': '活動',
          '會議': '會議',
          '失物': '失物',
          '其他': '其他',
          'QA': 'Q&A', 'Q&A': 'Q&A', '問答': 'Q&A'
        };

        const now = new Date();
        const validList = [];

        // 3. 處理公告清單：類別正規化與有效日期檢查
        for (let j = 0; j < rawBulletins.length; j++) {
          const b = rawBulletins[j];

          // 0. 排除狀態為 'D' 的已刪除資料
          if (b.status === 'D') continue;

          const normalizedCategory = categoryMap[b.category] || b.category;

          // 解析開始與結束時間
          const startStr = `${b.startDate} ${b.startTime || '00:00:00'}`;
          const endStr = `${b.endDate} ${b.endTime || '23:59:59'}`;
          const start = new Date(startStr);
          const end = new Date(endStr);

          // 封裝處理後的資料
          const processedItem = {
            ...b,
            category: normalizedCategory,
            isEmergency: b.isUrgent === 'Y',
            validStart: !isNaN(start.getTime()) ? start : null,
            validEnd: !isNaN(end.getTime()) ? end : null
          };

          // 過濾條件：公告必須在有效期間內 (開始時間 <= 現在, 且未結束)
          let isValid = true;
          if (processedItem.validStart && processedItem.validStart > now) {
            isValid = false; // 尚未開始
          }
          if (processedItem.validEnd && processedItem.validEnd < now) {
            isValid = false; // 已經過期
          }

          if (isValid) {
            validList.push(processedItem);
          }
        }

        // 第三階段：對資料進行排序 (緊急置頂 -> 依據完整日期與時間降序)
        // 首頁維持原邏輯：緊急公告優先顯示，其餘按時序排列
        validList.sort((a, b) => {
          // 1. 緊急公告優先權最高
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;

          // 2. 依據完整日期與時間由新到舊排序
          const timeA = a.validStart ? a.validStart.getTime() : 0;
          const timeB = b.validStart ? b.validStart.getTime() : 0;
          return timeB - timeA;
        });



        setBulletins(validList);

        // --- 修正：依據「目前顯示清單 (validList)」重新計算統計筆數 (Stats) ---
        // 確保數字與下方列表完全同步，且符合「今日有效」的過濾規則
        const newStats = { notice: 0, activities: 0, meeting: 0, lostAndFound: 0, others: 0, qa: 0 };
        for (let m = 0; m < validList.length; m++) {
          const item = validList[m];
          // 依據正規化後的類別進行統計 (必須與 FeatureGrid 的鍵值名稱一致)
          if (item.category === '公告') newStats.notice++;
          else if (item.category === '活動') newStats.activities++;
          else if (item.category === '會議') newStats.meeting++;
          else if (item.category === '失物') newStats.lostAndFound++;
          else if (item.category === '其他') newStats.others++;
          else if (item.category === 'Q&A') newStats.qa++;
        }
        setStats(newStats);

        // 已移除資料預載 (Pre-loading) 快取機制
        // 使用者要求每一次切換頁面皆重新向後端抓取最新資料，以確保資料即時性

      } else {
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 修改網頁分頁標題
  useEffect(() => {
    document.title = siteTitle;
  }, [siteTitle]);

  // 首頁僅展示前 15 筆 (清單已在 fetchHomeData 中排好序)
  const displayList = [];
  for (let k = 0; k < bulletins.length && k < 15; k++) {
    displayList.push(bulletins[k]);
  }

  return (
    <div className="fade-in">
      <LoadingOverlay show={loading} />
      <Header title={siteTitle} />

      <main className="container">

        {/* --- [新增] 資安與法遵聲明區塊 (方案一) --- */}
        <div style={{
          backgroundColor: '#eff6ff', // 淺藍色背景
          border: '1px solid #bfdbfe',
          color: '#1e40af',           // 深藍色文字
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'start',
          gap: '12px',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>資安提醒：</strong> 本平台為公開資訊看板。
            <span style={{ display: 'block', marginTop: '4px', color: '#2563eb' }}>
              請勿張貼任何機密文件、個人隱私資料 (PII) 或未經授權之版權內容。違者將自行承擔法律責任。
            </span>
          </div>
        </div>
        {/* ------------------------------------------- */}
        {/* 緊急公告跑馬燈 */}
        {emergencyMessages.length > 0 && <EmergencyTicker messages={emergencyMessages} />}

        {/* 快速服務分類區 */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>快速服務</h2>
          <FeatureGrid stats={stats} />
        </section>

        {/* 最新公告列表區 */}
        <section id="bulletin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: 'var(--text-muted)', margin: 0 }}>最新公告</h2>
          </div>

          {bulletins.length === 0 && !loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>目前暫無公告</div>
          ) : (
            <BulletinSection
              bulletins={displayList}
              onBulletinClick={(item) => setSelectedBulletin(item)}
            />
          )}
        </section>
      </main>

      {/* 公告詳細資訊彈窗 */}
      <Modal
        isOpen={!!selectedBulletin}
        onClose={() => setSelectedBulletin(null)}
        title={selectedBulletin?.isEmergency ? '緊急' : (selectedBulletin?.category || '公告詳情')}
      >
        {selectedBulletin && (
          <div>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>
              {selectedBulletin.title}
            </h2>
            <div style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>分類：{selectedBulletin.category}</span>
              <span>發佈日期：{selectedBulletin.startDate}</span>
            </div>
            <div style={{ lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: '24px' }}>
              {selectedBulletin.content}
            </div>

            {/* 附件處理 */}
            {selectedBulletin.fileUrl && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>附件內容</h4>

                {(() => {
                  // 判斷是否為圖片
                  const isImage = selectedBulletin.fileType?.includes('image/');
                  const isPDF = selectedBulletin.fileType === 'application/pdf';

                  // 針對 Google Drive 連結進行轉換 (確保能直接顯示)
                  let displayUrl = selectedBulletin.fileUrl;
                  if (displayUrl.includes('drive.google.com')) {
                    // 將 export=view 轉換為更強制的 export=download 格式或直接取 ID
                    const fileId = displayUrl.match(/id=([^&]+)/)?.[1];
                    if (fileId) {
                      displayUrl = `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
                    }
                  }

                  if (isImage) {
                    return (
                      <div style={{ textAlign: 'center' }}>
                        <img
                          src={displayUrl}
                          alt="公告附件"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            // 如果高階連結失效，嘗試換回原連結
                            if (e.target.src !== selectedBulletin.fileUrl) {
                              e.target.src = selectedBulletin.fileUrl;
                            } else {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }
                          }}
                        />
                        <div style={{ display: 'none', marginTop: '10px' }}>
                          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>圖片預覽載入中或無法顯示</p>
                          <a href={selectedBulletin.fileUrl} target="_blank" rel="noopener noreferrer">點此直接開啟</a>
                        </div>
                      </div>
                    );
                  }

                  // PDF 或其他格式保持按鈕邏輯
                  return (
                    <div className="mb-4">
                      <a
                        href={selectedBulletin.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        開啟{isPDF ? ' PDF ' : '檔案'}附件
                      </a>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
