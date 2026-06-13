import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, User, Phone, Briefcase, Plus, CheckCircle, Edit2, Upload, Info } from 'lucide-react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { api } from '../services/api';
import { authService } from '../services/auth';

/**
 * 輔助功能：將檔案轉換為 Base64 字串
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 輔助功能：格式化日期為 YYYY/MM/DD
 */
const formatDateStr = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

const EngineeringDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('正在取得工程進度詳細資料，請稍候...');
  const [project, setProject] = useState(null);
  const [siteTitle, setSiteTitle] = useState('工程進度系統');

  // 權限狀態
  const isAuthenticated = authService.isAuthenticated();

  // Modals 控制
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // 行內編輯備註狀態
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  // 編輯延伸工期表單狀態
  const [editForm, setEditForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    file: null,
    notes: ''
  });

  // 結案表單狀態
  const [completeForm, setCompleteForm] = useState({
    title: '',
    endDate: '',
    file: null,
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoadingMessage('正在取得工程進度詳細資料，請稍候...');
      setLoading(true);
      const data = await api.get('getHomeData');
      if (data.success) {
        if (data.siteTitle) {
          setSiteTitle(data.siteTitle);
        }
        
        // 尋找符合 ID 的公告，且類別必須為工程，且狀態不能為已刪除 ('D')
        const found = (data.bulletins || []).find(
          (b) => b.id.toString() === id.toString() && b.category === '工程' && b.status !== 'D'
        );

        if (found) {
          let parsed = null;
          try {
            parsed = JSON.parse(found.content);
          } catch (e) {
            // 相容舊資料
          }

          let isCompleted = found.status === '已完成' || found.status === '已結案' || found.status === 'C' || !!parsed?.completedInfo;
          const notes = parsed ? (parsed.notes !== undefined ? parsed.notes : '') : (found.content || '');
          const phases = parsed?.phases || [
            {
              phaseIndex: 1,
              title: "第一工期 (主項目)",
              startDate: found.startDate,
              endDate: found.endDate || found.startDate,
              fileUrl: found.fileUrl,
              fileType: found.fileType
            }
          ];
          const completedInfo = parsed?.completedInfo || null;

          setProject({
            ...found,
            isCompleted,
            notes,
            phases,
            completedInfo,
            contactPerson: parsed?.contactPerson || '',
            contactPhone: parsed?.contactPhone || '',
            vendorName: parsed?.vendorName || '',
            vendorPhone: parsed?.vendorPhone || ''
          });
        } else {
          setProject(null);
        }
      }
    } catch (e) {
      console.error('[EngineeringDetail] Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // 處理行內備註編輯儲存
  const handleUpdateNotes = async () => {
    if (!project) return;
    setLoadingMessage('正在儲存修改後的工程備註，請稍候...');
    setLoading(true);
    try {
      const updatedContentObj = {
        notes: editingNotes || '',
        phases: project.phases,
        completedInfo: project.completedInfo,
        contactPerson: project.contactPerson || '',
        contactPhone: project.contactPhone || '',
        vendorName: project.vendorName || '',
        vendorPhone: project.vendorPhone || ''
      };

      const payload = {
        id: project.id,
        title: project.title,
        content: JSON.stringify(updatedContentObj),
        category: '工程',
        startDate: project.startDate,
        endDate: project.endDate,
        isUrgent: project.isUrgent || '',
        originalFileUrl: project.fileUrl,
        status: project.status || '未完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.editBulletin(payload);
      if (response.success) {
        setIsEditingNotes(false);
        await fetchProjectData();
      } else {
        alert('備註更新失敗：' + response.message);
      }
    } catch (err) {
      console.error('更新備註出錯:', err);
      alert('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 開啟編輯(延伸工期)視窗
  const openEditModal = () => {
    if (!project) return;
    setEditForm({
      title: `第${project.phases.length + 1}工期`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      file: null,
      notes: ''
    });
    setIsEditModalOpen(true);
  };

  // 提交延伸工期
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.startDate || !editForm.endDate) {
      alert('請填寫工期資訊');
      return;
    }

    setLoadingMessage('正在新增延伸工期並上傳檔案，請稍候...');
    setLoading(true);
    try {
      let fileData = '';
      let fileName = '';
      let fileType = '';

      if (editForm.file) {
        fileData = await fileToBase64(editForm.file);
        fileName = editForm.file.name;
        fileType = editForm.file.type;
      }

      const newPhase = {
        phaseIndex: project.phases.length + 1,
        title: editForm.title,
        startDate: editForm.startDate.replace(/-/g, '/'),
        endDate: editForm.endDate.replace(/-/g, '/'),
        fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
        fileType: fileType,
        notes: editForm.notes || ''
      };

      const updatedPhases = [...project.phases, newPhase];
      
      // 計算最晚結束日期
      let maxEnd = new Date(project.endDate);
      updatedPhases.forEach(p => {
        const pEnd = new Date(p.endDate);
        if (pEnd > maxEnd) maxEnd = pEnd;
      });

      const updatedContentObj = {
        notes: project.notes,
        phases: updatedPhases,
        completedInfo: project.completedInfo,
        contactPerson: project.contactPerson || '',
        contactPhone: project.contactPhone || '',
        vendorName: project.vendorName || '',
        vendorPhone: project.vendorPhone || ''
      };

      const payload = {
        id: project.id,
        title: project.title,
        content: JSON.stringify(updatedContentObj),
        category: '工程',
        startDate: project.startDate,
        endDate: formatDateStr(maxEnd).replace(/\//g, '-'),
        isUrgent: project.isUrgent || '',
        originalFileUrl: project.fileUrl,
        fileData,
        fileName,
        fileType,
        status: project.status || '未完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.editBulletin(payload);
      if (response.success) {
        alert('延伸工期新增成功！');
        setIsEditModalOpen(false);
        await fetchProjectData();
      } else {
        alert('更新失敗：' + response.message);
      }
    } catch (err) {
      console.error('更新延伸工期出錯:', err);
      alert('操作出錯，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 開啟結案視窗
  const openCompleteModal = () => {
    if (!project) return;
    setCompleteForm({
      title: '竣工結案驗收',
      endDate: new Date().toISOString().split('T')[0],
      file: null,
      notes: ''
    });
    setIsCompleteModalOpen(true);
  };

  // 提交結案
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeForm.title || !completeForm.endDate) {
      alert('請填寫結案資訊');
      return;
    }

    setLoadingMessage('正在辦理工程結案與上傳驗收單，請稍候...');
    setLoading(true);
    try {
      let fileData = '';
      let fileName = '';
      let fileType = '';

      if (completeForm.file) {
        fileData = await fileToBase64(completeForm.file);
        fileName = completeForm.file.name;
        fileType = completeForm.file.type;
      }

      const completedInfo = {
        title: completeForm.title,
        endDate: completeForm.endDate.replace(/-/g, '/'),
        fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
        fileType: fileType,
        notes: completeForm.notes || ''
      };

      const updatedContentObj = {
        notes: project.notes,
        phases: project.phases,
        completedInfo: completedInfo,
        contactPerson: project.contactPerson || '',
        contactPhone: project.contactPhone || '',
        vendorName: project.vendorName || '',
        vendorPhone: project.vendorPhone || ''
      };

      const payload = {
        id: project.id,
        title: project.title,
        content: JSON.stringify(updatedContentObj),
        category: '工程',
        startDate: project.startDate,
        endDate: completeForm.endDate,
        isUrgent: project.isUrgent || '',
        originalFileUrl: project.fileUrl,
        fileData,
        fileName,
        fileType,
        status: '已完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.editBulletin(payload);
      if (response.success) {
        alert('工程結案成功！');
        setIsCompleteModalOpen(false);
        await fetchProjectData();
      } else {
        alert('結案失敗：' + response.message);
      }
    } catch (err) {
      console.error('結案操作出錯:', err);
      alert('操作出錯，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-body, #f8fafc)', minHeight: '100vh', paddingBottom: '60px' }}>
      <LoadingOverlay show={loading} message={loadingMessage} />
      <Header title={siteTitle} />

      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* 返回按鈕 */}
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/category/engineering')} 
            className="btn btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}
          >
            <ArrowLeft size={18} /> 返回工程進度表
          </button>
        </div>

        {/* 若找不到專案且非載入中 */}
        {!project && !loading ? (
          <div style={{
            backgroundColor: 'var(--bg-card, #ffffff)', padding: '48px', borderRadius: '16px',
            boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0', textAlign: 'center', color: 'var(--text-muted, #64748b)'
          }}>
            <Info size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main, #1e293b)', marginBottom: '8px' }}>
              找不到該工程項目
            </h3>
            <p style={{ fontSize: '0.95rem', margin: 0 }}>
              該工程項目可能已被刪除，或是網址輸入錯誤。
            </p>
          </div>
        ) : project ? (
          <div>
            {/* 標題與狀態 */}
            <div style={{
              backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px 32px', borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', marginBottom: '24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
            }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main, #1f2937)' }}>
                  {project.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)', fontFamily: 'monospace' }}>
                  工程唯一編號: {project.id}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '8px 18px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '700',
                  backgroundColor: project.isCompleted ? '#dcfce7' : '#dbeafe',
                  color: project.isCompleted ? '#166534' : '#1e40af',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {project.isCompleted ? '已結案' : '施工中 / 未結案'}
                </span>
                
                {/* 管理者按鈕 (僅在未結案時) */}
                {isAuthenticated && !project.isCompleted && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={openEditModal} 
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
                    >
                      <Plus size={16} /> 延伸工期
                    </button>
                    <button 
                      onClick={openCompleteModal} 
                      className="btn"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem',
                        backgroundColor: '#166534', color: 'white', border: 'none'
                      }}
                    >
                      <CheckCircle size={16} /> 辦理結案
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 兩欄式內容區 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1fr', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              
              {/* ==================== 左側欄：工程資訊與聯絡 ==================== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. 基本工程資訊 */}
                <section style={{
                  backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main, #111827)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--primary-color)' }} /> 工程計畫資訊
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted, #6b7280)' }}>計畫開始日期</span>
                      <span style={{ fontWeight: '600' }}>{project.startDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted, #6b7280)' }}>目前預計結束日</span>
                      <span style={{ fontWeight: '600' }}>{project.endDate}</span>
                    </div>
                    {project.startTime && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted, #6b7280)' }}>登錄發佈時間</span>
                        <span>{project.startTime}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. 負責窗口與聯絡廠商資訊 */}
                <section style={{
                  backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main, #111827)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={18} style={{ color: 'var(--primary-color)' }} /> 聯絡窗口與廠商資訊
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* 負責窗口 */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>負責窗口 (Owner)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main, #111827)' }}>
                          {project.contactPerson || <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>無資料</span>}
                        </div>
                      </div>
                    </div>

                    {/* 連絡電話 */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>聯絡電話</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main, #111827)' }}>
                          {project.contactPhone || <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>無資料</span>}
                        </div>
                      </div>
                    </div>

                    {/* 廠商名稱 */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>廠商名稱</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main, #111827)' }}>
                          {project.vendorName || <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>無資料</span>}
                        </div>
                      </div>
                    </div>

                    {/* 廠商電話 */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>廠商電話</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main, #111827)' }}>
                          {project.vendorPhone || <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>無資料</span>}
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 3. 工程備註說明 */}
                <section style={{
                  backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main, #111827)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} style={{ color: 'var(--primary-color)' }} /> 工程備註說明
                    </h3>
                    
                    {/* 編輯備註按鈕 */}
                    {isAuthenticated && !isEditingNotes && (
                      <button
                        onClick={() => {
                          setIsEditingNotes(true);
                          setEditingNotes(project.notes || '');
                        }}
                        style={{
                          background: 'none', border: 'none', color: 'var(--primary-color)',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.8rem', fontWeight: '600'
                        }}
                      >
                        <Edit2 size={13} /> 編輯備註
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div>
                      <textarea
                        rows={5}
                        value={editingNotes}
                        onChange={e => setEditingNotes(e.target.value)}
                        style={{
                          width: '100%', padding: '12px', borderRadius: '8px',
                          border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical', marginBottom: '12px'
                        }}
                        placeholder="請輸入工程的備註或延伸說明..."
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          取消
                        </button>
                        <button
                          onClick={handleUpdateNotes}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          儲存備註
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      whiteSpace: 'pre-wrap', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6',
                      padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1'
                    }}>
                      {project.notes || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>目前無備註說明。</span>}
                    </div>
                  )}
                </section>
              </div>

              {/* ==================== 右側欄：歷程與結案 ==================== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. 結案驗收資訊 (若已完成) */}
                {project.isCompleted && project.completedInfo && (
                  <section style={{
                    backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid #bbf7d0', borderLeft: '6px solid #166534'
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏁 {project.completedInfo.title || '竣工結案驗收'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#14532d' }}>
                      <div>
                        <strong>實際竣工日期：</strong> {project.completedInfo.endDate}
                      </div>
                      {project.completedInfo.notes && (
                        <div style={{
                          backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px',
                          borderLeft: '3px solid #166534', color: '#166534', margin: '4px 0'
                        }}>
                          <strong>結案備註：</strong>{project.completedInfo.notes}
                        </div>
                      )}
                      {project.completedInfo.fileUrl && (
                        <div style={{ marginTop: '6px' }}>
                          <a
                            href={project.completedInfo.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{
                              padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#166534', color: 'white',
                              border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <FileText size={16} /> 檢視竣工驗收單 / 附件
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 2. 垂直歷程時間軸 */}
                <section style={{
                  backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main, #111827)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--primary-color)' }} /> 工程工期歷程明細
                  </h3>
                  
                  {/* 時間軸容器 */}
                  <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e2e8f0', marginLeft: '12px' }}>
                    
                    {project.phases.map((phase, index) => (
                      <div key={index} style={{ position: 'relative', marginBottom: '24px' }}>
                        
                        {/* 時間軸節點小圓圈 */}
                        <div style={{
                          position: 'absolute',
                          left: '-31px',
                          top: '4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: index === 0 ? '#3b82f6' : '#10b981',
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px ' + (index === 0 ? '#93c5fd' : '#86efac')
                        }} />

                        {/* 卡片內容 */}
                        <div style={{
                          backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px',
                          border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main, #1f2937)' }}>
                              {phase.title}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                              backgroundColor: index === 0 ? '#eff6ff' : '#ecfdf5',
                              color: index === 0 ? '#1e40af' : '#047857'
                            }}>
                              {index === 0 ? '第一期 (主工期)' : `延伸工期 (第 ${phase.phaseIndex || (index+1)} 期)`}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {phase.startDate} ~ {phase.endDate}
                          </div>

                          {phase.notes && (
                            <div style={{
                              fontSize: '0.85rem', color: '#4b5563', fontStyle: 'italic',
                              borderLeft: '3px solid #cbd5e1', paddingLeft: '8px', margin: '8px 0'
                            }}>
                              📌 工期備註：{phase.notes}
                            </div>
                          )}

                          {phase.fileUrl && (
                            <div style={{ marginTop: '10px' }}>
                              <a
                                href={phase.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600',
                                  textDecoration: 'none'
                                }}
                              >
                                <FileText size={14} /> 下載本期相關附件
                              </a>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}

                  </div>
                </section>

              </div>

            </div>
          </div>
        ) : null}
      </main>

      {/* ========================================================================= */}
      {/* 彈窗：新增延伸工期 (編輯) */}
      {/* ========================================================================= */}
      {project && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`➕ 新增延伸工期: ${project.title}`}
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>延伸工期名稱 <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="例如：第二工期追加"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>開始日期 <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  required
                  value={editForm.startDate}
                  onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>結束日期 <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  required
                  value={editForm.endDate}
                  onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>工期備註說明</label>
              <textarea
                rows={3}
                value={editForm.notes || ''}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="請輸入此延伸工期的備註或工作內容..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>上傳工期相關附件</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="file"
                  id="detail-edit-file-upload"
                  onChange={e => setEditForm({ ...editForm, file: e.target.files[0] })}
                  style={{ display: 'none' }}
                />
                <label htmlFor="detail-edit-file-upload" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> 選擇檔案
                </label>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {editForm.file ? editForm.file.name : '未選擇任何檔案'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">取消</button>
              <button type="submit" className="btn btn-primary">新增工期資料</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 彈窗：結案 */}
      {/* ========================================================================= */}
      {project && (
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title={`🏁 工程項目結案: ${project.title}`}
        >
          <form onSubmit={handleCompleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>結案說明標題 <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                required
                value={completeForm.title}
                onChange={e => setCompleteForm({ ...completeForm, title: e.target.value })}
                placeholder="例如：竣工驗收結案報告"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>實際竣工日期 <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="date"
                required
                value={completeForm.endDate}
                onChange={e => setCompleteForm({ ...completeForm, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>結案備註說明</label>
              <textarea
                rows={3}
                value={completeForm.notes || ''}
                onChange={e => setCompleteForm({ ...completeForm, notes: e.target.value })}
                placeholder="請輸入結案相關備註與說明..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>上傳竣工驗收證明 / 現場照</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="file"
                  id="detail-complete-file-upload"
                  onChange={e => setCompleteForm({ ...completeForm, file: e.target.files[0] })}
                  style={{ display: 'none' }}
                />
                <label htmlFor="detail-complete-file-upload" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> 選擇檔案
                </label>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {completeForm.file ? completeForm.file.name : '未選擇任何檔案'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="btn btn-secondary">取消</button>
              <button type="submit" className="btn" style={{ backgroundColor: '#166534', color: 'white', border: 'none' }}>辦理結案</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EngineeringDetail;
