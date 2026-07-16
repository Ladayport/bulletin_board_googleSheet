import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { 
    QrCode, 
    UserCheck, 
    Calendar, 
    Car, 
    Clock, 
    FileText, 
    CheckCircle, 
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

const VisitorPage = () => {
    // 表單狀態
    const [formData, setFormData] = useState({
        visitorName: '',
        purpose: '親友拜訪',
        plateNumber: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitTime: '14:00'
    });

    // 歷史紀錄狀態 (Mock)
    const [visitors, setVisitors] = useState([
        {
            id: 'VIS-2026001',
            visitorName: '王思賢 先生',
            purpose: '裝修修繕',
            plateNumber: 'ABC-1234',
            visitDate: '2026-06-27',
            visitTime: '09:00',
            status: '已登記',
            createdTime: '2026-06-26 12:00'
        },
        {
            id: 'VIS-2026002',
            visitorName: '熊貓外送',
            purpose: '快遞外送',
            plateNumber: '無車牌',
            visitDate: '2026-06-26',
            visitTime: '18:30',
            status: '已使用',
            createdTime: '2026-06-26 18:10'
        },
        {
            id: 'VIS-2026003',
            visitorName: '陳大同 女士',
            purpose: '親友拜訪',
            plateNumber: '9988-XY',
            visitDate: '2026-06-20',
            visitTime: '15:00',
            status: '已過期',
            createdTime: '2026-06-20 10:00'
        }
    ]);

    const [isPassOpen, setIsPassOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createdPass, setCreatedPass] = useState(null);
    const [timeLeft, setTimeLeft] = useState('23:59:59'); // 動態到期倒數 Mock

    // 模擬通行證倒數
    useEffect(() => {
        if (isPassOpen) {
            const timer = setInterval(() => {
                const now = new Date();
                const hours = 23 - now.getHours();
                const minutes = 59 - now.getMinutes();
                const seconds = 59 - now.getSeconds();
                setTimeLeft(
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                );
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isPassOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.visitorName || !formData.visitDate || !formData.visitTime) {
            alert('請填寫所有必要欄位');
            return;
        }

        setSubmitting(true);

        setTimeout(() => {
            const newPass = {
                id: `VIS-2026${String(visitors.length + 1).padStart(3, '0')}`,
                visitorName: formData.visitorName,
                purpose: formData.purpose,
                plateNumber: formData.plateNumber || '無車牌',
                visitDate: formData.visitDate,
                visitTime: formData.visitTime,
                status: '已登記',
                createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };

            setVisitors([newPass, ...visitors]);
            setCreatedPass(newPass);
            setSubmitting(false);
            setIsPassOpen(true);

            // 重設表單
            setFormData({
                visitorName: '',
                purpose: '親友拜訪',
                plateNumber: '',
                visitDate: new Date().toISOString().split('T')[0],
                visitTime: '14:00'
            });
        }, 1000);
    };

    // 狀態標籤樣式
    const getStatusStyle = (status) => {
        switch(status) {
            case '已登記':
                return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' };
            case '已使用':
                return { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' };
            case '已過期':
                return { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' };
            default:
                return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區訪客預約登記" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部 Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #f43f5e, #f97316)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.3)'
                }}>
                    <UserCheck size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>住戶專用訪客預約</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        親友拜訪、送貨外送或裝修施作？在此先填寫訪客資料生成「臨時通行證 QR Code」。訪客到達管理室時出示掃描即可快速通行。
                    </p>
                </div>

                {/* 雙欄排版 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '32px'
                }}>
                    {/* 左側表單 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                        height: 'fit-content'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="#f43f5e" />
                            新增訪客預約
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* 訪客姓名 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    訪客姓名 / 代表機構 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input 
                                    type="text"
                                    name="visitorName"
                                    placeholder="例如：王先生、熊貓外送員、大金空調"
                                    value={formData.visitorName}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* 拜訪事由 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    拜訪事由
                                </label>
                                <select 
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        backgroundColor: '#FFFFFF',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="親友拜訪">親友拜訪 / 私人聚會</option>
                                    <option value="快遞外送">外送 (UberEats/Foodpanda)、包裹外遞</option>
                                    <option value="裝修修繕">室內裝潢、冷氣水電檢修廠商</option>
                                    <option value="商務公事">商務面談、房仲帶看等</option>
                                </select>
                            </div>

                            {/* 訪客車牌 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    訪客車牌號碼 (選填，用於ETag進出)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Car size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                    <input 
                                        type="text"
                                        name="plateNumber"
                                        placeholder="例如：ABC-9999 (免填英文字元間橫線)"
                                        value={formData.plateNumber}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 38px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 拜訪日期與時間 */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        拜訪日期 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                        <input 
                                            type="date"
                                            name="visitDate"
                                            value={formData.visitDate}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 36px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        預估到達時間 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                        <input 
                                            type="time"
                                            name="visitTime"
                                            value={formData.visitTime}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 36px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    backgroundColor: submitting ? '#fecdd3' : '#f43f5e',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px rgba(244, 63, 94, 0.2)',
                                    transition: 'background-color 0.2s, transform 0.1s'
                                }}
                                onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {submitting ? '登記送出中...' : '送出預約並生成通行證'}
                            </button>
                        </form>
                    </div>

                    {/* 右側：近期預約歷史紀錄 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserCheck size={20} color="var(--primary-color)" />
                            已預約訪客紀錄
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {visitors.map((visitor) => {
                                const statusStyle = getStatusStyle(visitor.status);
                                return (
                                    <div
                                        key={visitor.id}
                                        className="card interactive"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            backgroundColor: '#f8fafc',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                        }}
                                        onClick={() => {
                                            if (visitor.status === '已登記') {
                                                setCreatedPass(visitor);
                                                setIsPassOpen(true);
                                            } else {
                                                alert('該通行證已失效或已使用。');
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{visitor.id}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.border}`,
                                                fontWeight: '600'
                                            }}>
                                                {visitor.status}
                                            </span>
                                        </div>

                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '750' }}>
                                            {visitor.visitorName}
                                        </h4>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Calendar size={12} />
                                                <span>預計：{visitor.visitDate} {visitor.visitTime}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Car size={12} />
                                                <span>車牌：{visitor.plateNumber}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                            <span>事由: {visitor.purpose}</span>
                                            <span>登記於: {visitor.createdTime}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* 訪客通行證產生器 Modal */}
            <Modal
                isOpen={isPassOpen}
                onClose={() => setIsPassOpen(false)}
                title="訪客電子通行憑證"
            >
                {createdPass && (
                    <div style={{ padding: '5px 0', color: '#1e293b' }}>
                        {/* 仿實體識別證憑證 */}
                        <div style={{
                            border: '2px solid #fda4af',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            backgroundColor: '#fffdfd',
                            boxShadow: '0 6px 15px rgba(244, 63, 94, 0.05)',
                            marginBottom: '20px'
                        }}>
                            {/* 憑證頭部 */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f43f5e, #f97316)',
                                color: '#FFFFFF',
                                padding: '16px',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '1px' }}>
                                    社區訪客臨時通行證
                                </h4>
                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>VISITOR DIGITAL PASS</span>
                            </div>

                            {/* 憑證主體 */}
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* 二維碼 */}
                                <div style={{
                                    border: '2px solid #f1f5f9',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    backgroundColor: '#FFFFFF',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                                }}>
                                    <QrCode size={140} color="#1e293b" />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#ef4444',
                                    backgroundColor: '#fef2f2',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    marginBottom: '16px'
                                }}>
                                    <Clock size={12} />
                                    <span>通行證有效剩餘時間：{timeLeft}</span>
                                </div>

                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '800', color: '#e11d48' }}>
                                    {createdPass.visitorName}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginBottom: '20px' }}>
                                    拜訪事由：{createdPass.purpose} ({createdPass.plateNumber})
                                </div>

                                {/* 細節對照表 */}
                                <div style={{ 
                                    width: '100%', 
                                    fontSize: '0.85rem', 
                                    borderTop: '1px dashed #fda4af', 
                                    paddingTop: '16px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '8px' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>預約通行時間</span>
                                        <strong style={{ color: '#334155' }}>{createdPass.visitDate} {createdPass.visitTime}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>受訪住戶</span>
                                        <strong style={{ color: '#334155' }}>A棟 12樓-3 (王小姐戶)</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>憑證編號</span>
                                        <strong style={{ color: '#334155' }}><code>{createdPass.id}</code></strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 安全提醒 */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#b45309',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            lineHeight: '1.4',
                            marginBottom: '20px'
                        }}>
                            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong>資安注意：</strong> 請直接將此憑證網頁或截圖發送給來訪賓客。來賓於一樓大廳或車道警衛室掃描後，警衛端將自動確認已完成登記並放行。
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    alert('已模擬儲存訪客通行憑證至手機相簿。');
                                    setIsPassOpen(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #f43f5e',
                                    backgroundColor: '#FFFFFF',
                                    color: '#f43f5e',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                儲存憑證圖片
                            </button>
                            <button
                                onClick={() => setIsPassOpen(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f43f5e',
                                    color: '#FFFFFF',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(244, 63, 94, 0.2)'
                                }}
                            >
                                我知道了
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default VisitorPage;
