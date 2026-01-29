import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import Modal from '../components/ui/Modal';
import { mockSiteData, mockBulletins, mockStats } from '../utils/mockData';

const Home = () => {
    // Modal 狀態管理
    const [selectedBulletin, setSelectedBulletin] = useState(null);

    // 模擬從 API 設定瀏覽器標題
    useEffect(() => {
        document.title = mockSiteData.title;
    }, []);

    return (
        <div className="fade-in">
            <Header title={mockSiteData.title} />

            <main className="container">
                {/* 功能區塊 */}
                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>快速服務</h2>
                    <FeatureGrid stats={mockStats} />
                </section>

                {/* 公告區塊 - 傳入點擊處理函式 */}
                <section>
                    <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>最新公告</h2>
                    <BulletinSection
                        bulletins={mockBulletins}
                        onBulletinClick={(item) => setSelectedBulletin(item)}
                    />
                </section>
            </main>

            {/* 詳情彈窗 */}
            <Modal
                isOpen={!!selectedBulletin}
                onClose={() => setSelectedBulletin(null)}
                title={selectedBulletin?.category || '公告詳情'}
            >
                {selectedBulletin && (
                    <div>
                        <h2 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>
                            {selectedBulletin.title}
                        </h2>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                            發佈日期：{selectedBulletin.date}
                        </div>
                        <div style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                            {selectedBulletin.content}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Home;
