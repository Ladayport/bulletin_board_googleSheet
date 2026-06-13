import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Search, Info } from 'lucide-react';
import { api } from '../services/api';
import LoadingOverlay from '../components/ui/LoadingOverlay';

const InquiryViewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  
  // 搜尋與篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.getInquiries();
      if (response.success) {
        setInquiries(response.inquiries || []);
      } else {
        alert('載入詢價資料失敗：' + response.message);
      }
    } catch (e) {
      console.error(e);
      alert('網路請求失敗，請確認後端部署與連線狀態');
    } finally {
      setLoading(false);
    }
  };

  // 過濾與搜尋處理
  const filteredInquiries = inquiries.filter(item => {
    // 1. 狀態篩選
    if (statusFilter !== '全部' && item.status !== statusFilter) {
      return false;
    }
    
    // 2. 關鍵字搜尋 (項目名稱、單號、發起人)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const matchTitle = item.title?.toLowerCase().includes(query);
      const matchId = item.id?.toLowerCase().includes(query);
      const matchInitiator = item.initiator?.toLowerCase().includes(query);
      return matchTitle || matchId || matchInitiator;
    }
    
    return true;
  });

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '60px' }}>
      <LoadingOverlay show={loading} message="載入資料中，請稍候..." />
      
      {/* 頂部導覽列 */}
      <header style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '20px 0',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '30px'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/category/engineering')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>工程項目詢價比價歷程 (唯讀)</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>提供社區大眾公開查詢比價資訊，本畫面不開放任何編輯權限</p>
          </div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 搜尋與篩選工具列 */}
        <div className="card" style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* 狀態過濾選項 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['全部', '新單', '詢價', '計畫終止', '結案'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  backgroundColor: statusFilter === status ? 'var(--primary-color)' : '#ffffff',
                  color: statusFilter === status ? '#ffffff' : 'var(--text-color)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* 搜尋輸入框 */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%', boxSizing: 'border-box' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="搜尋項目名稱、單號或發起人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box', // 修正 padding 導致的寬度溢出跑版
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* 主要唯讀詢價表格 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          {filteredInquiries.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>無符合條件的詢價歷程資料</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', width: '150px' }}>單號</th>
                    <th style={{ padding: '16px 20px' }}>工程詢價項目名稱</th>
                    <th style={{ padding: '16px 20px', width: '150px' }}>發起日期</th>
                    <th style={{ padding: '16px 20px', width: '120px' }}>發起人</th>
                    <th style={{ padding: '16px 20px', width: '130px' }}>項目狀態</th>
                    <th style={{ padding: '16px 20px', width: '120px', textAlign: 'center' }}>報價廠商數</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((item) => {
                    const isExpanded = expandedInquiryId === item.id;
                    const hasQuotes = item.quotes && item.quotes.length > 0;
                    return (
                      <>
                        {/* 主項目列 */}
                        <tr
                          key={item.id}
                          onClick={() => setExpandedInquiryId(isExpanded ? null : item.id)}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? '#f0f9ff' : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                          className="hover-bg-light"
                        >
                          <td style={{ padding: '16px 20px', fontWeight: '600', color: '#64748b' }}>
                            {item.id}
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              {item.title}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.startDate}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.initiator}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              backgroundColor: 
                                item.status === '新單' ? '#eff6ff' :
                                item.status === '詢價' ? '#fef3c7' :
                                item.status === '計畫終止' ? '#fee2e2' : '#dcfce7',
                              color: 
                                item.status === '新單' ? '#1e40af' :
                                item.status === '詢價' ? '#d97706' :
                                item.status === '計畫終止' ? '#b91c1c' : '#15803d'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', color: hasQuotes ? 'var(--primary-color)' : '#94a3b8' }}>
                            {item.quotes.length} 筆
                          </td>
                        </tr>

                        {/* 展開之報價廠商明細 */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="6" style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>
                                報價廠商比價明細
                              </h4>
                              {!hasQuotes ? (
                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', color: '#64748b' }}>
                                  目前尚無任何廠商的報價歷史記錄。
                                </div>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                      <th style={{ padding: '10px 12px' }}>報價廠商</th>
                                      <th style={{ padding: '10px 12px' }}>聯絡電話</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>報價金額 (NTD)</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>估價附件</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.quotes.map((quote) => (
                                      <tr key={quote.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: '600' }}>{quote.vendorName}</td>
                                        <td style={{ padding: '10px 12px' }}>{quote.vendorPhone || '無'}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#0f766e' }}>
                                          ${Number(quote.quoteAmount).toLocaleString()} 元
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                          {quote.fileUrl ? (
                                            <a
                                              href={quote.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                color: 'var(--primary-color)',
                                                textDecoration: 'none',
                                                fontWeight: '600'
                                              }}
                                            >
                                              <FileText size={14} /> 檢視估價單
                                            </a>
                                          ) : (
                                            <span style={{ color: '#94a3b8' }}>無附件</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InquiryViewPage;
