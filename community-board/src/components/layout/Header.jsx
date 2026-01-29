import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ title }) => {
    return (
        <header style={{
            backgroundColor: 'var(--card-bg)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                {title}
            </h1>
            <Link to="/login" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.9rem'
            }}>
                <LogIn size={18} />
                管理登入
            </Link>
        </header>
    );
};

export default Header;
