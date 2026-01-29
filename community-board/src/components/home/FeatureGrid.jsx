import Card from '../ui/Card';
import {
    Bell,         // 公告
    Calendar,     // 活動
    Users,        // 會議
    Search,       // 失物
    MoreHorizontal, // 其他
    HelpCircle    // QA
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureGrid = ({ stats }) => {
    const navigate = useNavigate();

    // 排序: 1.公告 2.活動 3.會議 4.失物 5.其他 6.Q&A
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
            id: 'lost-found',
            title: '失物招領',
            count: stats.lostAndFound || 0,
            icon: <Search size={32} color="#FFFFFF" />,
            bgColor: '#ef4444' // 紅
        },
        {
            id: 'others',
            title: '其他項目',
            count: stats.others || 0,
            icon: <MoreHorizontal size={32} color="#FFFFFF" />,
            bgColor: '#6366f1' // 紫
        },
        {
            id: 'qa',
            title: 'Q&A',
            count: stats.qa || 0,
            icon: <HelpCircle size={32} color="#FFFFFF" />,
            bgColor: '#8b5cf6' // 紫
        }
    ];

    return (
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
                            if (stats.onCategoryClick) {
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
                            transition: 'transform 0.2s',
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
                            {item.count} 筆
                        </div>
                    </div>
                ))
            }
        </div >
    );
};

export default FeatureGrid;
