const Card = ({ children, onClick, style }) => {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--card-radius)',
                boxShadow: 'var(--card-shadow)',
                padding: 'var(--spacing-lg)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                ...style
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--card-hover-shadow)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                }
            }}
        >
            {children}
        </div>
    );
};

export default Card;
