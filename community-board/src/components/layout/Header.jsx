import { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getUser());
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    useEffect(() => {
        setUser(authService.getUser());
        setIsAuthenticated(authService.isAuthenticated());
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        // 直接實體重導向至含有 Base URL 的首頁路徑，以防重新整理時掉出子路徑
        window.location.href = '/bulletin_board_googleSheet/';
    };

    return (
        <header style={{
            backgroundColor: 'var(--card-bg)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', margin: 0 }}>
                {title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/admin"
                            title="進入管理後台"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#f1f5f9',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <User size={16} style={{ color: 'var(--primary-color)' }} />
                            <span>{user?.name || user?.username || '使用者'}</span>
                            <span style={{ 
                                padding: '2px 6px', 
                                backgroundColor: 'var(--primary-color)', 
                                color: 'white', 
                                borderRadius: '4px',
                                fontSize: '0.7rem'
                            }}>
                                已登入
                            </span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn-icon"
                            title="安全登出"
                            style={{
                                color: '#ef4444',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <LogOut size={24} />
                        </button>
                    </>
                ) : (
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
                )}
            </div>
        </header>
    );
};

export default Header;
