import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Info } from 'lucide-react';

const QuoteVotePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItems = location.state?.selectedItems || [];

  const handlePrint = () => {
    window.print();
  };

  if (selectedItems.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px' }}>
          <Info size={48} style={{ color: 'var(--primary-color)', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>無勾選的項目</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>請先在詢價管理頁面勾選狀態為「新單」的項目再行跳轉。</p>
          <button onClick={() => navigate('/admin/inquiry')} className="btn btn-primary">返回詢價管理</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* 正常瀏覽模式下的頂部控制列 (列印時隱藏) */}
      <header className="no-print" style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 0',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/admin/inquiry')} className="btn btn-secondary" style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> 返回詢價
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>投票單彙整與列印預覽</h2>
          </div>
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Printer size={18} /> 匯出 / 列印投票單 ({selectedItems.length} 份)
          </button>
        </div>
      </header>

      {/* 內容區 */}
      <main className="container" style={{ maxWidth: '850px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* 瀏覽模式下的說明提示 */}
        <div className="no-print card" style={{
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid var(--primary-color)',
          marginBottom: '30px',
          padding: '16px 20px',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> 列印提示 (另存為 PDF)
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.5', margin: 0 }}>
            點擊「匯出 / 列印投票單」按鈕，系統將自動開啟瀏覽器的列印對話框。您可以選擇將印表機設為<strong>「另存為 PDF」</strong>或直接輸出至實體印表機。每個詢價項目將自動排版為**獨立的一頁 A4 投票單**。
          </p>
        </div>

        {/* 投票單列印內容區域 */}
        <div id="print-area">
          {selectedItems.map((item, index) => {
            const hasQuotes = item.quotes && item.quotes.length > 0;
            return (
              <div 
                key={item.id} 
                className="print-page-card" 
                style={{
                  backgroundColor: '#ffffff',
                  padding: '40px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '40px',
                  position: 'relative'
                }}
              >
                {/* 投票單標頭 */}
                <div style={{ textAlign: 'center', borderBottom: '3px double #000000', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '2px', color: '#000000', margin: '0 0 8px 0' }}>
                    社區工程項目決策記名投票單
                  </h1>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginTop: '10px' }}>
                    <span>詢價單號：{item.id}</span>
                    <span>發起日期：{item.startDate}</span>
                  </div>
                </div>

                {/* 詢價工程名稱 */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000000', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px' }}>
                    工程項目名稱
                  </h3>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: 0, padding: '4px 0' }}>
                    {item.title}
                  </p>
                </div>

                {/* 報價廠商比價表 */}
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000000', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
                    報價廠商比價表
                  </h3>
                  {!hasQuotes ? (
                    <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                      此詢價項目目前尚無登錄報價廠商資訊。
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '0.95rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #000000' }}>
                          <th style={{ padding: '10px 12px', border: '1px solid #000000', textAlign: 'left', fontWeight: '700' }}>報價廠商</th>
                          <th style={{ padding: '10px 12px', border: '1px solid #000000', textAlign: 'left', fontWeight: '700' }}>聯絡電話</th>
                          <th style={{ padding: '10px 12px', border: '1px solid #000000', textAlign: 'right', fontWeight: '700' }}>報價金額 (NTD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.quotes.map((quote) => (
                          <tr key={quote.id} style={{ borderBottom: '1px solid #000000' }}>
                            <td style={{ padding: '10px 12px', border: '1px solid #000000', fontWeight: '600' }}>{quote.vendorName}</td>
                            <td style={{ padding: '10px 12px', border: '1px solid #000000' }}>{quote.vendorPhone || '無'}</td>
                            <td style={{ padding: '10px 12px', border: '1px solid #000000', textAlign: 'right', fontWeight: '700' }}>
                              ${Number(quote.quoteAmount).toLocaleString()} 元
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 決策投票欄位 */}
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000000', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '16px' }}>
                    投票決策選項 (請勾選一項)
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '10px' }}>
                    
                    {/* 選項一：實施並選擇廠商 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
                        <span style={{ display: 'inline-block', width: '22px', height: '22px', border: '2px solid #000000', textAlign: 'center', lineHeight: '18px', marginRight: '6px' }}></span>
                        同意實施此工程項目，並選擇委託得標廠商：
                      </div>
                      
                      {/* 列出各廠商選項讓投票者能打勾選某廠商 */}
                      {hasQuotes && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '38px' }}>
                          {item.quotes.map((quote) => (
                            <div key={quote.id} style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem' }}>
                              <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '1px solid #000000', marginRight: '8px' }}></span>
                              {quote.vendorName} (${Number(quote.quoteAmount).toLocaleString()} 元)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 選項二：不實施 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600', marginTop: '6px' }}>
                      <span style={{ display: 'inline-block', width: '22px', height: '22px', border: '2px solid #000000', textAlign: 'center', lineHeight: '18px', marginRight: '6px' }}></span>
                      不同意實施此工程（計畫終止）
                    </div>

                  </div>
                </div>

                {/* 記名簽字處 */}
                <div style={{
                  borderTop: '2px dashed #94a3b8',
                  paddingTop: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr',
                  gap: '20px',
                  marginTop: '40px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.05rem', fontWeight: '700' }}>
                    投票人姓名 (手寫簽名)：_____________________________
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.05rem', fontWeight: '700', justifyContent: 'flex-end' }}>
                    投票日期：民國 ______ 年 ____ 月 ____ 日
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* 列印專用的 CSS CSS @media print */}
      <style>{`
        @media print {
          /* 隱藏網頁按鈕與 header */
          .no-print {
            display: none !important;
          }
          /* 背景色設為白色 */
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* 讓列印區域滿版 */
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area {
            width: 100% !important;
          }
          /* 投票單樣式：移除圓角與陰影，加框線，並控制分頁 */
          .print-page-card {
            border: none !important;
            box-shadow: none !important;
            padding: 20px 10px !important;
            margin-bottom: 0 !important;
            page-break-after: always !important; /* 強制分頁 */
            page-break-inside: avoid !important;
            height: auto !important;
          }
          /* 最後一頁避免留白頁 */
          .print-page-card:last-child {
            page-break-after: avoid !important;
          }
        }
      `}</style>

    </div>
  );
};

export default QuoteVotePage;
