import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';

/**
 * 分類頁面組件 (CategoryPage)
 * 展示特定類別的公告清單，支援分頁標籤與日期範圍篩選
 */
const CategoryPage = () => {
    // --- 路由與狀態定義 ---
    const { type } = useParams(); // URL 參數中的分類代碼
    const navigate = useNavigate();
    const [selectedBulletin, setSelectedBulletin] = useState(null); // 當前選中的公告(彈窗使用)
    const [activeTab, setActiveTab] = useState(''); // 當前選中的分類標籤名稱
    const [bulletins, setBulletins] = useState([]); // 經日期過濾後的公告清單
    const [loading, setLoading] = useState(true);

    /**
     * 輔助功能：計算預設日期範圍 (20天前 ~ 60天後)
     */
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

    // 定義所有可選的分類標籤
    const tabs = [
        { id: 'notice', label: '公告通知' },
        { id: 'activities', label: '活動通知' },
        { id: 'meeting', label: '會議通知' },
        { id: 'lost-found', label: '失物招領' },
        { id: 'others', label: '其他通知' },
        { id: 'qa', label: 'Q&A' }
    ];

    /**
     * 當進入頁面或 URL 分類代碼改變時，同步更新標籤狀態
     */
    useEffect(() => {
        let matchedLabel = '公告通知'; // 預設值
        // 使用傳統迴圈尋找對應的標籤名稱
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].id === type) {
                matchedLabel = tabs[i].label;
                break;
            }
        }
        setActiveTab(matchedLabel);
    }, [type]);

    // 初始載入資料
    useEffect(() => {
        fetchData();
    }, []);

    /**
     * 向後端取得資料並執行過濾與正規化
     */
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get('getHomeData');

            if (data.success && data.bulletins) {
                // 類別對照映射表
                const categoryMap = {
                    '公告': '公告通知', '活動': '活動通知', '會議': '會議通知',
                    '失物': '失物招領', '其他': '其他通知', 'QA': 'Q&A',
                    '會議紀錄': '會議通知', '招領': '失物招領'
                };

                const rawList = data.bulletins;
                const processedList = [];

                // 第一階段：資料正規化與時間解析
                for (let i = 0; i < rawList.length; i++) {
                    const b = rawList[i];
                    const normalized = categoryMap[b.category] || b.category;
                    const startStr = `${b.startDate} ${b.startTime || '00:00:00'}`;
                    const start = new Date(startStr);

                    processedList.push({
                        ...b,
                        category: normalized,
                        isEmergency: b.isUrgent === 'Y',
                        validStart: !isNaN(start.getTime()) ? start : new Date(0)
                    });
                }

                // 第二階段：執行日期範圍篩選與公告有效性檢查
                const filteredList = [];
                const now = new Date();
                const filterStart = new Date(dateFilter.startDate);
                const filterEnd = new Date(dateFilter.endDate);
                filterEnd.setHours(23, 59, 59, 999); // 結束日期設為當天最後一秒

                for (let j = 0; j < processedList.length; j++) {
                    const b = processedList[j];
                    let isVisible = true;

                    // A. 檢查是否在使用者選取的日期範圍內
                    const bDateStr = b.startDate; // YYYY/MM/DD
                    if (bDateStr) {
                        const bDate = new Date(bDateStr.replace(/\//g, '-'));
                        if (bDate < filterStart || bDate > filterEnd) {
                            isVisible = false;
                        }
                    }

                    // B. 檢查公告是否已發布 (開始時間是否小於現在)
                    if (isVisible && b.validStart > now) {
                        isVisible = false;
                    }

                    if (isVisible) {
                        filteredList.push(b);
                    }
                }

                setBulletins(filteredList);
            }
        } catch (e) {
            console.error('[CategoryPage] Fetch Error:', e);
        } finally {
            setLoading(false);
        }
    };

    // --- 顯示過濾與排序 ---
    // 依據目前選中的 Tab 篩選出要顯示的內容,並按日期降序排列
    const displayBulletins = [];
    for (let k = 0; k < bulletins.length; k++) {
        if (bulletins[k].category === activeTab) {
            displayBulletins.push(bulletins[k]);
        }
    }

    // 排序：由新到舊
    displayBulletins.sort((a, b) => b.validStart - a.validStart);

    return (
        <div className="fade-in">
            <Header title="幸福社區雲端公佈欄" />

            <main className="container">
                {/* 頂部導覽列 (包含返回按鈕與分類標籤) */}
                <div style={{
                    position: 'sticky', top: '20px', zIndex: 50,
                    backgroundColor: 'var(--bg-body)', paddingBottom: '16px', paddingTop: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <ArrowLeft size={20} /> 返回首頁
                    </button>

                    {/* 分類切換標籤 */}
                    <div className="tab-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.label);
                                    navigate(`/category/${tab.id}`, { replace: true });
                                }}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', border: 'none',
                                    backgroundColor: activeTab === tab.label ? 'var(--primary-color)' : '#e5e7eb',
                                    color: activeTab === tab.label ? 'white' : '#4b5563',
                                    cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 日期過濾工具列 */}
                <section style={{
                    marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-card)',
                    borderRadius: '8px', border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>日期範圍：</label>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>~</span>
                        <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                        />
                        <button
                            onClick={() => fetchData()}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            查詢
                        </button>
                        {/* 筆數統計：只在載入完成後顯示 */}
                        <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {!loading && `${activeTab} 共 ${displayBulletins.length} 筆`}
                        </span>
                    </div>
                </section>

                <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{activeTab}</h2>

                {/* 公告內容區 */}
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

            {/* 公告詳情彈窗 */}
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
                                    target="_blank" rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                                >
                                    開啟附件
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Modal >
        </div >
    );
};

export default CategoryPage;
