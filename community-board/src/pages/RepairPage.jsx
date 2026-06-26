import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Modal from '../components/ui/Modal';
import { 
    Wrench, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    User, 
    Phone, 
    MapPin, 
    FileText, 
    Image as ImageIcon,
    Send
} from 'lucide-react';

const RepairPage = () => {
    // 表單狀態
    const [formData, setFormData] = useState({
        category: '水電設備',
        location: '',
        description: '',
        reporter: '',
        phone: ''
    });
    
    // 歷史紀錄狀態 (Mock)
    const [repairs, setRepairs] = useState([
        {
            id: 'REP-2026001',
            category: '電梯設備',
            location: 'B棟客梯',
            description: '電梯運行時有明顯異音，且關門速度過慢。',
            reporter: '王大明',
            phone: '0912-345678',
            status: '處理中',
            date: '2026-06-25',
            engineer: '大同電梯-林技師',
            notes: '已安排 6/27 上午進行鋼索與控制盤檢修。'
        },
        {
            id: 'REP-2026002',
            category: '照明設備',
            location: '地下二樓停車場 D區',
            description: '編號 D12 與 D13 停車格上方 LED 燈管閃爍不亮。',
            reporter: '陳小美',
            phone: '0928-111222',
            status: '待處理',
            date: '2026-06-26',
            engineer: '社區機電組',
            notes: '已登錄報修單，安排下週一統一更換燈管。'
        },
        {
            id: 'REP-2026003',
            category: '公共設施',
            location: '一樓中庭花園',
            description: '中庭木質座椅踏板有些微鬆動危險，需加固。',
            reporter: '張管理員',
            phone: '0933-777888',
            status: '已結案',
            date: '2026-06-20',
            engineer: '修繕工程部',
            notes: '已於 6/22 派員完成螺絲加固，現場測試穩固安全。'
        }
    ]);

    const [selectedRepair, setSelectedRepair] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.location || !formData.description || !formData.reporter || !formData.phone) {
            alert('請填寫所有必要欄位');
            return;
        }
        
        setSubmitting(true);
        
        // 模擬送出 API
        setTimeout(() => {
            const newRepair = {
                id: `REP-2026${String(repairs.length + 1).padStart(3, '0')}`,
                category: formData.category,
                location: formData.location,
                description: formData.description,
                reporter: formData.reporter,
                phone: formData.phone,
                status: '待處理',
                date: new Date().toISOString().split('T')[0],
                engineer: '待指派',
                notes: '修繕單已成立，正等待機電組排程處理。'
            };
            
            setRepairs([newRepair, ...repairs]);
            setSubmitting(false);
            setIsSuccessModalOpen(true);
            
            // 重設表單
            setFormData({
                category: '水電設備',
                location: '',
                description: '',
                reporter: '',
                phone: ''
            });
        }, 1200);
    };

    // 取得狀態標籤樣式
    const getStatusStyle = (status) => {
        switch(status) {
            case '待處理':
                return { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' };
            case '處理中':
                return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
            case '已結案':
                return { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' };
            default:
                return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區線上報修系統" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部主題橫幅 */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                }}>
                    <Wrench size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>公共設施線上修繕申報</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        若您發現社區中庭、電梯、走廊、大廳等公設有任何損壞，歡迎在此提交報修，系統將即時通知機電人員前往修繕。
                    </p>
                </div>

                {/* 報修進度儀表板 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '12px' }}>
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>待處理案件</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b' }}>
                                {repairs.filter(r => r.status === '待處理').length} 件
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '12px' }}>
                            <Clock size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>處理中案件</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b' }}>
                                {repairs.filter(r => r.status === '處理中').length} 件
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '12px' }}>
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>已完成修繕</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b' }}>
                                {repairs.filter(r => r.status === '已結案').length} 件
                            </div>
                        </div>
                    </div>
                </div>

                {/* 報修表單與歷史清單網格 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '32px'
                }}>
                    {/* 報修表單卡片 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                        height: 'fit-content'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={20} color="var(--primary-color)" />
                            填寫報修單
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            {/* 分類選擇 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    報修項目類別
                                </label>
                                <select 
                                    name="category"
                                    value={formData.category}
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
                                    <option value="水電設備">水電設備 (路燈、抽水馬達、公共照明等)</option>
                                    <option value="電梯設備">電梯設備 (客梯、貨梯、電梯內面板等)</option>
                                    <option value="公共設施">公共設施 (健身房、遊戲區、座椅、中庭等)</option>
                                    <option value="安全消防">安全消防 (滅火器、消防栓、監控監視器等)</option>
                                    <option value="其他">其他損壞項目</option>
                                </select>
                            </div>

                            {/* 損壞位置 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    故障詳細位置 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                    <input 
                                        type="text"
                                        name="location"
                                        placeholder="例如：A棟電梯旁通道、地下二樓25號車位旁"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
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

                            {/* 問題描述 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    狀況描述 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea 
                                    name="description"
                                    placeholder="請具體說明故障情況..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* 報修人 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    申報人姓名 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                    <input 
                                        type="text"
                                        name="reporter"
                                        placeholder="您的姓名"
                                        value={formData.reporter}
                                        onChange={handleInputChange}
                                        required
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

                            {/* 聯絡電話 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    聯絡電話 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                    <input 
                                        type="tel"
                                        name="phone"
                                        placeholder="例如：0912-345678"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
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

                            {/* 圖片拖曳上傳 Mock 區 */}
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                marginBottom: '24px',
                                backgroundColor: '#f8fafc',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                            >
                                <ImageIcon size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                                    拖曳相片至此，或點擊上傳
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    支援 JPG、PNG 格式，檔案大小不超過 5MB
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    backgroundColor: submitting ? '#93c5fd' : 'var(--primary-color)',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                                    transition: 'transform 0.1s, background-color 0.2s',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {submitting ? '申報送出中...' : '送出報修單'}
                            </button>
                        </form>
                    </div>

                    {/* 歷史報修清單卡片 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="var(--primary-color)" />
                            近期報修清單
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {repairs.map((repair) => {
                                const statusStyle = getStatusStyle(repair.status);
                                return (
                                    <div
                                        key={repair.id}
                                        onClick={() => setSelectedRepair(repair)}
                                        className="card interactive"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            backgroundColor: '#f8fafc'
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
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{repair.id}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.border}`,
                                                fontWeight: '600'
                                            }}>
                                                {repair.status}
                                            </span>
                                        </div>
                                        
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>
                                            {repair.category}
                                        </h4>
                                        
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                                            <MapPin size={14} />
                                            <span>{repair.location}</span>
                                        </div>
                                        
                                        <p style={{
                                            margin: '0 0 12px 0',
                                            fontSize: '0.9rem',
                                            color: '#475569',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: '1.4'
                                        }}>
                                            {repair.description}
                                        </p>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                            <span>申報人: {repair.reporter}</span>
                                            <span>{repair.date}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* 報修詳細資訊 Modal */}
            <Modal
                isOpen={!!selectedRepair}
                onClose={() => setSelectedRepair(null)}
                title={selectedRepair ? `修繕申報單：${selectedRepair.id}` : '報修詳情'}
            >
                {selectedRepair && (
                    <div style={{ color: '#1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary-color)', fontWeight: '700' }}>
                                {selectedRepair.category}
                            </h3>
                            <span style={{
                                fontSize: '0.85rem',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                backgroundColor: getStatusStyle(selectedRepair.status).bg,
                                color: getStatusStyle(selectedRepair.status).text,
                                border: `1px solid ${getStatusStyle(selectedRepair.status).border}`,
                                fontWeight: '700'
                            }}>
                                {selectedRepair.status}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                <MapPin size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>故障地點</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{selectedRepair.location}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                <FileText size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>故障說明</div>
                                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedRepair.description}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                    <User size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>申報人</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{selectedRepair.reporter}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                    <Phone size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>聯絡電話</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{selectedRepair.phone}</div>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                <Wrench size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>處理人員 / 廠商</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedRepair.engineer}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                <Clock size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>處置與備註</div>
                                    <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>{selectedRepair.notes}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedRepair(null)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                            >
                                關閉視窗
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 成功彈出視窗 */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="申報成功"
            >
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#1e293b' }}>
                    <div style={{
                        display: 'inline-flex',
                        backgroundColor: '#d1fae5',
                        color: '#059669',
                        padding: '16px',
                        borderRadius: '50%',
                        marginBottom: '16px'
                    }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '700' }}>報修單提交成功！</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                        您的申報已成功送出，系統已將單據發送至機電組。您可以於右側「近期報修清單」中查看處理狀態。
                    </p>
                    <button
                        onClick={() => setIsSuccessModalOpen(false)}
                        style={{
                            padding: '10px 32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary-color)',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        我知道了
                    </button>
                </div>
            </Modal>

            <Footer />
        </div>
    );
};

export default RepairPage;
