import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import EmergencyTicker from '../components/home/EmergencyTicker'; // 新增
import Modal from '../components/ui/Modal';
import { mockSiteData, mockBulletins, mockStats, mockEmergency } from '../utils/mockData';

const Home = () => {
    const [selectedBulletin, setSelectedBulletin] = useState(null);

    useEffect(() => {
        document.title = mockSiteData.title;
    }, []);

    // 排序邏輯：緊急置頂 -> 日期排序
    const sortedBulletins = [...mockBulletins].sort((a, b) => {
        // 1. 如果 a 是緊急且 b 不是，a 排前面 (-1)
        if (a.isEmergency && !b.isEmergency) return -1;
        // 2. 如果 b 是緊急且 a 不是，b 排前面 (1)
        if (!a.isEmergency && b.isEmergency) return 1;
        // 3. 兩者相同，則依日期排序 (新 -> 舊) (假設 date 格式為 YYYY-MM-DD 可直接比字串)
        return b.date.localeCompare(a.date);
    });

    return (
        <div className="fade-in">
            <Header title={mockSiteData.title} />

            <main className="container">
                {/* 快速服務區塊 */}
                <section style={{ marginBottom: '24px' }}>
                    <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>快速服務</h2>
                    <FeatureGrid stats={mockStats} />
                </section>

                {/* 緊急通告跑馬燈 (放在快速服務下方) */}
                <EmergencyTicker messages={mockEmergency} />

                {/* 公告區塊 */}
                <section>
                    <h2 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>最新公告</h2>
                    <BulletinSection
                        bulletins={sortedBulletins}
                        onBulletinClick={(item) => setSelectedBulletin(item)}
                    />
                </section>
            </main>

            {/* 詳情彈窗 */}
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
