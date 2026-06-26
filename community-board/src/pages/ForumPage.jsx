import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    MessageSquare, 
    Sparkles, 
    ShoppingBag, 
    Heart, 
    Megaphone,
    Mail,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

const ForumPage = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [progress, setProgress] = useState(0);

    // 模擬進度條載入動畫 (從 0 跑到 85)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (progress < 85) {
                setProgress(prev => prev + 5);
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [progress]);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;
        
        // 模擬訂閱送出
        setTimeout(() => {
            setSubscribed(true);
            setEmail('');
        }, 800);
    };

    return (
        <div style={{ 
            backgroundColor: '#0f172a', // 深色科技感背景
            color: '#f8fafc',
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            {/* 這裡的 Header 原本是亮色，為了配合深色背景，我們用一個簡單的容器覆蓋其背景，或者自己實現一個適配深色系的主標題列 */}
            <div style={{ borderBottom: '1px solid #1e293b' }}>
                <Header title="社區住戶交流討論區" />
            </div>
            
            <main style={{ 
                flex: 1, 
                padding: '48px 16px', 
                maxWidth: '1000px', 
                margin: '0 auto', 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* 炫光霓虹背景點綴 */}
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* 主 Coming Soon 面板 */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(30, 41, 59, 0.45)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '48px 32px',
                    textAlign: 'center',
                    maxWidth: '750px',
                    width: '100%',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    marginBottom: '48px'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        marginBottom: '24px'
                    }}>
                        <Sparkles size={14} />
                        <span>全新功能・籌備中</span>
                    </div>

                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        margin: '0 0 16px 0', 
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #ffffff 30%, #a7f3d0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        住戶交流論壇 即將登場
                    </h2>
                    
                    <p style={{ 
                        color: '#94a3b8', 
                        fontSize: '1.05rem', 
                        lineHeight: '1.7', 
                        maxWidth: '550px', 
                        margin: '0 auto 36px auto' 
                    }}>
                        這是一個專屬於我們社區的線上客廳。無論是尋求鄰里協助、分享周邊生活好康，或是閒置好物出清交易，都能在此輕鬆交流！
                    </p>

                    {/* 進度條 */}
                    <div style={{ maxWidth: '450px', margin: '0 auto 40px auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>
                            <span>系統開發進度</span>
                            <span style={{ color: '#34d399' }}>{progress}%</span>
                        </div>
                        <div style={{
                            height: '10px',
                            backgroundColor: '#1e293b',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #34d399)',
                                borderRadius: '10px',
                                transition: 'width 0.4s ease-out',
                                boxShadow: '0 0 10px rgba(52, 211, 153, 0.5)'
                            }} />
                        </div>
                    </div>

                    {/* 訂閱區 */}
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        {subscribed ? (
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                padding: '16px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                color: '#34d399',
                                fontWeight: '600'
                            }}>
                                <CheckCircle size={20} />
                                <span>感謝訂閱！上線時我們將第一時間通知您。</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '15px' }} />
                                    <input 
                                        type="email"
                                        placeholder="輸入您的 Email 以獲取上線通知..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px 14px 44px',
                                            borderRadius: '12px',
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #334155',
                                            color: '#ffffff',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#10b981';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#334155';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0 24px',
                                        borderRadius: '12px',
                                        backgroundColor: '#10b981',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s, transform 0.1s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <span>訂閱通知</span>
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* 未來功能預覽卡片 */}
                <h3 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: '700', 
                    marginBottom: '24px', 
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <MessageSquare size={22} color="#10b981" />
                    三大特色功能版塊預覽
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    marginBottom: '32px'
                }}>
                    {/* 卡片 1 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'inline-flex',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <ShoppingBag size={24} />
                        </div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>鄰里跳蚤市場</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            提供住戶刊登閒置二手物品（如書籍、嬰兒用品、家具）的出清、贈送或交換資訊，讓資源循環利用，促進鄰里環保。
                        </p>
                    </div>

                    {/* 卡片 2 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'inline-flex',
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            color: '#fb7185',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <Heart size={24} />
                        </div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>社區生活大小事</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            討論社區周邊美食、推薦可靠的裝修水電行，或是揪團團購優質農產品。讓大家的生活經驗轉化為互助的溫暖力量。
                        </p>
                    </div>

                    {/* 卡片 3 */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'inline-flex',
                            backgroundColor: 'rgba(234, 179, 8, 0.1)',
                            color: '#facc15',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <Megaphone size={24} />
                        </div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>提案連署意見箱</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            對於公設改善或管理費運用有更好的點子？住戶可在此發起提議與投票，累積一定連署數後，系統將直接呈報給管委會參考。
                        </p>
                    </div>
                </div>
            </main>

            {/* 社區討論區有它專屬的深色 Footer 或是使用原版 */}
            <div style={{ borderTop: '1px solid #1e293b' }}>
                <Footer />
            </div>
        </div>
    );
};

export default ForumPage;
