import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import Card from '../../components/ui/Card';
import { PlusCircle, LogOut, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--primary-color)' }}>後台管理系統</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary">
                        首頁
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        <LogOut size={18} /> 登出
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* 功能卡片 1: 發佈公告 */}
                <Card onClick={() => navigate('/admin/add')} className="interactive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '50%', color: 'var(--primary-color)' }}>
                            <PlusCircle size={40} />
                        </div>
                        <div>
                            <h3>發佈新公告</h3>
                            <p style={{ color: 'var(--text-muted)' }}>撰寫並發佈新的社區公告或通知</p>
                        </div>
                    </div>
                </Card>

                {/* 功能卡片 2: 管理列表 */}
                <Card onClick={() => navigate('/admin/manage')} className="interactive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#f59e0b' }}>
                            <FileText size={40} />
                        </div>
                        <div>
                            <h3>管理現有公告</h3>
                            <p style={{ color: 'var(--text-muted)' }}>編輯或刪除已發佈的資訊</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
