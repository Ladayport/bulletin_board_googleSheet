import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Modal from '../components/ui/Modal';
import { 
    CalendarClock, 
    Sparkles, 
    BookOpen, 
    Music, 
    Users, 
    Compass, 
    Check, 
    QrCode, 
    Clock, 
    Info
} from 'lucide-react';

const BookingPage = () => {
    // 社區公設清單
    const amenities = [
        {
            id: 'ktv',
            name: '豪華 KTV 視聽室',
            icon: <Music size={24} />,
            description: '配備專業音響設備、觸控點歌機與舒適沙發，最多可容納 12 人。',
            fee: '50點點數 / 小時',
            location: '社區會館 2 樓'
        },
        {
            id: 'table-tennis',
            name: '多功能桌球撞球室',
            icon: <Compass size={24} />,
            description: '提供國際標準桌球桌與撞球檯，球具可向管理室借用。',
            fee: '免點數 (需登記)',
            location: '社區會館 1 樓'
        },
        {
            id: 'yoga',
            name: '陽光韻律舞蹈教室',
            icon: <Users size={24} />,
            description: '全木質地板配合整面落地鏡，適合瑜珈、韻律操或舞蹈練習。',
            fee: '免點數 (需登記)',
            location: '社區會館 B1 樓'
        },
        {
            id: 'bbq',
            name: '星空頂樓烤肉區',
            icon: <Sparkles size={24} />,
            description: '備有美式專業烤肉爐、洗手台與戶外休閒桌椅，盡覽社區夜景。',
            fee: '100點點數 / 場次',
            location: 'A棟頂樓空中花園'
        }
    ];

    const [selectedAmenity, setSelectedAmenity] = useState(amenities[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // 表單
    const [formData, setFormData] = useState({
        household: '',
        name: '',
        phone: ''
    });

    // Mock 該設施今日的時段預約狀態
    const timeSlots = [
        { time: '09:00 - 11:00', status: '已預約', bookedBy: '5F-2 廖小姐' },
        { time: '11:00 - 13:00', status: '可預約', bookedBy: null },
        { time: '13:00 - 15:00', status: '可預約', bookedBy: null },
        { time: '15:00 - 17:00', status: '已預約', bookedBy: 'B棟12F 陳先生' },
        { time: '17:00 - 19:00', status: '可預約', bookedBy: null },
        { time: '19:00 - 21:00', status: '可預約', bookedBy: null },
        { time: '21:00 - 23:00', status: '已預約', bookedBy: '10F-1 許小姐' }
    ];

    const handleAmenityChange = (amenity) => {
        setSelectedAmenity(amenity);
        setSelectedTimeSlot(null); // 重設選取時段
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!selectedTimeSlot) {
            alert('請先選取一個預約時段');
            return;
        }
        
        setSubmitting(true);
        // 模擬發送預約 API
        setTimeout(() => {
            setSubmitting(false);
            setIsSuccessOpen(true);
        }, 1200);
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區公設預約系統" />
            
            <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* 頂部 Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.3)'
                }}>
                    <CalendarClock size={48} style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>公共設施線上預約</h2>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                        線上預訂社區休閒公設，省去親自前往管理室的時間。請選取您要使用的設施、日期及時段，輕鬆完成預約登記。
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '32px',
                    alignItems: 'start'
                }}>
                    {/* 左側：公設項目清單 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>
                            選擇預約公設
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {amenities.map((item) => {
                                const isSelected = selectedAmenity.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleAmenityChange(item)}
                                        className="card interactive"
                                        style={{
                                            border: isSelected ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            backgroundColor: isSelected ? '#f0fdfa' : '#FFFFFF',
                                            boxShadow: isSelected ? '0 10px 15px -3px rgba(20, 184, 166, 0.1)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                                            <div style={{
                                                backgroundColor: isSelected ? '#14b8a6' : '#f1f5f9',
                                                color: isSelected ? '#FFFFFF' : '#64748b',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                transition: 'all 0.2s'
                                            }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 style={{ 
                                                    margin: '0 0 6px 0', 
                                                    fontSize: '1.05rem', 
                                                    fontWeight: '750', 
                                                    color: isSelected ? '#0f766e' : '#1e293b' 
                                                }}>
                                                    {item.name}
                                                </h4>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                                                    {item.description}
                                                </p>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>
                                                    <span style={{ color: '#14b8a6' }}>{item.location}</span>
                                                    <span>•</span>
                                                    <span>收費: {item.fee}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 右側：時段預約與表單 */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>
                            預約時段與填寫資料
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0' }}>
                            當前設施：<strong style={{ color: '#14b8a6' }}>{selectedAmenity.name}</strong>
                        </p>

                        <form onSubmit={handleFormSubmit}>
                            {/* 時段網格 */}
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                選擇本日使用時段 (2026-06-26) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                                gap: '10px',
                                marginBottom: '24px' 
                            }}>
                                {timeSlots.map((slot, index) => {
                                    const isBooked = slot.status === '已預約';
                                    const isSelected = selectedTimeSlot === slot.time;
                                    
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => setSelectedTimeSlot(slot.time)}
                                            style={{
                                                padding: '12px 8px',
                                                borderRadius: '10px',
                                                border: isSelected 
                                                    ? '2px solid #14b8a6' 
                                                    : isBooked ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
                                                backgroundColor: isSelected 
                                                    ? '#14b8a6' 
                                                    : isBooked ? '#f1f5f9' : '#FFFFFF',
                                                color: isSelected 
                                                    ? '#FFFFFF' 
                                                    : isBooked ? '#94a3b8' : '#334155',
                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{slot.time}</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                color: isSelected ? '#ffffff' : isBooked ? '#94a3b8' : '#14b8a6',
                                                fontWeight: '600'
                                            }}>
                                                {isBooked ? `已訂 (${slot.bookedBy})` : '可預約'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 預約人戶別 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    住戶戶別 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input 
                                    type="text"
                                    placeholder="例如：A棟 12樓-3"
                                    value={formData.household}
                                    onChange={(e) => setFormData({...formData, household: e.target.value})}
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

                            {/* 姓名 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    預約人姓名 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input 
                                    type="text"
                                    placeholder="預約代表姓名"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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

                            {/* 電話 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                    聯絡電話 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input 
                                    type="tel"
                                    placeholder="例如：0912-345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    backgroundColor: submitting ? '#99f6e4' : '#14b8a6',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px rgba(20, 184, 166, 0.2)',
                                    transition: 'background-color 0.2s, transform 0.1s'
                                }}
                                onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {submitting ? '預約單送出中...' : '送出線上預約'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* 成功彈出視窗 */}
            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="預約成功"
            >
                <div style={{ padding: '10px 0', color: '#1e293b' }}>
                    {/* 仿真電子票券 */}
                    <div style={{
                        border: '2px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        backgroundColor: '#fafafa',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        marginBottom: '24px'
                    }}>
                        {/* 票券頭部 */}
                        <div style={{
                            backgroundColor: '#14b8a6',
                            color: '#FFFFFF',
                            padding: '16px',
                            textAlign: 'center',
                        }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>社區公共設施通行證</h4>
                            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>STATUS: APPROVED</span>
                        </div>
                        
                        {/* 票券內容 */}
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                border: '1px solid #e2e8f0',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: '#FFFFFF',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <QrCode size={130} color="#1e293b" />
                            </div>
                            
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f766e', fontWeight: '700' }}>
                                {selectedAmenity?.name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
                                憑此二維碼前往現場核銷使用
                            </div>

                            <div style={{ width: '100%', fontSize: '0.9rem', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>預約時段</span>
                                    <strong style={{ color: '#334155' }}>今日 {selectedTimeSlot}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>使用地點</span>
                                    <strong style={{ color: '#334155' }}>{selectedAmenity?.location}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>預約戶別</span>
                                    <strong style={{ color: '#334155' }}>{formData.household}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>使用人</span>
                                    <strong style={{ color: '#334155' }}>{formData.name} 先生/小姐</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => {
                                alert('已儲存通行證截圖至手機相簿 (Mock)');
                                setIsSuccessOpen(false);
                            }}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #14b8a6',
                                backgroundColor: '#FFFFFF',
                                color: '#14b8a6',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            儲存通行證
                        </button>
                        <button
                            onClick={() => setIsSuccessOpen(false)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#14b8a6',
                                color: '#FFFFFF',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(20, 184, 166, 0.2)'
                            }}
                        >
                            確認並離開
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
};

export default BookingPage;
