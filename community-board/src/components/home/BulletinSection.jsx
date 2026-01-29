import Card from '../ui/Card';

const BulletinSection = ({ bulletins }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {bulletins.map((item) => (
                <Card key={item.id} onClick={() => alert(`查看公告詳情: ${item.title}`)} style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                                backgroundColor: 'var(--bg-color)',
                                color: 'var(--text-sub)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                            }}>
                                {item.date}
                            </span>
                            <span style={{
                                color: 'var(--primary-color)',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                border: '1px solid var(--primary-color)',
                                padding: '2px 8px',
                                borderRadius: '12px'
                            }}>
                                {item.category}
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
            ))}
        </div>
    );
};

export default BulletinSection;
