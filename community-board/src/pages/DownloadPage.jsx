import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    Download, 
    FileText, 
    Search, 
    Calendar, 
    HardDrive, 
    Info, 
    CheckCircle,
    Loader2
} from 'lucide-react';

const DownloadPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('全部');
    const [downloadingId, setDownloadingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Mock 文件資料
    const documents = [
        {
            id: 'DOC-001',
            title: '115年度社區住戶大會會議記錄',
            category: '會議記錄',
            fileType: 'pdf',
            size: '2.4 MB',
            date: '2026-05-15',
            downloads: 142,
            description: '包含管委會改選結果、社區修繕預算通過案與住戶提議之決議事項。'
        },
        {
            id: 'DOC-002',
            title: '社區住戶管理規約 (114年修訂版)',
            category: '社區規約',
            fileType: 'pdf',
            size: '1.8 MB',
            date: '2025-10-20',
            downloads: 389,
            description: '本社區最高管理章程，內含裝潢管理辦法、寵物管理規範與公設使用細則。'
        },
        {
            id: 'DOC-003',
            title: '社區公共設施裝潢施工申請表',
            category: '申請表單',
            fileType: 'docx',
            size: '350 KB',
            date: '2026-02-01',
            downloads: 245,
            description: '住戶進行室內裝潢施工前需填寫此表單，交至管理室並繳交保證金。'
        },
        {
            id: 'DOC-004',
            title: '115年5月份社區財務收支明細表',
            category: '財務報表',
            fileType: 'xlsx',
            size: '1.2 MB',
            date: '2026-06-10',
            downloads: 98,
            description: '包含管理費收支、公共基金餘額、例行維護支出與專案修繕撥款細目。'
        },
        {
            id: 'DOC-005',
            title: '社區汽車/機車車位出租申請書',
            category: '申請表單',
            fileType: 'docx',
            size: '280 KB',
            date: '2026-01-10',
            downloads: 180,
            description: '供住戶申請每年一度的社區公共車位抽籤或臨時車位承租登記。'
        },
        {
            id: 'DOC-006',
            title: '防災避難與防空演練住戶配合須知',
            category: '社區規約',
            fileType: 'pdf',
            size: '950 KB',
            date: '2026-06-01',
            downloads: 64,
            description: '宣導本社區避難路線、防空避難室位置及遭遇緊急狀況時的應變步驟。'
        }
    ];

    // 取得檔案圖示
    const getFileIcon = (fileType) => {
        switch(fileType) {
            case 'pdf':
                return { icon: <FileText size={24} />, color: '#ef4444', label: 'PDF' };
            case 'docx':
                return { icon: <FileText size={24} />, color: '#3b82f6', label: 'Word' };
            case 'xlsx':
                return { icon: <FileText size={24} />, color: '#10b981', label: 'Excel' };
            default:
                return { icon: <FileText size={24} />, color: '#6b7280', label: 'FILE' };
        }
    };

    // 分類過濾與搜尋過濾
    const filteredDocs = documents.filter(doc => {
        const matchesTab = activeTab === '全部' || doc.category === activeTab;
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleDownload = (id, title) => {
        setDownloadingId(id);
        
        // 模擬下載載入動畫
        setTimeout(() => {
            setDownloadingId(null);
            setSuccessMessage(`已成功下載：${title}`);
            
            // 3秒後清除成功訊息
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }, 1500);
    };

    const categories = ['全部', '社區規約', '申請表單', '會議記錄', '財務報表'];

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區文件下載區" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部主題橫幅 */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.3)'
                }}>
                    <Download size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>社區文件下載中心</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        在此下載社區各項法規、會議記錄、財務報表及常用表單，公開透明，方便住戶隨時查閱與下載。
                    </p>
                </div>

                {/* 浮動下載成功提示 */}
                {successMessage && (
                    <div style={{
                        position: 'fixed',
                        top: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#d1fae5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <CheckCircle size={20} color="#059669" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* 搜尋與篩選區域 */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        justifyContent: 'space-between',
                        alignItems: 'stretch'
                    }}>
                        {/* 搜尋框 */}
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                            <input 
                                type="text"
                                placeholder="輸入文件名稱或關鍵字搜尋..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* 分類 Tab */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            overflowX: 'auto', 
                            paddingBottom: '4px',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        border: activeTab === cat ? 'none' : '1px solid #cbd5e1',
                                        backgroundColor: activeTab === cat ? 'var(--primary-color)' : '#FFFFFF',
                                        color: activeTab === cat ? '#FFFFFF' : '#475569',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        boxShadow: activeTab === cat ? '0 4px 6px rgba(59, 130, 246, 0.2)' : 'none'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 文件清單 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredDocs.length === 0 ? (
                        <div style={{ 
                            gridColumn: '1 / -1', 
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            backgroundColor: '#FFFFFF', 
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            color: '#64748b'
                        }}>
                            <Info size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>找不到符合條件的文件</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>請試試其他搜尋關鍵字或分類</div>
                        </div>
                    ) : (
                        filteredDocs.map((doc) => {
                            const fileInfo = getFileIcon(doc.fileType);
                            const isDownloading = downloadingId === doc.id;
                            
                            return (
                                <div 
                                    key={doc.id}
                                    className="card interactive"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div>
                                        {/* 頂部類別與檔案標籤 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: '600', 
                                                color: '#0ea5e9', 
                                                backgroundColor: '#f0f9ff', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px' 
                                            }}>
                                                {doc.category}
                                            </span>
                                            
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: '700', 
                                                color: fileInfo.color, 
                                                border: `1px solid ${fileInfo.color}`,
                                                padding: '2px 8px', 
                                                borderRadius: '4px',
                                                backgroundColor: `${fileInfo.color}08`
                                            }}>
                                                {fileInfo.label}
                                            </span>
                                        </div>

                                        {/* 文件標題與說明 */}
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: '700', lineHeight: '1.4' }}>
                                            {doc.title}
                                        </h3>
                                        
                                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                                            {doc.description}
                                        </p>
                                    </div>

                                    {/* 底部檔案資訊與下載按鈕 */}
                                    <div style={{ 
                                        borderTop: '1px solid #f1f5f9', 
                                        paddingTop: '16px', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center' 
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                <Calendar size={12} />
                                                <span>{doc.date}</span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                <HardDrive size={12} />
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(doc.id, doc.title)}
                                            disabled={isDownloading}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                backgroundColor: isDownloading ? '#e2e8f0' : 'var(--primary-color)',
                                                color: isDownloading ? '#94a3b8' : '#FFFFFF',
                                                border: 'none',
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                cursor: isDownloading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: isDownloading ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.1)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {isDownloading ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>下載中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={16} />
                                                    <span>下載檔案</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DownloadPage;
