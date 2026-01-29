import Card from '../ui/Card';

const BulletinSection = ({ bulletins, onBulletinClick }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {bulletins.map((item) => (
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
                                {item.date}
                            </span>
                            <span className="tag" style={{
                                color: 'var(--primary-color)',
                                border: '1px solid var(--primary-color)'
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
