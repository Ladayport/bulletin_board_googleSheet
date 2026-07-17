import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import Card from '../../components/ui/Card';
import { PlusCircle, LogOut, FileText, ClipboardCheck, Settings, Wrench, Flame, CalendarDays, Package, UserCheck } from 'lucide-react';

// 定義每個功能代碼對應的圖示與路徑
const featureConfig = {
    'add_announcement': {
        icon: <PlusCircle size={40} />,
        color: 'var(--primary-color)',
        bg: '#e0f2fe',
        desc: '撰寫並發佈新的社區公告或通知',
        path: '/admin/add'
    },
    'manage_bulletins': {
        icon: <FileText size={40} />,
        color: '#f59e0b',
        bg: '#fef3c7',
        desc: '編輯或刪除已發佈的資訊',
        path: '/admin/manage'
    },
    'add_engineering': {
        icon: <PlusCircle size={40} />,
        color: '#10b981',
        bg: '#dcfce7',
        desc: '建立新的工程進度追蹤與工期項目',
        path: '/category/engineering?openAdd=true'
    },
    'quote_inquiry': {
        icon: <ClipboardCheck size={40} />,
        color: '#0284c7',
        bg: '#f0f9ff',
        desc: '管理工程項目詢價、報價歷程與投票單匯出',
        path: '/admin/inquiry'
    },
    'page_management': {
        icon: <Settings size={40} />,
        color: '#6366f1',
        bg: '#e0e7ff',
        desc: '設定各項功能的存取權限與開放狀態',
        path: '/admin/pages'
    },
    'repair_manage': {
        icon: <Wrench size={40} />,
        color: '#ef4444',
        bg: '#fee2e2',
        desc: '查看並追蹤社區設備報修進度',
        path: '/repair'
    },
    'gas_manage': {
        icon: <Flame size={40} />,
        color: '#f97316',
        bg: '#ffedd5',
        desc: '瓦斯度數登記與管理',
        path: '/gas'
    },
    'booking_manage': {
        icon: <CalendarDays size={40} />,
        color: '#8b5cf6',
        bg: '#ede9fe',
        desc: '公設預約借用管理',
        path: '/booking'
    },
    'package_manage': {
        icon: <Package size={40} />,
        color: '#14b8a6',
        bg: '#ccfbf1',
        desc: '住戶包裹收發與查詢',
        path: '/package'
    },
    'visitor_manage': {
        icon: <UserCheck size={40} />,
        color: '#f43f5e',
        bg: '#ffe4e6',
        desc: '外來訪客登記管理',
        path: '/visitor'
    }
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const userLevel = authService.getUserLevel();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // 過濾出使用者有權限，且系統啟用的功能按鈕
    const getVisibleFeatures = () => {
        const visibleCards = [];
        for (const code in featureConfig) {
            const perm = authService.getPagePermission(code);
            if (perm && perm.is_use === 'Y' && userLevel >= perm.level) {
                // 將設定檔名稱混入
                visibleCards.push({
                    code,
                    name: perm.desc || code,
                    ...featureConfig[code]
                });
            }
        }
        return visibleCards;
    };

    const visibleCards = getVisibleFeatures();

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--primary-color)' }}>管理中心</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary">
                        首頁
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        <LogOut size={18} /> 登出
                    </button>
                </div>
            </div>

            {visibleCards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    您目前沒有任何可用功能權限，請聯絡系統管理員。
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {visibleCards.map((feature) => (
                        <Card key={feature.code} onClick={() => navigate(feature.path)} className="interactive">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: feature.bg, padding: '16px', borderRadius: '50%', color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3>{feature.name}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
