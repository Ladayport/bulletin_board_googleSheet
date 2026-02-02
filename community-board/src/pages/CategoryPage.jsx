import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import LoadingOverlay from '../components/ui/LoadingOverlay';
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
        { id: 'notice', label: '公告' },
        { id: 'activities', label: '活動' },
        { id: 'meeting', label: '會議' },
        { id: 'lost-found', label: '失物' },
        { id: 'others', label: '其他' },
        { id: 'qa', label: 'QA' }
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
            // 進入頁面時一律顯示讀取中動畫，並向後端抓取最新資料 (取消快取機制)
            setLoading(true);

            // 向後端取得最新資料 (背景同步)
            const data = await api.get('getHomeData');

            if (data.success && data.bulletins) {
                // 類別對照映射表
                const categoryMap = {
                    '公告': '公告', '活動': '活動',
                    '失物': '失物', '其他': '其他', 'Q&A': 'Q&A',
                    '會議': '會議'
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
                        validStart: !isNaN(start.getTime()) ? start : new Date(0),
                        status: b.status || '' // 取得狀態
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

                    // 【重要】排除狀態為 'D' 的已刪除資料 (前台不顯示)
                    if (b.status === 'D') {
                        continue;
                    }

                    let isVisible = true;

                    // A. 檢查是否在使用者選取的日期範圍內 (預設為 20天前 ~ 60天後)
                    const bDateStr = b.startDate; // YYYY/MM/DD
                    if (bDateStr) {
                        const bDate = new Date(bDateStr.replace(/\//g, '-'));
                        // 僅顯示開始日期在篩選區間內的公告
                        if (bDate < filterStart || bDate > filterEnd) {
                            isVisible = false;
                        }
                    }

                    // 【特別說明】分類頁不限制「今日是否發布」，
                    // 直接依據使用者選取的日期範圍顯示公告 (例如預設包含未來 60 天的資料)
                    if (isVisible) {
                        filteredList.push(b);
                    }
                }

                // 第三階段：對篩選後的資料進行排序 (依據日期與時間由新到舊)
                // 在存入狀態前先排好序，避免在渲染期間排序造成畫面閃爍
                filteredList.sort((a, b) => {
                    const timeA = a.validStart.getTime();
                    const timeB = b.validStart.getTime();
                    // 直接比對完整的日期與時間 (由新到舊)
                    return timeB - timeA;
                });

                setBulletins(filteredList);
            }
        } catch (e) {
            console.error('[CategoryPage] Fetch Error:', e);
        } finally {
            setLoading(false);
        }
    };

    // --- 顯示過濾 ---
    // 依據目前選中的 Tab 篩選出要顯示的內容 (陣列已在 fetchData 中排好序)
    const displayBulletins = [];
    for (let k = 0; k < bulletins.length; k++) {
        const item = bulletins[k];
        if (item.category === activeTab) {
            displayBulletins.push(item);
        }
    }

    return (
        <div className="fade-in">
            <LoadingOverlay show={loading} />
            <Header title={siteTitle} />

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
                {displayBulletins.length > 0 ? (
                    <BulletinSection
                        bulletins={displayBulletins}
                        onBulletinClick={(item) => setSelectedBulletin(item)}
                    />
                ) : !loading && (
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
        </div >
    );
};

export default CategoryPage;
