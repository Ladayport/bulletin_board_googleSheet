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

    // 1. 類別名稱對照 (Router Param -> Display Name)
    const categoryNames = {
        'notice': '公告通知',
        'activities': '活動通知',
        'meeting': '會議紀錄',
        'lost-found': '失物招領',
        'others': '其他項目',
        'qa': 'Q&A'
    };

    // 2. 資料庫分類對照 (Router Param -> MockData Category)
    // mockBulletins 的 category 為中文: "公告", "活動", "會議", "招領", "其他", "QA", "緊急"
    const categoryMapping = {
        'notice': '公告',
        'activities': '活動',
        'meeting': '會議',
        'lost-found': '招領',
        'others': '其他',
        'qa': ['QA', 'Q&A'] // 容錯處理
    };

    const pageTitle = categoryNames[type] || '公告列表';

    // 3. 篩選邏輯
    const filteredBulletins = mockBulletins.filter(item => {
        const targetCategory = categoryMapping[type];
        if (Array.isArray(targetCategory)) {
            return targetCategory.includes(item.category);
        }
        return item.category === targetCategory;
    });

    return (
        <div className="fade-in">
            <Header title={mockSiteData.title} />

            <main className="container">
                {/* Sticky Back Button Container */}
                <div style={{
                    position: 'sticky',
                    top: '20px', // 離頂部一點距離
                    zIndex: 50,
                    backgroundColor: 'var(--bg-body)', // 避免背景透出文字
                    paddingBottom: '16px',
                    paddingTop: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                        <ArrowLeft size={20} />
                        返回首頁
                    </button>
                </div>

                <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{pageTitle}</h2>

                {filteredBulletins.length > 0 ? (
                    <BulletinSection
                        bulletins={filteredBulletins}
                        onBulletinClick={(item) => setSelectedBulletin(item)}
                    />
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        目前沒有此類別的資料
                    </div>
                )}
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
