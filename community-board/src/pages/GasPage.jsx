import { useState } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { 
    Flame, 
    Camera, 
    TrendingUp, 
    History, 
    CheckCircle, 
    AlertTriangle,
    Info
} from 'lucide-react';

const GasPage = () => {
    const lastReading = 1245; // Mock 前次度數
    const [currentReading, setCurrentReading] = useState('');
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 歷史紀錄 (Mock)
    const historyData = [
        { period: '115年06月', reading: 1245, usage: 22, date: '2026-06-02', status: '已確認' },
        { period: '115年04月', reading: 1223, usage: 35, date: '2026-04-05', status: '已確認' },
        { period: '115年02月', reading: 1188, usage: 48, date: '2026-02-03', status: '已確認' },
        { period: '114年12月', reading: 1140, usage: 40, date: '2025-12-04', status: '已確認' },
        { period: '114年10月', reading: 1100, usage: 18, date: '2025-10-02', status: '已確認' },
        { period: '114年08月', reading: 1082, usage: 15, date: '2025-08-05', status: '已確認' }
    ];

    // 即時計算本次用度
    const usage = currentReading ? parseInt(currentReading, 10) - lastReading : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = parseInt(currentReading, 10);

        if (isNaN(value)) {
            setErrorMsg('請輸入有效的數字度數');
            return;
        }

        if (value < lastReading) {
            setErrorMsg(`輸入度數不可低於前次抄表度數 (${lastReading})`);
            return;
        }

        if (value > lastReading + 200) {
            setErrorMsg('本次申報度數異常偏高，請確認是否填寫正確，或改上傳儀表照片由管理室審查。');
            return;
        }

        setErrorMsg('');
        setSubmitting(true);

        // 模擬送出 API
        setTimeout(() => {
            setSubmitting(false);
            setIsSuccessOpen(true);
        }, 1000);
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區瓦斯抄表系統" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部 Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                }}>
                    <Flame size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>線上瓦斯度數申報</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        請於每雙月 1 日至 5 日期間，查看您家門外的瓦斯表計度器，並在此回報當月度數。線上申報快速便利，免除下樓手寫煩惱。
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '32px'
                }}>
                    {/* 左側：抄表申報表單 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                        height: 'fit-content'
                    }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Flame size={20} color="#f97316" />
                            本期度數申報 (115年08月)
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* 前次度數顯示 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '24px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>前次抄表度數</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#334155', marginTop: '4px' }}>
                                        {lastReading} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#64748b' }}>度</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>抄表計費週期</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155', marginTop: '8px' }}>
                                        115/04/05 - 115/06/02
                                    </div>
                                </div>
                            </div>

                            {/* 本次度數輸入 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    輸入本次瓦斯表度數 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input 
                                    type="number"
                                    placeholder="請輸入瓦斯表黑色滾輪上的5位數字"
                                    value={currentReading}
                                    onChange={(e) => {
                                        setCurrentReading(e.target.value);
                                        setErrorMsg('');
                                    }}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1.2rem',
                                        fontWeight: '700',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        letterSpacing: '1px'
                                    }}
                                />
                            </div>

                            {/* 即時計算顯示區 */}
                            {currentReading && (
                                <div style={{
                                    backgroundColor: usage >= 0 ? '#fffbeb' : '#fef2f2',
                                    border: usage >= 0 ? '1px solid #fef3c7' : '1px solid #fecaca',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: '600', color: usage >= 0 ? '#b45309' : '#dc2626' }}>
                                        {usage >= 0 ? '試算本期使用度數' : '度數錯誤'}
                                    </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: usage >= 0 ? '#b45309' : '#dc2626' }}>
                                        {usage >= 0 ? `${usage} 度` : '低於前次度數'}
                                    </span>
                                </div>
                            )}

                            {errorMsg && (
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.5',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'start'
                                }}>
                                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* 照片拍照 Mock 區 */}
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                marginBottom: '24px',
                                backgroundColor: '#f8fafc',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f97316'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                            >
                                <Camera size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                                    上傳瓦斯表指針相片 (選填)
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                    上傳相片可供管理小組雙重覆核，避免登錄錯誤
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    backgroundColor: submitting ? '#fed7aa' : '#f97316',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)',
                                    transition: 'background-color 0.2s, transform 0.1s'
                                }}
                                onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {submitting ? '申報傳送中...' : '送出本次抄表'}
                            </button>
                        </form>
                    </div>

                    {/* 右側：用量趨勢圖與歷史紀錄 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* 純 CSS 趨勢圖 */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} color="#f97316" />
                                近六期瓦斯用量趨勢 (度)
                            </h3>

                            {/* CSS 長條圖圖表 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'end',
                                height: '180px',
                                padding: '10px 10px 0 10px',
                                borderBottom: '1px solid #e2e8f0',
                                marginBottom: '12px'
                            }}>
                                {historyData.slice().reverse().map((data, idx) => {
                                    // 換算成高度比率，用量最大是 48 度
                                    const heightPercent = `${(data.usage / 50) * 100}%`;
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '12%',
                                            height: '100%',
                                            justifyContent: 'end'
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                                                {data.usage}
                                            </span>
                                            <div style={{
                                                width: '100%',
                                                height: heightPercent,
                                                background: 'linear-gradient(to top, #ffedd5, #f97316)',
                                                borderRadius: '6px 6px 0 0',
                                                transition: 'height 0.5s ease-out',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(249, 115, 22, 0.1)'
                                            }}
                                            title={`度數: ${data.reading}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X 軸標籤 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}>
                                {historyData.slice().reverse().map((data, idx) => (
                                    <div key={idx} style={{ 
                                        width: '12%', 
                                        textAlign: 'center', 
                                        fontSize: '0.7rem', 
                                        color: '#94a3b8', 
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {data.period.replace('115年', '').replace('114年', '')}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 歷史申報清單 */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={18} color="#f97316" />
                                歷史抄表申報紀錄
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historyData.map((data, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #f1f5f9',
                                        backgroundColor: '#f8fafc'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>{data.period}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>回報時間：{data.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>
                                                {data.reading} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>度</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: '600', marginTop: '2px' }}>
                                                使用量：{data.usage} 度
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 成功彈出視窗 */}
            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="申報成功"
            >
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#1e293b' }}>
                    <div style={{
                        display: 'inline-flex',
                        backgroundColor: '#ffedd5',
                        color: '#f97316',
                        padding: '16px',
                        borderRadius: '50%',
                        marginBottom: '16px'
                    }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '700' }}>本次瓦斯度數申報成功！</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                        您申報的度數為 <strong style={{ color: '#f97316' }}>{currentReading} 度</strong>，本期用量為 <strong style={{ color: '#f97316' }}>{usage} 度</strong>。管理小組核對後將統一報送至天然氣公司彙整。
                    </p>
                    <button
                        onClick={() => setIsSuccessOpen(false)}
                        style={{
                            padding: '10px 32px',
                            borderRadius: '8px',
                            backgroundColor: '#f97316',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)'
                        }}
                    >
                        完成
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default GasPage;
