import { useState } from 'react';
import Card from '../ui/Card';
import {
    Bell,         // 公告
    Calendar,     // 活動
    Users,        // 會議
    Wrench,       // 工程進度
    MoreHorizontal, // 其他
    HelpCircle,   // QA
    Download,     // 下載區
    MessageSquare, // 討論區
    Flame,        // 瓦斯
    CalendarClock, // 預約
    Package,      // 包裹
    QrCode        // 訪客
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../ui/Modal';

const FeatureGrid = ({ stats }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 排序: 1.公告 2.活動 3.會議 4.工程進度 5.Q&A 6.其他項目
    const features = [
        {
            id: 'notice',
            title: '公告通知',
            count: stats.notice || 0,
            icon: <Bell size={32} color="#FFFFFF" />,
            bgColor: '#3b82f6' // 藍
        },
        {
            id: 'activities',
            title: '活動通知',
            count: stats.activities || 0,
            icon: <Calendar size={32} color="#FFFFFF" />,
            bgColor: '#10b981' // 綠
        },
        {
            id: 'meeting',
            title: '會議紀錄',
            count: stats.meeting || 0,
            icon: <Users size={32} color="#FFFFFF" />,
            bgColor: '#f59e0b' // 黃/橘
        },
        {
            id: 'engineering',
            title: '工程',
            count: stats.lostAndFound || 0,
            icon: <Wrench size={32} color="#FFFFFF" />,
            bgColor: '#f97316' // 亮橘/工程色
        },
        {
            id: 'qa',
            title: 'Q&A',
            count: stats.qa || 0,
            icon: <HelpCircle size={32} color="#FFFFFF" />,
            bgColor: '#8b5cf6' // 紫
        },
        {
            id: 'others',
            title: '其他項目',
            count: stats.others || 0,
            icon: <MoreHorizontal size={32} color="#FFFFFF" />,
            bgColor: '#6366f1' // 紫
        }
    ];

    return (
        <>
            <div className="feature-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {
                    features.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'others') {
                                    setIsModalOpen(true);
                                } else if (stats.onCategoryClick) {
                                    stats.onCategoryClick(item.title);
                                } else {
                                    navigate(`/category/${item.id}`);
                                }
                            }}
                            className="card interactive"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                background: 'var(--bg-card)',
                                borderRadius: '16px',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{
                                backgroundColor: item.bgColor,
                                padding: '16px',
                                borderRadius: '50%',
                                color: 'white',
                                marginBottom: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                                {item.title}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {item.id === 'others' ? '更多' : `${item.count} 筆`}
                            </div>
                        </div>
                    ))
                }
            </div >

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="其他項目"
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    padding: '10px 0'
                }}>
                    {/* 線上報修 */}
                    <Link
                        to="/repair"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <Wrench size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                線上報修
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                公設與設備故障申報
                            </div>
                        </div>
                    </Link>

                    {/* 瓦斯回報 */}
                    <Link
                        to="/gas"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f97316, #ef4444)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <Flame size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                瓦斯回報
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                線上填報瓦斯度數
                            </div>
                        </div>
                    </Link>

                    {/* 公設預約 */}
                    <Link
                        to="/booking"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <CalendarClock size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                公設預約
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                KTV及各類公設線上預約
                            </div>
                        </div>
                    </Link>

                    {/* 包裹查詢 */}
                    <Link
                        to="/package"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <Package size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                包裹查詢
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                管理室掛號收發查詢
                            </div>
                        </div>
                    </Link>

                    {/* 訪客登記 */}
                    <Link
                        to="/visitor"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f43f5e, #f97316)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <QrCode size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                訪客登記
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                親友與外送訪客快速通行證
                            </div>
                        </div>
                    </Link>

                    {/* 下載區 */}
                    <Link
                        to="/download"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <Download size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                下載區
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                社區規約與表格下載
                            </div>
                        </div>
                    </Link>

                    {/* 討論區 */}
                    <Link
                        to="/forum"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="card interactive" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #047857)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: '#ef4444',
                                color: '#FFFFFF',
                                padding: '2px 6px',
                                borderRadius: '20px',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                開發中
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                padding: '12px',
                                borderRadius: '50%',
                                marginBottom: '12px'
                            }}>
                                <MessageSquare size={24} color="#FFFFFF" />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                                討論區
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                住戶交流與二手交易
                            </div>
                        </div>
                    </Link>
                </div>
            </Modal>
        </>
    );
};

export default FeatureGrid;
