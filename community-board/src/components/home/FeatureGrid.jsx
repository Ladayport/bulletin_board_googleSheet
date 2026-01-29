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
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', // 卡片稍微變小以容納更多
            gap: 'var(--spacing-md)'
        }}>
            {features.map((item) => (
                <Card
                    key={item.id}
                    onClick={() => navigate(`/category/${item.id}`)}
                    className="feature-card"
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'center',
                        padding: '12px'
                    }}>
                        <div style={{
                            backgroundColor: item.bgColor,
                            padding: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            {item.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.count} 筆</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default FeatureGrid;
