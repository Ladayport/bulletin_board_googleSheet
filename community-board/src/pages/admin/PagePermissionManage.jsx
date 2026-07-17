import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { authService } from '../../services/auth';
import { ArrowLeft, Save, Edit2, X } from 'lucide-react';
import { PAGE_FEATURES } from '../../config/pageFeatures';

const PagePermissionManage = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [editForm, setEditForm] = useState({ level: 99, is_use: 'Y' });
    const user = authService.getUser();

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        setLoading(true);
        try {
            // 呼叫 sync 強制取得最新資料
            const operator = user?.name || user?.username || 'Admin';
            const permResult = await api.syncPagePermissions(operator, PAGE_FEATURES);
            if (permResult.success) {
                setPermissions(permResult.permissions);
                authService.setPagePermissions(permResult.permissions);
            }
        } catch (error) {
            alert('載入權限資料失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (perm) => {
        setEditingCode(perm.code);
        setEditForm({ level: perm.level, is_use: perm.is_use });
    };

    const handleCancelEdit = () => {
        setEditingCode(null);
    };

    const handleSave = async (code) => {
        if (!window.confirm('確定要儲存這個權限變更嗎？')) return;

        try {
            const operator = user?.name || user?.username || 'Admin';
            const res = await api.updatePagePermission(operator, code, parseInt(editForm.level, 10), editForm.is_use);
            if (res.success) {
                alert('更新成功！');
                setEditingCode(null);
                loadPermissions(); // 重新載入
            } else {
                alert('更新失敗：' + res.message);
            }
        } catch (error) {
            alert('系統發生錯誤：' + error.message);
        }
    };

    const handleShowLogs = (logsJson) => {
        try {
            const logs = JSON.parse(logsJson || '[]');
            if (logs.length === 0) {
                alert('尚無修改紀錄');
                return;
            }
            const logText = logs.map(l => 
                `[${l.timestamp}] ${l.updater}\n層級: ${l.before?.level}->${l.after?.level}\n啟用: ${l.before?.is_use}->${l.after?.is_use}`
            ).join('\n\n');
            alert(logText);
        } catch (e) {
            alert('無法解析日誌');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/admin')} className="btn-icon">
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>系統頁面權限管理</h2>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>功能代號</th>
                                <th style={{ padding: '16px' }}>說明</th>
                                <th style={{ padding: '16px' }}>權限等級</th>
                                <th style={{ padding: '16px' }}>是否啟用</th>
                                <th style={{ padding: '16px' }}>最後更新</th>
                                <th style={{ padding: '16px' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && permissions.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>載入中...</td></tr>
                            ) : permissions.map((perm) => (
                                <tr key={perm.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontFamily: 'monospace' }}>{perm.code}</td>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{perm.desc}</td>
                                    
                                    <td style={{ padding: '16px' }}>
                                        {editingCode === perm.code ? (
                                            <input 
                                                type="number" 
                                                value={editForm.level} 
                                                onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                                                style={{ width: '60px', padding: '4px' }}
                                            />
                                        ) : (
                                            <span style={{ 
                                                background: perm.level >= 50 ? '#fee2e2' : '#dcfce7',
                                                color: perm.level >= 50 ? '#dc2626' : '#16a34a',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}>{perm.level}</span>
                                        )}
                                    </td>
                                    
                                    <td style={{ padding: '16px' }}>
                                        {editingCode === perm.code ? (
                                            <select 
                                                value={editForm.is_use}
                                                onChange={(e) => setEditForm({...editForm, is_use: e.target.value})}
                                                style={{ padding: '4px' }}
                                            >
                                                <option value="Y">是 (Y)</option>
                                                <option value="N">否 (N)</option>
                                            </select>
                                        ) : (
                                            <span style={{ 
                                                color: perm.is_use === 'Y' ? '#16a34a' : '#ef4444',
                                                fontWeight: 'bold'
                                            }}>
                                                {perm.is_use === 'Y' ? '啟用' : '停用'}
                                            </span>
                                        )}
                                    </td>

                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                                        {perm.updater ? (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{perm.updater}</span>
                                                <span>{perm.updateTime}</span>
                                                <button 
                                                    onClick={() => handleShowLogs(perm.logs)}
                                                    style={{ 
                                                        background: 'none', border: 'none', color: '#0284c7', 
                                                        cursor: 'pointer', padding: 0, textAlign: 'left', marginTop: '4px', textDecoration: 'underline'
                                                    }}>查看紀錄</button>
                                            </div>
                                        ) : (
                                            <span>無更新紀錄</span>
                                        )}
                                    </td>

                                    <td style={{ padding: '16px' }}>
                                        {editingCode === perm.code ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleSave(perm.code)} className="btn-icon" style={{ color: '#16a34a' }} title="儲存"><Save size={20}/></button>
                                                <button onClick={handleCancelEdit} className="btn-icon" style={{ color: '#ef4444' }} title="取消"><X size={20}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEditClick(perm)} className="btn-icon" style={{ color: '#64748b' }} title="編輯"><Edit2 size={20}/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PagePermissionManage;
