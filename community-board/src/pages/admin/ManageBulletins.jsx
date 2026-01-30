import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { authService } from '../../services/auth';

const ManageBulletins = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories] = useState([
        { code: '公告', name: '公告' },
        { code: '活動', name: '活動' },
        { code: '會議', name: '會議' },
        { code: '失物', name: '失物' },
        { code: '其他', name: '其他' },
        { code: 'QA', name: 'QA' }
    ]);

    const [filters, setFilters] = useState({
        category: '',
        startDate: '',
        endDate: ''
    });

    const [bulletins, setBulletins] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!filters.category || !filters.startDate || !filters.endDate) {
            alert('請選擇類別與日期範圍');
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const result = await api.getBulletinsByFilter(
                filters.category,
                filters.startDate,
                filters.endDate
            );

            if (result.success) {
                setBulletins(result.bulletins || []);
            } else {
                alert('查詢失敗: ' + result.message);
                setBulletins([]);
            }
        } catch (error) {
            console.error('查詢錯誤:', error);
            alert('查詢失敗，請稍後再試');
            setBulletins([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        // 在新分頁開啟編輯頁面
        window.open(`/admin/edit/${id}`, '_blank');
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`確定要刪除公告「${title}」嗎？\n\n此操作將標記為已刪除，前端將不再顯示。`)) {
            return;
        }

        setLoading(true);
        try {
            const operator = authService.getUser()?.name || 'Admin';
            const result = await api.deleteBulletin(id, operator);

            if (result.success) {
                alert('刪除成功');
                // 重新查詢以更新列表
                handleSearch();
            } else {
                alert('刪除失敗: ' + result.message);
            }
        } catch (error) {
            console.error('刪除錯誤:', error);
            alert('刪除失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ maxWidth: '1200px', margin: '20px auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>管理現有公告</h2>

            {/* 查詢條件區塊 */}
            <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '24px'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>查詢條件</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>類別</label>
                        <select
                            value={filters.category}
                            onChange={e => setFilters({ ...filters, category: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd'
                            }}
                        >
                            <option value="">請選擇類別</option>
                            {categories.map(cat => (
                                <option key={cat.code} value={cat.code}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>開始日期</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>結束日期</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ height: '42px' }}
                    >
                        {loading ? '查詢中...' : '查詢'}
                    </button>
                </div>
            </div>

            {/* 結果列表區塊 */}
            {hasSearched && (
                <div>
                    <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>
                        查詢結果 ({bulletins.length} 筆)
                    </h3>

                    {bulletins.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '8px'
                        }}>
                            查無符合條件的公告
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {bulletins.map(bulletin => (
                                <div
                                    key={bulletin.id}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: bulletin.status === 'D' ? '#f3f4f6' : '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        display: 'grid',
                                        gridTemplateColumns: '100px 1fr 120px 120px 120px 200px',
                                        gap: '16px',
                                        alignItems: 'center',
                                        opacity: bulletin.status === 'D' ? 0.65 : 1,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        ID: {bulletin.id}
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: '500', marginBottom: '4px', textDecoration: bulletin.status === 'D' ? 'line-through' : 'none' }}>
                                            {bulletin.title}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {bulletin.category}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {bulletin.startDate}
                                    </div>

                                    <div>
                                        {bulletin.isUrgent === 'Y' && (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#fef2f2',
                                                color: '#dc2626',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                緊急
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        {bulletin.status === 'D' ? (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                border: '1px solid #fecaca'
                                            }}>
                                                已刪除
                                            </span>
                                        ) : (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#f0fdf4',
                                                color: '#16a34a',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                正常顯示
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleEdit(bulletin.id)}
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                        >
                                            編輯
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bulletin.id, bulletin.title)}
                                            className="btn"
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '0.85rem',
                                                backgroundColor: bulletin.status === 'D' ? '#e5e7eb' : '#fee2e2',
                                                color: bulletin.status === 'D' ? '#9ca3af' : '#dc2626',
                                                border: '1px solid ' + (bulletin.status === 'D' ? '#d1d5db' : '#fecaca'),
                                                cursor: bulletin.status === 'D' ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={loading || bulletin.status === 'D'}
                                        >
                                            {bulletin.status === 'D' ? '已收回' : '刪除'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 返回按鈕 */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => navigate('/admin')}
                    className="btn btn-secondary"
                >
                    返回管理後台
                </button>
            </div>
        </div>
    );
};

export default ManageBulletins;
