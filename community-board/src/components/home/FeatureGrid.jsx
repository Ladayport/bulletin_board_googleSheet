import Card from '../ui/Card';
import { Search, Users, Bell } from 'lucide-react';

const FeatureGrid = ({ stats }) => {
    const features = [
        {
            title: '失物招領',
            count: stats.lostAndFound,
            icon: <Search size={32} color="var(--primary-color)" />,
            color: '#e0f2fe'
        },
        {
            title: '會議紀錄',
            count: stats.meetingRecords,
            icon: <Users size={32} color="var(--accent-color)" />,
            color: '#fff7ed'
        },
        {
            title: '活動通知',
            count: stats.activities,
            icon: <Bell size={32} color="#10b981" />,
            color: '#ecfdf5'
        },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--spacing-md)'
        }} className="feature-grid">
            {features.map((item, index) => (
                <Card key={index} onClick={() => alert(`前往 ${item.title} 頁面`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{
                            backgroundColor: item.color,
                            padding: '12px',
                            borderRadius: '50%'
                        }}>
                            {item.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-sub)' }}>目前共有 {item.count} 筆資訊</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default FeatureGrid;
