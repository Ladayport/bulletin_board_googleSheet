import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { ArrowLeft } from 'lucide-react';
import '../styles/main.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.login(formData.username, formData.password);
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-body)'
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '24px', justifyContent: 'center' }}
                >
                    <ArrowLeft size={18} /> 返回首頁
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>
                    管理員登入
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>帳號</label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>密碼</label>
                        <input
                            type="password"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? '驗證中...' : '登入系統'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
