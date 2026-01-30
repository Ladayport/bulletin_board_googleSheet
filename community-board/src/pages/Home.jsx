import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import EmergencyTicker from '../components/home/EmergencyTicker';
import Modal from '../components/ui/Modal';
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

        // 2. 準備分類對照表
        const categoryMap = {
          '公告': '公告通知', '活動': '活動通知', '會議': '會議通知',
          '失物': '失物招領', '其他': '其他通知', 'QA': 'Q&A'
        };

        const now = new Date();
        const validList = [];

        // 3. 處理公告清單：類別正規化與有效日期檢查
        for (let j = 0; j < rawBulletins.length; j++) {
          const b = rawBulletins[j];
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

        // --- 效能優化：資料預載 (Pre-loading) ---
        // 雖然首頁強制抓取最新資料，但我們可以將結果存入快取
        // 讓使用者切換到「分類頁」時能享有「秒開」的體驗
        const cacheData = {
          updateTime: new Date().getTime(),
          data: validList
        };
        localStorage.setItem('bulletin_cache_all', JSON.stringify(cacheData));

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
      <Header title={siteTitle} />

      <main className="container">
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
            {loading && <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>更新中...</span>}
          </div>

          {loading && bulletins.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>載入資料中...</div>
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
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>附件</h4>
                <div className="mb-4">
                  <a
                    href={selectedBulletin.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                  >
                    開啟附件
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
