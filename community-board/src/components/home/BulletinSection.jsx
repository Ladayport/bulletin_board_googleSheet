import Card from '../ui/Card';

const BulletinSection = ({ bulletins, onBulletinClick }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {bulletins.map((item) => {
                // 邏輯: 如果 isEmergency 為 true，強制顯示類別為「緊急」，並使用危險色
                const displayCategory = item.isEmergency ? '緊急' : item.category;
                const categoryStyle = item.isEmergency
                    ? {
                        color: '#dc2626', // Red-600
                        border: '1px solid #dc2626',
                        backgroundColor: '#fef2f2' // Red-50
                    }
                    : {
                        color: 'var(--primary-color)',
                        border: '1px solid var(--primary-color)'
                    };

                return (
                    <Card
                        key={item.id}
                        onClick={() => onBulletinClick && onBulletinClick(item)}
                        style={{ padding: 'var(--spacing-md)' }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="tag" style={{
                                    backgroundColor: 'var(--bg-body)',
                                    color: 'var(--text-muted)'
                                }}>
                                    {item.startDate || item.date}
                                </span>
                                <span className="tag" style={{
                                    ...categoryStyle,
                                    transition: 'all 0.2s'
                                }}>
                                    {displayCategory}
                                </span>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                    {item.title}
                                </span>
                            </div>

                            <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                                查看詳情 &rarr;
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default BulletinSection;
