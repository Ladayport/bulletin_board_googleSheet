import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import { mockSiteData, mockBulletins } from '../utils/mockData';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Modal from '../components/ui/Modal';

const CategoryPage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [selectedBulletin, setSelectedBulletin] = useState(null);

    // 簡單的類別名稱對照
    const categoryNames = {
        'notice': '公告通知',
        'activities': '活動通知',
        'meeting': '會議紀錄',
        'lost-found': '失物招領',
        'others': '其他項目',
        'qa': 'Q&A'
    };

    const pageTitle = categoryNames[type] || '公告列表';

    // 根據類別篩選資料 (這裡只是模擬，實際應根據 type 篩選)
    // 注意：因為 mockBulletins 的 category 是中文，這裡做一個簡單的 mapping 或是篩選全部以供演示
    // 為了演示效果，我們暫時顯示所有資料，但標題改變
    // 實際專案應實作: mockBulletins.filter(b => mapTypeToCategory(type) === b.category)
    const filteredBulletins = mockBulletins;

    return (
        <div className="fade-in">
            <Header title={mockSiteData.title} />

            <main className="container">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                    style={{ marginBottom: '24px' }}
                >
                    <ArrowLeft size={20} />
                    返回首頁
                </button>

                <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{pageTitle}</h2>

                <BulletinSection
                    bulletins={filteredBulletins}
                    onBulletinClick={(item) => setSelectedBulletin(item)}
                />
            </main>

            <Modal
                isOpen={!!selectedBulletin}
                onClose={() => setSelectedBulletin(null)}
                title={selectedBulletin?.isEmergency ? '緊急' : selectedBulletin?.category}
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

export default CategoryPage;
