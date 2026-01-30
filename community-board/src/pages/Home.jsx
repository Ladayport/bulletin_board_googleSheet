import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import EmergencyTicker from '../components/home/EmergencyTicker';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';

// 保留 mockData 作為 fallback 
import { mockSiteData, mockStats } from '../utils/mockData';

const Home = () => {
  const [siteTitle, setSiteTitle] = useState(mockSiteData.title);
  const [bulletins, setBulletins] = useState([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [emergencyMessages, setEmergencyMessages] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all'); // 新增篩選狀態

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const data = await api.get('getHomeData');

      if (data.success) {
        setSiteTitle(data.siteTitle);
        setStats(data.stats);

        // 篩選緊急公告 ticker
        const emergencies = (data.bulletins || [])
          .filter(b => b.isUrgent === 'Y')
          .map(b => b.title);
        setEmergencyMessages(emergencies);

        // 資料正規化 (Category Normalization)
        const categoryMap = {
          '公告': '公告通知',
          '活動': '活動通知',
          '會議': '會議通知',
          '失物': '失物招領',
          '其他': '其他通知',
          'QA': 'Q&A'
        };

        const now = new Date(); // client system time

        const validBulletins = (data.bulletins || []).map(b => {
          // Mapping Category
          const normalizedCategory = categoryMap[b.category] || b.category;

          // Parse Date/Time for validity check
          // Format: YYYY/MM/DD and HH:mm:ss
          const startStr = `${b.startDate} ${b.startTime || '00:00:00'}`;
          const endStr = `${b.endDate} ${b.endTime || '23:59:59'}`;
          const start = new Date(startStr);
          const end = new Date(endStr);

          // If date is invalid, assume valid? Or skip? Let's check validity if date string exists.
          // GAS formatDate returns specific format.

          return {
            ...b,
            category: normalizedCategory,
            isEmergency: b.isUrgent === 'Y',
            validStart: !isNaN(start) ? start : null,
            validEnd: !isNaN(end) ? end : null
          };
        }).filter(b => {
          // Filter Logic:
          // Start Date/Time <= Now
          // End Date/Time >= Now (if endDate exists)
          if (!b.validStart) return true; // checking... assume valid if no date set? usually bulletins have date.
          if (b.validStart > now) return false; // Future
          if (b.validEnd && b.validEnd < now) return false; // Expired
          return true;
        });

        setBulletins(validBulletins);

      } else {
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = siteTitle;
  }, [siteTitle]);

  // 排序與顯示邏輯 (Max 15)
  // 1. Emergency (Y) Top
  // 2. Start Date + Time (Newest First)
  const sortedBulletins = [...bulletins].sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    // Both same emergency status, sort by date desc
    const dateA = a.validStart || new Date(0);
    const dateB = b.validStart || new Date(0);
    return dateB - dateA;
  }).slice(0, 15); // Max 15 items in Home


  return (
    <div className="fade-in">
      <Header title={siteTitle} />

      <main className="container">
        {emergencyMessages.length > 0 && <EmergencyTicker messages={emergencyMessages} />}

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>快速服務</h2>
          <FeatureGrid stats={stats} />
        </section>

        <section id="bulletin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: 'var(--text-muted)', margin: 0 }}>最新公告</h2>
            {loading && <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>更新中...</span>}
          </div>

          {loading && bulletins.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>載入資料中...</div>
          ) : (
            <BulletinSection
              bulletins={sortedBulletins}
              onBulletinClick={(item) => setSelectedBulletin(item)}
            />
          )}
        </section>
      </main>

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
              <span>發佈日期：{selectedBulletin.date}</span>
            </div>
            <div style={{ lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: '24px' }}>
              {selectedBulletin.content}
            </div>

            {/* Improved Image Handling */}
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
      </Modal >
    </div >
  );
};

export default Home;
