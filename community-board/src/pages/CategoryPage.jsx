import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';


const CategoryPage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [selectedBulletin, setSelectedBulletin] = useState(null);
    const [activeTab, setActiveTab] = useState('');
    const [bulletins, setBulletins] = useState([]);
    const [loading, setLoading] = useState(true);

    // 日期篩選狀態
    const getDefaultDates = () => {
        const today = new Date();
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(today.getDate() - 20);
        const sixtyDaysLater = new Date();
        sixtyDaysLater.setDate(today.getDate() + 60);

        return {
            startDate: twentyDaysAgo.toISOString().split('T')[0],
            endDate: sixtyDaysLater.toISOString().split('T')[0]
        };
    };

    const [dateFilter, setDateFilter] = useState(getDefaultDates());
    const [displayedCount, setDisplayedCount] = useState(0);

    const tabs = [
        { id: 'notice', label: '公告通知' },
        { id: 'activities', label: '活動通知' },
        { id: 'meeting', label: '會議通知' }, // Unified name
        { id: 'lost-found', label: '失物招領' },
        { id: 'others', label: '其他通知' },
        { id: 'qa', label: 'Q&A' }
    ];

    useEffect(() => {
        // Initialize active tab from URL param or default to first
        const foundTab = tabs.find(t => t.id === type);
        if (foundTab) {
            setActiveTab(foundTab.label);
        } else {
            setActiveTab('公告通知');
        }
    }, [type]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get('getHomeData'); // Reuse getHomeData to get all bulletins
            if (data.success && data.bulletins) {
                const categoryMap = {
                    '公告': '公告通知',
                    '活動': '活動通知',
                    '會議': '會議通知',
                    '失物': '失物招領',
                    '其他': '其他通知',
                    'QA': 'Q&A',
                    '會議紀錄': '會議通知',
                    '招領': '失物招領'
                };

                const processed = data.bulletins.map(b => {
                    const normalized = categoryMap[b.category] || b.category;
                    const startStr = `${b.startDate} ${b.startTime || '00:00:00'}`;
                    const start = new Date(startStr);

                    return {
                        ...b,
                        category: normalized,
                        isEmergency: b.isUrgent === 'Y',
                        validStart: !isNaN(start) ? start : new Date(0)
                    };
                });
                const filtered = processed.filter(b => {
                    // 1. 日期範圍篩選
                    const bulletinDateStr = b.startDate; // YYYY/MM/DD
                    if (bulletinDateStr) {
                        const bulletinDate = new Date(bulletinDateStr.replace(/\//g, '-'));
                        const filterStart = new Date(dateFilter.startDate);
                        const filterEnd = new Date(dateFilter.endDate);
                        filterEnd.setHours(23, 59, 59, 999);

                        if (bulletinDate < filterStart || bulletinDate > filterEnd) {
                            return false;
                        }
                    }

                    // 2. 有效性檢查
                    if (!b.validStart) return true;
                    const now = new Date();
                    if (b.validStart > now) return false;
                    return true;
                });

                setBulletins(filtered);
                setDisplayedCount(filtered.length);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Filter by Active Tab & Sort by Date Desc
    const displayBulletins = bulletins
        .filter(b => b.category === activeTab)
        .sort((a, b) => b.validStart - a.validStart);

    return (
        <div className="fade-in">
            <Header title="幸福社區雲端公佈欄" />

            <main className="container">
                {/* Sticky Back Button */}
                <div style={{
                    position: 'sticky', top: '20px', zIndex: 50,
                    backgroundColor: 'var(--bg-body)', paddingBottom: '16px', paddingTop: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <ArrowLeft size={20} /> 返回首頁
                    </button>

                    {/* PC View Tabs (Simple) */}
                    <div className="tab-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.label);
                                    navigate(`/category/${tab.id}`, { replace: true });
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.label ? 'var(--primary-color)' : '#e5e7eb',
                                    color: activeTab === tab.label ? 'white' : '#4b5563',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: '500'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 日期篩選區塊 */}
                <section style={{
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>日期範圍：</label>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '0.9rem'
                            }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>~</span>
                        <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            onClick={() => fetchData()}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            查詢
                        </button>
                        <span style={{
                            marginLeft: 'auto',
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)'
                        }}>
                            {activeTab} 共 {displayBulletins.length} 筆
                        </span>
                    </div>
                </section>

                <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{activeTab}</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>載入中...</div>
                ) : displayBulletins.length > 0 ? (
                    <BulletinSection
                        bulletins={displayBulletins}
                        onBulletinClick={(item) => setSelectedBulletin(item)}
                    />
                ) : (
                    <div style={{
                        padding: '40px', textAlign: 'center', color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)'
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
                            發佈日期：{selectedBulletin.startDate} {selectedBulletin.startTime}
                        </div>
                        <div style={{ lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: '24px' }}>
                            {selectedBulletin.content}
                        </div>
                        {selectedBulletin.fileUrl && (
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
                        )}
                    </div>
                )
                }
            </Modal >
        </div >
    );
};

export default CategoryPage;
