import { useState } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { 
    Package, 
    Search, 
    Calendar, 
    User, 
    QrCode, 
    CheckCircle2, 
    Clock, 
    Truck, 
    Info
} from 'lucide-react';

const PackagePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Mock 包裹資料
    const packageData = [
        {
            id: 'PKG-2026042',
            household: 'A棟 12F-3',
            recipient: '張書豪',
            carrier: '黑貓宅急便',
            trackingNumber: '9028-3344-5566',
            status: '待領取',
            arrivalTime: '2026-06-26 14:32',
            desc: '常溫包裹 (中型紙箱)',
            signTime: null
        },
        {
            id: 'PKG-2026041',
            household: 'B棟 8F-1',
            recipient: '林小惠',
            carrier: '中華郵政 (掛號)',
            trackingNumber: '掛號 889977',
            status: '待領取',
            arrivalTime: '2026-06-26 10:15',
            desc: '掛號信件 (信封)',
            signTime: null
        },
        {
            id: 'PKG-2026039',
            household: 'A棟 12F-3',
            recipient: '張書豪',
            carrier: '順豐速運',
            trackingNumber: 'SF-14562233',
            status: '已領取',
            arrivalTime: '2026-06-25 11:20',
            desc: '常溫包裹 (小型紙箱)',
            signTime: '2026-06-25 18:45'
        },
        {
            id: 'PKG-2026038',
            household: 'C棟 5F-2',
            recipient: '陳先生',
            carrier: '7-11 賣貨便',
            trackingNumber: '711-889922',
            status: '已領取',
            arrivalTime: '2026-06-24 16:30',
            desc: '超商轉寄包裹',
            signTime: '2026-06-24 20:10'
        }
    ];

    // 過濾搜尋
    const filteredPackages = packageData.filter(pkg => {
        const query = searchTerm.toLowerCase();
        return pkg.household.toLowerCase().includes(query) || 
               pkg.recipient.toLowerCase().includes(query) ||
               pkg.trackingNumber.toLowerCase().includes(query) ||
               pkg.carrier.toLowerCase().includes(query);
    });

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區包裹查詢系統" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部 Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}>
                    <Package size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>管理室包裹與快遞查詢</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        輸入您的「戶別」或「姓名」即可快速查詢是否有您的掛號信或宅配包裹已送達管理室。點擊待領包裹可生成快速取件碼。
                    </p>
                </div>

                {/* 搜尋欄位 */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    marginBottom: '32px'
                }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                        <input 
                            type="text"
                            placeholder="請輸入戶別 (例如: A棟 12F)、收件人姓名或單號搜尋..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* 包裹清單網格 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredPackages.length === 0 ? (
                        <div style={{ 
                            gridColumn: '1 / -1', 
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            backgroundColor: '#FFFFFF', 
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            color: '#64748b'
                        }}>
                            <Info size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>無包裹符合搜尋條件</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>請確認輸入的資料是否正確</div>
                        </div>
                    ) : (
                        filteredPackages.map((pkg) => {
                            const isPending = pkg.status === '待領取';
                            
                            return (
                                <div 
                                    key={pkg.id}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: isPending ? '0 4px 12px rgba(99, 102, 241, 0.05)' : 'none'
                                    }}
                                >
                                    <div>
                                        {/* 狀態標籤 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: '600', 
                                                color: isPending ? '#4f46e5' : '#059669', 
                                                backgroundColor: isPending ? '#f5f3ff' : '#d1fae5', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px',
                                                border: isPending ? '1px solid #e0e7ff' : '1px solid #a7f3d0'
                                            }}>
                                                {pkg.status}
                                            </span>
                                            
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                                                {pkg.id}
                                            </span>
                                        </div>

                                        {/* 收件資訊 */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                            <User size={18} color="#64748b" />
                                            <strong style={{ fontSize: '1.1rem', color: '#334155' }}>
                                                {pkg.household} ─ {pkg.recipient}
                                            </strong>
                                        </div>

                                        <div style={{ 
                                            backgroundColor: '#f8fafc', 
                                            borderRadius: '8px', 
                                            padding: '12px', 
                                            marginBottom: '16px',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                                                <Truck size={14} color="#6366f1" />
                                                <span>物流公司：<strong>{pkg.carrier}</strong></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                                                <Info size={14} color="#6366f1" />
                                                <span>單號：<code>{pkg.trackingNumber}</code></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                                                <Package size={14} color="#6366f1" />
                                                <span>描述：{pkg.desc}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 底部時間與取件按鈕 */}
                                    <div style={{ 
                                        borderTop: '1px solid #f1f5f9', 
                                        paddingTop: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                <span>到件：{pkg.arrivalTime}</span>
                                            </div>
                                            {!isPending && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>領取：{pkg.signTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        {isPending && (
                                            <button
                                                onClick={() => setSelectedPackage(pkg)}
                                                className="btn interactive"
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#6366f1',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
                                                }}
                                            >
                                                <QrCode size={16} />
                                                <span>取件條碼</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* 快速取件二維碼 Modal */}
            <Modal
                isOpen={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
                title="管理室快速取件二維碼"
            >
                {selectedPackage && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#1e293b' }}>
                        <div style={{
                            border: '1px solid #e2e8f0',
                            padding: '16px',
                            borderRadius: '16px',
                            backgroundColor: '#FFFFFF',
                            marginBottom: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <QrCode size={160} color="#334155" />
                        </div>
                        
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '800', color: '#4f46e5' }}>
                            {selectedPackage.household} ─ {selectedPackage.recipient}
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b' }}>
                            到件物流：{selectedPackage.carrier} ({selectedPackage.trackingNumber})
                        </p>
                        
                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            width: '100%',
                            fontSize: '0.85rem',
                            lineHeight: '1.6',
                            border: '1px solid #e2e8f0',
                            marginBottom: '24px',
                            boxSizing: 'border-box'
                        }}>
                            <strong>取件說明：</strong>
                            <ol style={{ margin: '4px 0 0 0', paddingLeft: '20px', color: '#475569' }}>
                                <li>請將此 QR Code 出示給管理小組或保全人員。</li>
                                <li>管理員掃描後即會從後端登記簽收，完成領取手續。</li>
                                <li>此 QR Code 每隔 60 秒會動態更新以保障資訊安全。</li>
                            </ol>
                        </div>
                        
                        <button
                            onClick={() => setSelectedPackage(null)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#6366f1',
                                color: '#FFFFFF',
                                fontWeight: '750',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
                            }}
                        >
                            關閉視窗
                        </button>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default PackagePage;
