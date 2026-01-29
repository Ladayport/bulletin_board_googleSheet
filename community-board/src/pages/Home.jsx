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
        setBulletins(data.bulletins || []);
        // 將 handleCategoryClick 傳遞給 FeatureGrid (透過 stats 物件或獨立 props)
        // 為了不破壞現有結構，我們將 handleCategoryClick 包在 stats 裡傳遞，或在 FeatureGrid 接收獨立 prop
        // 但上一步我改的是 props.stats.onCategoryClick... 用獨立 prop 比較乾淨，但 CodeGen 上一步寫在 stats 判斷。
        // Let's pass it as a separate prop in JSX, but modify FeatureGrid to accept it properly first? 
        // No, I modified FeatureGrid to check `stats.onCategoryClick`. Let's stick to that or better fixes.
        // Actually, previous step: `if (stats.onCategoryClick)`. So I must inject it into stats object here.
        setStats({
          ...data.stats,
          onCategoryClick: (category) => {
            setFilterCategory(category);
            // Scroll to list
            const element = document.getElementById('bulletin-section');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }
        });

        // 篩選緊急公告
        const emergencies = (data.bulletins || [])
          .filter(b => b.category === '緊急' || b.title.includes('【緊急】')) // 簡單判斷
          .map(b => b.title);
        setEmergencyMessages(emergencies);

        // 標記緊急屬性
        const processedBulletins = (data.bulletins || []).map(b => ({
          ...b,
          // 支援 GAS 回傳的 isUrgent (Y/N) 或其他判斷方式
          isEmergency: b.isUrgent === 'Y' || b.category === '緊急' || b.title.includes('【緊急】')
        }));
        setBulletins(processedBulletins);

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

  // 排序與篩選邏輯
  const filteredBulletins = bulletins.filter(b => {
    if (filterCategory === 'all') return true;
    return b.category === filterCategory;
  });

  const sortedBulletins = [...filteredBulletins].sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    return (b.date || '').localeCompare(a.date || '');
  });

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ color: 'var(--text-muted)', margin: 0 }}>
                {filterCategory === 'all' ? '最新公告' : `${filterCategory} (${sortedBulletins.length})`}
              </h2>
              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                >
                  顯示全部
                </button>
              )}
            </div>
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

            {selectedBulletin.fileUrl && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>附件</h4>
                {selectedBulletin.fileType && selectedBulletin.fileType.startsWith('image/') ? (
                  <img src={selectedBulletin.fileUrl} alt="附件" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                ) : (
                  <a
                    href={selectedBulletin.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', textDecoration: 'none' }}
                  >
                    開啟附件
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
