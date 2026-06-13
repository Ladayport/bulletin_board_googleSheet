import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, FileText, Trash2, Check, Send, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { authService } from '../../services/auth';
import { compressImage, fileToBase64 } from '../../utils/imageUtils';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Modal from '../../components/ui/Modal';

const QuoteInquiryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('載入資料中，請稍候...');
  const [inquiries, setInquiries] = useState([]);
  
  // 篩選與勾選狀態
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedInquiryIds, setSelectedInquiryIds] = useState([]);
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  // 新增詢價項目 Modal 狀態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    initiator: authService.getUser()?.name || '管理員'
  });

  // 新增報價表單狀態 (各項目獨立)
  const [quoteForm, setQuoteForm] = useState({
    vendorName: '',
    vendorPhone: '',
    quoteAmount: '',
    file: null,
    fileName: '',
    fileType: '',
    fileData: ''
  });
  const [quotePreview, setQuotePreview] = useState(null);

  // 發起工程選擇廠商 Modal 狀態
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchInquiry, setLaunchInquiry] = useState(null);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setLoadingMessage('正在載入工程詢價資料，請稍候...');
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

  // 處理新增詢價
  const handleAddInquiry = async (e) => {
    e.preventDefault();
    if (!addForm.title) return alert('請輸入詢價工程項目名稱');
    
    setLoading(true);
    setLoadingMessage('正在建立詢價項目，請稍候...');
    try {
      const response = await api.addInquiry({
        title: addForm.title,
        startDate: addForm.startDate,
        initiator: addForm.initiator,
        operator: authService.getUser()?.name || 'Admin'
      });
      if (response.success) {
        setIsAddModalOpen(false);
        setAddForm({
          title: '',
          startDate: new Date().toISOString().split('T')[0],
          initiator: authService.getUser()?.name || '管理員'
        });
        fetchInquiries();
      } else {
        alert('新增失敗：' + response.message);
      }
    } catch (err) {
      console.error(err);
      alert('新增詢價項目出錯');
    } finally {
      setLoading(false);
    }
  };

  // 處理檔案選擇與壓縮
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('只支援 JPG, PNG 圖片或 PDF 文件');
      return;
    }

    try {
      let processedFile = file;
      let base64 = '';

      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        setQuotePreview(URL.createObjectURL(processedFile));
      } else {
        setQuotePreview(null);
      }

      base64 = await fileToBase64(processedFile);

      setQuoteForm(prev => ({
        ...prev,
        file: processedFile,
        fileName: file.name,
        fileType: file.type,
        fileData: base64
      }));
    } catch (err) {
      console.error('檔案處理失敗', err);
      alert('檔案處理失敗');
    }
  };

  // 處理新增廠商報價
  const handleAddQuote = async (e, inquiryId) => {
    e.preventDefault();
    if (!quoteForm.vendorName || !quoteForm.quoteAmount) {
      return alert('請填寫廠商名稱與報價金額');
    }

    setLoading(true);
    setLoadingMessage('正在上傳報價資訊與檔案，請稍候...');
    try {
      const response = await api.addQuote({
        inquiryId,
        vendorName: quoteForm.vendorName,
        vendorPhone: quoteForm.vendorPhone,
        quoteAmount: Number(quoteForm.quoteAmount),
        fileData: quoteForm.fileData,
        fileName: quoteForm.fileName,
        fileType: quoteForm.fileType,
        operator: authService.getUser()?.name || 'Admin'
      });

      if (response.success) {
        // 檢查當前項目狀態是否為「新單」，如果是，則在成功新增報價後，自動將其狀態修改為「詢價」
        const currentInquiry = inquiries.find(item => item.id === inquiryId);
        if (currentInquiry && currentInquiry.status === '新單') {
          await api.updateInquiryStatus(inquiryId, '詢價', authService.getUser()?.name || 'Admin');
        }

        // 重設報價表單
        setQuoteForm({
          vendorName: '',
          vendorPhone: '',
          quoteAmount: '',
          file: null,
          fileName: '',
          fileType: '',
          fileData: ''
        });
        setQuotePreview(null);
        fetchInquiries();
      } else {
        alert('新增報價失敗：' + response.message);
      }
    } catch (err) {
      console.error(err);
      alert('上傳報價出錯');
    } finally {
      setLoading(false);
    }
  };

  // 處理狀態更新
  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    setLoadingMessage('正在更新項目狀態...');
    try {
      const response = await api.updateInquiryStatus(id, newStatus, authService.getUser()?.name || 'Admin');
      if (response.success) {
        fetchInquiries();
      } else {
        alert('狀態更新失敗：' + response.message);
      }
    } catch (err) {
      console.error(err);
      alert('狀態更新出錯');
    } finally {
      setLoading(false);
    }
  };

  // 處理刪除詢價 (變更為強制結案並隱藏)
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('確定要將此工程詢價項目「強制結案」嗎？強制結案後此項目將會從畫面上隱藏。')) return;
    
    setLoading(true);
    setLoadingMessage('正在將項目強制結案...');
    try {
      const response = await api.deleteInquiry(id, authService.getUser()?.name || 'Admin');
      if (response.success) {
        // 移出勾選
        setSelectedInquiryIds(prev => prev.filter(item => item !== id));
        fetchInquiries();
      } else {
        alert('操作失敗：' + response.message);
      }
    } catch (err) {
      console.error(err);
      alert('強制結案出錯');
    } finally {
      setLoading(false);
    }
  };

  // 開啟發起工程選擇廠商視窗
  const handleLaunchClick = (inquiry) => {
    if (!inquiry.quotes || inquiry.quotes.length === 0) {
      // 若無報價廠商，直接跳轉，不需選擇廠商
      navigate(`/category/engineering?openAdd=true&quoteId=${inquiry.id}&title=${encodeURIComponent(inquiry.title)}`);
      return;
    }
    setLaunchInquiry(inquiry);
    setSelectedVendorIndex(0); // 預設選擇第一個廠商
    setIsLaunchModalOpen(true);
  };

  // 確定發起工程
  const handleConfirmLaunch = () => {
    if (!launchInquiry) return;
    const vendorData = launchInquiry.quotes[selectedVendorIndex] || {};
    setIsLaunchModalOpen(false);
    navigate(`/category/engineering?openAdd=true&quoteId=${launchInquiry.id}&title=${encodeURIComponent(launchInquiry.title)}&vendor=${encodeURIComponent(vendorData.vendorName || '')}&phone=${encodeURIComponent(vendorData.vendorPhone || '')}`);
  };

  // 處理項目勾選 (只限新單狀態)
  const handleCheckboxChange = (id) => {
    setSelectedInquiryIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 跳轉至投票彙整
  const handleGoToVote = () => {
    const selectedItems = inquiries.filter(item => selectedInquiryIds.includes(item.id));
    navigate('/admin/inquiry/vote', { state: { selectedItems } });
  };

  // 過濾後的詢價項目
  const filteredInquiries = inquiries.filter(item => {
    if (statusFilter === '全部') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '60px' }}>
      <LoadingOverlay show={loading} message={loadingMessage} />
      
      {/* 頂部導覽列 */}
      <header style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '20px 0',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '30px'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>工程詢價與比價歷程</h1>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: 'var(--primary-color)', fontWeight: '600' }}>
            <Plus size={20} /> 發起新詢價
          </button>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 勾選跳轉列 (Sticky) */}
        {selectedInquiryIds.length > 0 && (
          <div className="fade-in" style={{
            position: 'sticky',
            top: '20px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderLeft: '4px solid var(--primary-color)',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-color)' }}>
              已勾選 <span style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedInquiryIds.length}</span> 項新單詢價項目
            </div>
            <button onClick={handleGoToVote} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} /> 進入投票單比價彙整 ({selectedInquiryIds.length})
            </button>
          </div>
        )}

        {/* 狀態過濾選項 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['全部', '新單', '詢價', '計畫終止', '結案'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                backgroundColor: statusFilter === status ? 'var(--primary-color)' : '#ffffff',
                color: statusFilter === status ? '#ffffff' : 'var(--text-color)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* 主要詢價表格 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          {filteredInquiries.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>無此分類的詢價項目資料</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', width: '60px', textAlign: 'center' }}>選擇</th>
                    <th style={{ padding: '16px 20px', width: '150px' }}>發起工程</th>
                    <th style={{ padding: '16px 20px', width: '150px' }}>單號</th>
                    <th style={{ padding: '16px 20px' }}>工程詢價項目名稱</th>
                    <th style={{ padding: '16px 20px', width: '130px' }}>發起日期</th>
                    <th style={{ padding: '16px 20px', width: '110px' }}>發起人</th>
                    <th style={{ padding: '16px 20px', width: '130px' }}>項目狀態</th>
                    <th style={{ padding: '16px 20px', width: '120px', textAlign: 'center' }}>報價數</th>
                    <th style={{ padding: '16px 20px', width: '80px', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((item) => {
                    const isExpanded = expandedInquiryId === item.id;
                    const isNewBill = item.status === '新單';
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
                          <td style={{ padding: '16px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedInquiryIds.includes(item.id)}
                              disabled={!isNewBill}
                              onChange={() => handleCheckboxChange(item.id)}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: isNewBill ? 'pointer' : 'not-allowed',
                                accentColor: 'var(--primary-color)'
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleLaunchClick(item)}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.8rem',
                                padding: '6px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '600'
                              }}
                            >
                              <Send size={12} /> 發起工程
                            </button>
                          </td>
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
                          <td style={{ padding: '16px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeleteInquiry(item.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="刪除詢價"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>

                        {/* 展開之報價廠商明細 */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="9" style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '30px' }}>
                                
                                {/* 報價歷程 */}
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#334155' }}>
                                      報價歷程記錄
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>變更項目狀態：</span>
                                      <select
                                        value={item.status}
                                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          border: '1px solid #cbd5e1',
                                          fontSize: '0.85rem',
                                          fontWeight: '600',
                                          color: 'var(--text-color)',
                                          cursor: 'pointer',
                                          backgroundColor: '#ffffff'
                                        }}
                                      >
                                        <option value="新單">新單</option>
                                        <option value="詢價">詢價</option>
                                        <option value="計畫終止">計畫終止</option>
                                        <option value="結案">結案</option>
                                        <option value="強制結案">強制結案 (隱藏)</option>
                                      </select>
                                    </div>
                                  </div>
                                  {!hasQuotes ? (
                                    <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', color: '#64748b' }}>
                                      目前尚無廠商報價資訊，請於右側登錄新報價。
                                    </div>
                                  ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                          <th style={{ padding: '10px 12px' }}>報價廠商</th>
                                          <th style={{ padding: '10px 12px' }}>聯絡電話</th>
                                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>報價金額 (NTD)</th>
                                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>估價檔案</th>
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
                                </div>

                                {/* 報價登錄表單 */}
                                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>
                                    登錄新廠商報價
                                  </h4>
                                  <form onSubmit={(e) => handleAddQuote(e, item.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>報價廠商 *</label>
                                      <input
                                        type="text"
                                        placeholder="例如：安捷科技工程"
                                        value={quoteForm.vendorName}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, vendorName: e.target.value })}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>聯絡電話</label>
                                      <input
                                        type="text"
                                        placeholder="例如：0912-345-678"
                                        value={quoteForm.vendorPhone}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, vendorPhone: e.target.value })}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>報價金額 (NTD) *</label>
                                      <input
                                        type="number"
                                        placeholder="輸入整數金額"
                                        value={quoteForm.quoteAmount}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>估價單/附件上傳</label>
                                      <div style={{ position: 'relative', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '10px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                                        <input
                                          type="file"
                                          accept=".jpg,.jpeg,.png,.pdf"
                                          onChange={handleFileChange}
                                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                          <Upload size={16} />
                                          <span>{quoteForm.fileName ? quoteForm.fileName : '上傳 JPG, PNG 圖片或 PDF (最大 2MB)'}</span>
                                        </div>
                                      </div>
                                      {quotePreview && (
                                        <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                          <img src={quotePreview} alt="Preview" style={{ maxHeight: '80px', borderRadius: '4px', border: '1px solid #eee' }} />
                                        </div>
                                      )}
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '600', marginTop: '6px' }}>
                                      新增報價
                                    </button>
                                  </form>
                                </div>

                              </div>
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

      {/* 新增詢價項目 Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="發起工程項目詢價">
        <form onSubmit={handleAddInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>工程詢價項目名稱 *</label>
            <input
              type="text"
              placeholder="例如：頂樓防漏工程、電梯定期保養詢價"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>發起日期</label>
              <input
                type="date"
                value={addForm.startDate}
                onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>發起人</label>
              <input
                type="text"
                value={addForm.initiator}
                onChange={(e) => setAddForm({ ...addForm, initiator: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">取消</button>
            <button type="submit" className="btn btn-primary">確認發起</button>
          </div>
        </form>
      </Modal>

      {/* 發起工程 - 選擇得標廠商 Modal */}
      <Modal isOpen={isLaunchModalOpen} onClose={() => setIsLaunchModalOpen(false)} title="確認得標與發起工程">
        {launchInquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              您即將引用詢價項目 <strong style={{ color: 'var(--text-color)' }}>{launchInquiry.title}</strong> 發起正式工程，請在下方選擇此案的得標報價廠商，系統會自動將資料攜帶至工程新增表單中：
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>選擇得標廠商</label>
              <select
                value={selectedVendorIndex}
                onChange={(e) => setSelectedVendorIndex(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem' }}
              >
                {launchInquiry.quotes.map((quote, idx) => (
                  <option key={quote.id} value={idx}>
                    {quote.vendorName} (${Number(quote.quoteAmount).toLocaleString()} 元 - {quote.vendorPhone || '無電話'})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setIsLaunchModalOpen(false)} className="btn btn-secondary">取消</button>
              <button type="button" onClick={handleConfirmLaunch} className="btn btn-primary">帶入資料並發起工程</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuoteInquiryPage;
