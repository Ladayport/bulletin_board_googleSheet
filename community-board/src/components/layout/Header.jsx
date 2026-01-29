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
            <Link to="/login"
                title="管理員登入"
                className="btn-icon"
                style={{
                    color: 'var(--primary-color)',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-body)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <LogIn size={24} />
            </Link>
        </header>
    );
};

export default Header;
