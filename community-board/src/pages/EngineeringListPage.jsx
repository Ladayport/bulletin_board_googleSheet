import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, CheckCircle, Upload, Calendar, FileText, Search, ArrowUpDown, ChevronRight, Eye } from 'lucide-react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { mockSiteData } from '../utils/mockData';
import { compressImage, fileToBase64 } from '../utils/imageUtils';

/**
 * 輔助功能：產生唯一碼 L+年+月+日+時+分+秒
 */
const generateUniqueCode = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `L${yyyy}${mm}${dd}${hh}${min}${ss}`;
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

/**
 * 輔助功能：針對 Google Drive 連結進行轉換
 */
const getDisplayFileUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
    }
  }
  return url;
};

/**
 * 輔助功能：依據檔案類型渲染附件連結
 */
const renderFileAttachment = (fileUrl, fileType) => {
  if (!fileUrl) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>無附件</span>;
  
  const isImage = fileType?.includes('image/');
  const isPDF = fileType === 'application/pdf';
  const displayUrl = fileUrl;

  let btnLabel = '下載';
  if (isImage) btnLabel = '圖片';
  else if (isPDF) btnLabel = 'PDF';

  return (
    <a
      href={displayUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        color: 'var(--primary-color)',
        fontSize: '0.75rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        fontWeight: '600',
        cursor: 'pointer'
      }}
    >
      <FileText size={12} /> {btnLabel}
    </a>
  );
};

const EngineeringListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('資料載入中，請稍候...');
  const [siteTitle, setSiteTitle] = useState(mockSiteData.title);
  const [rawBulletins, setRawBulletins] = useState([]);

  // 判斷是否為失物招領
  const isLostFound = location.pathname.includes('lost-found');
  const categoryName = isLostFound ? '失物' : '工程';
  const pageTitle = isLostFound ? '🔍 失物招領進度追蹤' : '📋 工程進度追蹤列表';

  // 搜尋與排序狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('startDate_desc');

  // 預覽狀態
  const [addPreview, setAddPreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [completePreview, setCompletePreview] = useState(null);

  // 權限狀態
  const isAuthenticated = authService.isAuthenticated();

  // Modals 控制
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // 行內編輯備註狀態
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');

  // 新增工程表單狀態
  const [addForm, setAddForm] = useState({
    uniqueId: '',
    title: '',
    startDate: '',
    endDate: '',
    notes: '',
    file: null,
    fileData: '',
    fileName: '',
    fileType: '',
    contactPerson: '',
    contactPhone: '',
    vendorName: '',
    vendorPhone: ''
  });

  // 編輯延伸工期表單狀態
  const [editForm, setEditForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    file: null,
    fileData: '',
    fileName: '',
    fileType: '',
    notes: ''
  });

  // 結案表單狀態
  const [completeForm, setCompleteForm] = useState({
    title: '',
    endDate: '',
    file: null,
    fileData: '',
    fileName: '',
    fileType: '',
    notes: ''
  });

  // 初始載入資料
  useEffect(() => {
    fetchData();
  }, []);

  // 監聽網址參數，若有 ?openAdd=true 則自動打開新增彈窗，並支援載入詢價單引用資料
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('openAdd') === 'true') {
      const quoteId = query.get('quoteId') || '';
      const title = query.get('title') || '';
      const vendor = query.get('vendor') || '';
      const phone = query.get('phone') || '';
      
      openAddModal({ quoteId, title, vendor, phone });
      // 清除網址參數，避免重複觸發
      const targetPath = isLostFound ? '/category/lost-found' : '/category/engineering';
      navigate(targetPath, { replace: true });
    }
  }, [location, navigate, isLostFound]);

  const fetchData = async () => {
    try {
      setLoadingMessage('正在取得進度資料，請稍候...');
      setLoading(true);
      const data = await api.get('getHomeData');
      if (data.success) {
        if (data.siteTitle) {
          setSiteTitle(data.siteTitle);
        }
        setRawBulletins(data.bulletins || []);
      }
    } catch (e) {
      console.error('[EngineeringListPage] Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // 處理資料：過濾出 category 為 '工程'、'失物' 或 '失物招領' 且 status !== 'D' 的資料，並解析其中的 JSON 內容
  const parsedProjects = rawBulletins
    .filter(b => {
      if (isLostFound) {
        return (b.category === '失物' || b.category === '失物招領') && b.status !== 'D';
      } else {
        return b.category === '工程' && b.status !== 'D';
      }
    })
    .map(b => {
      let parsed = null;
      try {
        parsed = JSON.parse(b.content);
      } catch (e) {
        // 相容舊資料
      }
      let isCompleted = b.status === '已完成' || b.status === '已結案' || b.status === 'C' || !!parsed?.completedInfo;

      const notes = parsed ? (parsed.notes !== undefined ? parsed.notes : '') : (b.content || '');
      const phases = parsed?.phases || [
        {
          phaseIndex: 1,
          title: "第一工期 (主項目)",
          startDate: b.startDate,
          endDate: b.endDate || b.startDate,
          fileUrl: b.fileUrl,
          fileType: b.fileType
        }
      ];
      const completedInfo = parsed?.completedInfo || null;

      // 防禦性修正
      if (phases && phases.length > 0) {
        phases.forEach(p => {
          if (p.fileUrl === '[LATEST_UPLOAD_URL]') {
            p.fileUrl = b.fileUrl || '';
          }
        });
      }
      if (completedInfo) {
        if (completedInfo.fileUrl === '[LATEST_UPLOAD_URL]') {
          completedInfo.fileUrl = b.fileUrl || '';
        }
      }

      // 計算最早開始與最晚結束
      let minStart = new Date(b.startDate);
      let maxEnd = b.endDate ? new Date(b.endDate) : new Date(b.startDate);

      phases.forEach(p => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        if (!isNaN(pStart.getTime()) && pStart < minStart) minStart = pStart;
        if (!isNaN(pEnd.getTime()) && pEnd > maxEnd) maxEnd = pEnd;
      });

      return {
        ...b,
        isCompleted,
        notes,
        phases,
        completedInfo,
        projectStartDate: minStart,
        projectEndDate: maxEnd,
        contactPerson: parsed?.contactPerson || '',
        contactPhone: parsed?.contactPhone || '',
        vendorName: parsed?.vendorName || '',
        vendorPhone: parsed?.vendorPhone || ''
      };
    });

  // 搜尋過濾
  const filteredProjects = parsedProjects.filter(p => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      p.title?.toLowerCase().includes(query) ||
      p.id?.toString().toLowerCase().includes(query) ||
      p.notes?.toLowerCase().includes(query) ||
      p.contactPerson?.toLowerCase().includes(query) ||
      p.vendorName?.toLowerCase().includes(query) ||
      p.phases?.some(phase => 
        phase.title?.toLowerCase().includes(query) || 
        phase.notes?.toLowerCase().includes(query)
      )
    );
  });

  // 排序處理
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'startDate_desc':
        return new Date(b.projectStartDate) - new Date(a.projectStartDate);
      case 'startDate_asc':
        return new Date(a.projectStartDate) - new Date(b.projectStartDate);
      case 'endDate_desc':
        return new Date(b.projectEndDate) - new Date(a.projectEndDate);
      case 'endDate_asc':
        return new Date(a.projectEndDate) - new Date(b.projectEndDate);
      case 'status_incomplete_first':
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return new Date(b.projectStartDate) - new Date(a.projectStartDate);
      case 'status_completed_first':
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? -1 : 1;
        }
        return new Date(b.projectStartDate) - new Date(a.projectStartDate);
      case 'title_asc':
        return a.title.localeCompare(b.title, 'zh-Hant');
      default:
        return new Date(b.projectStartDate) - new Date(a.projectStartDate);
    }
  });

  // 圓餅圖統計 (過去一年)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const projectsInLastYear = parsedProjects.filter(p => {
    return p.projectStartDate >= oneYearAgo && p.projectStartDate <= new Date();
  });

  const completedCount = projectsInLastYear.filter(p => p.isCompleted).length;
  const incompleteCount = projectsInLastYear.filter(p => !p.isCompleted).length;
  const totalPieCount = completedCount + incompleteCount;

  const pieDataRaw = [
    { label: '進行中 / 未結案', count: incompleteCount, color: '#3b82f6' },
    { label: '已完成 / 已結案', count: completedCount, color: '#10b981' }
  ].filter(item => item.count > 0);

  let cumulativePercent = 0;
  const pieData = pieDataRaw.map((item) => {
    const percent = totalPieCount > 0 ? (item.count / totalPieCount) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...item,
      percent,
      start,
      end: cumulativePercent
    };
  });

  const conicGradientStyle = pieData.length > 0
    ? `conic-gradient(${pieData.map(d => `${d.color} ${d.start}% ${d.end}%`).join(', ')})`
    : '#e2e8f0';

  // --- 檔案選擇與上傳處理 ---
  const handleAddFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('只支援 JPG, PNG 圖片或 PDF 文件');
      return;
    }
    try {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        setAddPreview(URL.createObjectURL(processedFile));
      } else {
        setAddPreview(null);
      }
      const base64 = await fileToBase64(processedFile);
      setAddForm(prev => ({
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

  const handleEditFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('只支援 JPG, PNG 圖片或 PDF 文件');
      return;
    }
    try {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        setEditPreview(URL.createObjectURL(processedFile));
      } else {
        setEditPreview(null);
      }
      const base64 = await fileToBase64(processedFile);
      setEditForm(prev => ({
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

  const handleCompleteFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('只支援 JPG, PNG 圖片或 PDF 文件');
      return;
    }
    try {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        setCompletePreview(URL.createObjectURL(processedFile));
      } else {
        setCompletePreview(null);
      }
      const base64 = await fileToBase64(processedFile);
      setCompleteForm(prev => ({
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

  // --- 開啟與送出彈窗表單 ---
  const openAddModal = (initialData = {}) => {
    setAddForm({
      uniqueId: generateUniqueCode(),
      title: initialData.title || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      notes: initialData.quoteId ? `[引用詢價單號: ${initialData.quoteId}]` : '',
      file: null,
      fileData: '',
      fileName: '',
      fileType: '',
      contactPerson: '',
      contactPhone: '',
      vendorName: initialData.vendor || '',
      vendorPhone: initialData.phone || ''
    });
    setAddPreview(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.title || !addForm.startDate || !addForm.endDate) {
      alert('請填寫必填欄位');
      return;
    }

    setLoadingMessage('正在發佈新工程項目並上傳附件，請稍候...');
    setLoading(true);
    try {
      const fileData = addForm.fileData || '';
      const fileName = addForm.fileName || '';
      const fileType = addForm.fileType || '';

      const contentObj = {
        notes: addForm.notes,
        phases: [
          {
            phaseIndex: 1,
            title: "第一工期 (主項目)",
            startDate: addForm.startDate.replace(/-/g, '/'),
            endDate: addForm.endDate.replace(/-/g, '/'),
            fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
            fileType: fileType
          }
        ],
        completedInfo: null,
        contactPerson: addForm.contactPerson || '',
        contactPhone: addForm.contactPhone || '',
        vendorName: addForm.vendorName || '',
        vendorPhone: addForm.vendorPhone || ''
      };

      const payload = {
        action: 'addBulletin',
        title: addForm.title,
        content: JSON.stringify(contentObj),
        category: categoryName,
        startDate: addForm.startDate,
        endDate: addForm.endDate,
        isUrgent: '',
        fileData,
        fileName,
        fileType,
        status: '未完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.post('addBulletin', payload);
      if (response.success) {
        alert('項目新增成功！');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        alert('新增失敗：' + response.message);
      }
    } catch (err) {
      console.error('新增出錯:', err);
      alert('新增出錯，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditForm({
      title: `第${project.phases.length + 1}工期`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      file: null,
      fileData: '',
      fileName: '',
      fileType: '',
      notes: ''
    });
    setEditPreview(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.startDate || !editForm.endDate) {
      alert('請填寫工期資訊');
      return;
    }

    setLoadingMessage('正在新增延伸工期並上傳檔案，請稍候...');
    setLoading(true);
    try {
      const fileData = editForm.fileData || '';
      const fileName = editForm.fileName || '';
      const fileType = editForm.fileType || '';

      const newPhase = {
        phaseIndex: selectedProject.phases.length + 1,
        title: editForm.title,
        startDate: editForm.startDate.replace(/-/g, '/'),
        endDate: editForm.endDate.replace(/-/g, '/'),
        fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
        fileType: fileType,
        notes: editForm.notes || ''
      };

      const updatedPhases = [...selectedProject.phases, newPhase];

      let maxEnd = new Date(selectedProject.endDate);
      updatedPhases.forEach(p => {
        const pEnd = new Date(p.endDate);
        if (pEnd > maxEnd) maxEnd = pEnd;
      });

      const updatedContentObj = {
        notes: selectedProject.notes,
        phases: updatedPhases,
        completedInfo: selectedProject.completedInfo,
        contactPerson: selectedProject.contactPerson || '',
        contactPhone: selectedProject.contactPhone || '',
        vendorName: selectedProject.vendorName || '',
        vendorPhone: selectedProject.vendorPhone || ''
      };

      const payload = {
        id: selectedProject.id,
        title: selectedProject.title,
        content: JSON.stringify(updatedContentObj),
        category: categoryName,
        startDate: selectedProject.startDate,
        endDate: formatDateStr(maxEnd).replace(/\//g, '-'),
        isUrgent: selectedProject.isUrgent || '',
        originalFileUrl: selectedProject.fileUrl,
        fileData,
        fileName,
        fileType,
        status: selectedProject.status || '未完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.editBulletin(payload);
      if (response.success) {
        setIsEditModalOpen(false);
        fetchData();
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

  const openCompleteModal = (project) => {
    setSelectedProject(project);
    setCompleteForm({
      title: '竣工結案驗收',
      endDate: new Date().toISOString().split('T')[0],
      file: null,
      fileData: '',
      fileName: '',
      fileType: '',
      notes: ''
    });
    setCompletePreview(null);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeForm.title || !completeForm.endDate) {
      alert('請填寫結案資訊');
      return;
    }

    setLoadingMessage('正在辦理結案與上傳驗收單，請稍候...');
    setLoading(true);
    try {
      const fileData = completeForm.fileData || '';
      const fileName = completeForm.fileName || '';
      const fileType = completeForm.fileType || '';

      const completedInfo = {
        title: completeForm.title,
        endDate: completeForm.endDate.replace(/-/g, '/'),
        fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
        fileType: fileType,
        notes: completeForm.notes || ''
      };

      const updatedContentObj = {
        notes: selectedProject.notes,
        phases: selectedProject.phases,
        completedInfo: completedInfo,
        contactPerson: selectedProject.contactPerson || '',
        contactPhone: selectedProject.contactPhone || '',
        vendorName: selectedProject.vendorName || '',
        vendorPhone: selectedProject.vendorPhone || ''
      };

      const payload = {
        id: selectedProject.id,
        title: selectedProject.title,
        content: JSON.stringify(updatedContentObj),
        category: categoryName,
        startDate: selectedProject.startDate,
        endDate: completeForm.endDate,
        isUrgent: selectedProject.isUrgent || '',
        originalFileUrl: selectedProject.fileUrl,
        fileData,
        fileName,
        fileType,
        status: '已完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      const response = await api.editBulletin(payload);
      if (response.success) {
        alert('結案成功！');
        setIsCompleteModalOpen(false);
        fetchData();
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
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '40px' }}>
      <LoadingOverlay show={loading} message={loadingMessage} />
      <Header title={siteTitle} />

      {/* 嵌入局部響應式表格樣式 */}
      <style>{`
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 12px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background-color: var(--bg-card);
        }
        .custom-table th {
          background-color: #f8fafc;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .custom-table td {
          padding: 16px;
          font-size: 0.9rem;
          color: var(--text-main);
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          transition: background-color 0.15s ease;
        }
        .custom-table tr:last-child td {
          border-bottom: none;
        }
        .custom-table tr:hover td {
          background-color: #f8fafc;
        }
        .search-container {
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-input {
          width: 100%;
          padding: 10px 10px 10px 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
          background-color: var(--bg-card);
          color: var(--text-main);
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus {
          border-color: var(--primary-color);
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .sort-select {
          padding: 10px 32px 10px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
          background-color: var(--bg-card);
          color: var(--text-main);
          cursor: pointer;
          appearance: none;
          box-sizing: border-box;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          min-width: 180px;
        }
        @media (max-width: 992px) {
          .custom-table, .custom-table thead, .custom-table tbody, .custom-table th, .custom-table td, .custom-table tr {
            display: block;
          }
          .custom-table thead {
            display: none;
          }
          .custom-table tr {
            border-bottom: 2px solid #e2e8f0;
            padding: 12px 6px;
          }
          .custom-table tr:last-child {
            border-bottom: none;
          }
          .custom-table td {
            border-bottom: none;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
          }
          .custom-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: var(--text-muted);
            float: left;
            margin-right: 16px;
            font-size: 0.85rem;
          }
        }
      `}</style>

      <main className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        {/* 頂部操作列 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <ArrowLeft size={20} /> 返回首頁
            </button>
            <button 
              onClick={() => navigate(isLostFound ? `/category/lost-found/board` : `/category/engineering/board`)} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}
            >
              <Calendar size={18} /> 📊 切換至甘特圖看板
            </button>
            {!isLostFound && (
              <button onClick={() => navigate('/engineering/inquiries')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}>
                <FileText size={18} /> 查看詢價比價歷程
              </button>
            )}
          </div>

          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '700' }}>
            {pageTitle}
          </h2>

          {isAuthenticated && (
            <button onClick={() => openAddModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={20} /> 新增工程項目
            </button>
          )}
        </div>

        {/* 統計圓餅圖與過濾區 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px', marginBottom: '24px'
        }}>
          {/* 搜尋與排序控制 */}
          <section style={{
            padding: '24px', backgroundColor: 'var(--bg-card)',
            borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
              🔍 條件篩選與排序
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="搜尋工程、單號、廠商、聯絡人..."
                  className="search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  排序依據
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="sort-select"
                  style={{ flex: 1 }}
                >
                  <option value="startDate_desc">開始日期 (新 → 舊)</option>
                  <option value="startDate_asc">開始日期 (舊 → 新)</option>
                  <option value="endDate_desc">結束日期 (新 → 舊)</option>
                  <option value="endDate_asc">結束日期 (舊 → 新)</option>
                  <option value="status_incomplete_first">進行中工程優先</option>
                  <option value="status_completed_first">已完成工程優先</option>
                  <option value="title_asc">項目名稱 (A-Z)</option>
                </select>
              </div>
            </div>
          </section>

          {/* 結案比例統計圓餅圖 */}
          <section style={{
            padding: '24px', backgroundColor: 'var(--bg-card)',
            borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)',
            display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 180px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                📊 工程結案狀態比例
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                (統計過去一年內開工，共 {totalPieCount} 筆)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pieData.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: d.color }}></div>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{d.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({d.count} 筆, {d.percent.toFixed(0)}%)</span>
                  </div>
                ))}
                {pieData.length === 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>此期間內無已登錄工程</div>
                )}
              </div>
            </div>

            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              backgroundImage: conicGradientStyle,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              position: 'relative', flexShrink: 0, margin: '0 auto'
            }}>
              <div style={{
                position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%',
                borderRadius: '50%', backgroundColor: 'var(--bg-card)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}></div>
            </div>
          </section>
        </div>

        {/* 表格清單區區塊 */}
        <section style={{
          backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)', padding: '24px', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '600' }}>
              📋 工程進度清單 (共 {sortedProjects.length} 筆)
            </h3>
          </div>

          {sortedProjects.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>編號 / 唯一碼</th>
                    <th>工程名稱</th>
                    <th style={{ width: '100px' }}>狀態</th>
                    <th>預計工期</th>
                    <th>負責窗口</th>
                    <th>承辦廠商</th>
                    <th>合約與附件</th>
                    <th style={{ width: '150px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map(project => {
                    const startStr = formatDateStr(project.projectStartDate);
                    const endStr = formatDateStr(project.projectEndDate);
                    
                    // 取得第一期檔案連結 (合約附件)
                    const firstPhase = project.phases?.[0];

                    return (
                      <tr key={project.id}>
                        <td data-label="編號 / 唯一碼" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {project.id}
                        </td>
                        <td data-label="工程名稱">
                          <span 
                            onClick={() => navigate(isLostFound ? `/category/lost-found/${project.id}` : `/category/engineering/${project.id}`)}
                            style={{ 
                              fontWeight: '600', 
                              color: 'var(--primary-color)', 
                              cursor: 'pointer', 
                              textDecoration: 'underline' 
                            }}
                            title="點擊查看工程歷程與明細"
                          >
                            {project.title}
                          </span>
                          {project.phases?.length > 1 && (
                            <span style={{ 
                              marginLeft: '6px', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              backgroundColor: '#f1f5f9',
                              color: '#475569'
                            }}>
                              共 {project.phases.length} 期
                            </span>
                          )}
                        </td>
                        <td data-label="狀態">
                          <span style={{
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            backgroundColor: project.isCompleted ? '#dcfce7' : '#dbeafe',
                            color: project.isCompleted ? '#166534' : '#1e40af',
                            display: 'inline-block'
                          }}>
                            {project.isCompleted ? '已結案' : '進行中'}
                          </span>
                        </td>
                        <td data-label="預計工期" style={{ fontSize: '0.85rem' }}>
                          {startStr} ~ {endStr}
                        </td>
                        <td data-label="負責窗口" style={{ fontSize: '0.85rem' }}>
                          {project.contactPerson ? (
                            <div>
                              <div>{project.contactPerson}</div>
                              {project.contactPhone && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{project.contactPhone}</div>}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td data-label="承辦廠商" style={{ fontSize: '0.85rem' }}>
                          {project.vendorName ? (
                            <div>
                              <div>{project.vendorName}</div>
                              {project.vendorPhone && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{project.vendorPhone}</div>}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td data-label="合約與附件">
                          {firstPhase ? renderFileAttachment(firstPhase.fileUrl, firstPhase.fileType) : <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td data-label="操作">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => navigate(isLostFound ? `/category/lost-found/${project.id}` : `/category/engineering/${project.id}`)}
                              className="btn btn-secondary"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.75rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                height: 'auto'
                              }}
                            >
                              <Eye size={12} /> 明細
                            </button>
                            {isAuthenticated && !project.isCompleted && (
                              <>
                                <button
                                  onClick={() => openEditModal(project)}
                                  className="btn btn-secondary"
                                  style={{ 
                                    padding: '4px 8px', 
                                    fontSize: '0.75rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    height: 'auto'
                                  }}
                                >
                                  <Plus size={12} /> 延伸
                                </button>
                                <button
                                  onClick={() => openCompleteModal(project)}
                                  className="btn"
                                  style={{
                                    padding: '4px 8px', 
                                    fontSize: '0.75rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    backgroundColor: '#dcfce7', 
                                    color: '#166534', 
                                    border: '1px solid #bbf7d0',
                                    height: 'auto'
                                  }}
                                >
                                  <CheckCircle size={12} /> 結案
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)'
            }}>
              📭 沒有符合篩選與搜尋條件的工程項目。
            </div>
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 彈窗 A：新增工程項目 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`🏗️ 新增${isLostFound ? '失物招領' : '工程追蹤'}項目`}
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>唯一識別碼</label>
            <input
              type="text"
              value={addForm.uniqueId}
              disabled
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>項目標題 <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              required
              value={addForm.title}
              onChange={e => setAddForm({ ...addForm, title: e.target.value })}
              placeholder="請輸入項目標題"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>預計開始日 <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="date"
                required
                value={addForm.startDate}
                onChange={e => setAddForm({ ...addForm, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>預計結束日 <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="date"
                required
                value={addForm.endDate}
                onChange={e => setAddForm({ ...addForm, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>上傳合約 / 施工圖等檔案</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="file"
                id="add-file-upload-list"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleAddFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="add-file-upload-list" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                <Upload size={16} /> 選擇檔案
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {addForm.file ? addForm.file.name : '未選擇任何檔案'}
              </span>
            </div>
            {addPreview && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 4px 0' }}>圖片預覽 (已壓縮):</p>
                <img src={addPreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #eee' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>負責窗口</label>
              <input
                type="text"
                value={addForm.contactPerson || ''}
                onChange={e => setAddForm({ ...addForm, contactPerson: e.target.value })}
                placeholder="負責窗口姓名"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>連絡電話</label>
              <input
                type="text"
                value={addForm.contactPhone || ''}
                onChange={e => setAddForm({ ...addForm, contactPhone: e.target.value })}
                placeholder="連絡電話"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>廠商名稱</label>
              <input
                type="text"
                value={addForm.vendorName || ''}
                onChange={e => setAddForm({ ...addForm, vendorName: e.target.value })}
                placeholder="廠商名稱"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>廠商電話</label>
              <input
                type="text"
                value={addForm.vendorPhone || ''}
                onChange={e => setAddForm({ ...addForm, vendorPhone: e.target.value })}
                placeholder="廠商電話"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>備註 / 說明</label>
            <textarea
              rows={4}
              value={addForm.notes || ''}
              onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="請輸入項目備註或說明..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">取消</button>
            <button type="submit" className="btn btn-primary">確認發佈</button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 彈窗 B：編輯 (新增延伸工期) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedProject ? `➕ 新增延伸工期: ${selectedProject.title}` : '新增延伸工期'}
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
                id="edit-file-upload-list"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleEditFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="edit-file-upload-list" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                <Upload size={16} /> 選擇檔案
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {editForm.file ? editForm.file.name : '未選擇任何檔案'}
              </span>
            </div>
            {editPreview && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 4px 0' }}>圖片預覽 (已壓縮):</p>
                <img src={editPreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #eee' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">取消</button>
            <button type="submit" className="btn btn-primary">新增工期資料</button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 彈窗 C：結案 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title={selectedProject ? `🏁 項目結案: ${selectedProject.title}` : '項目結案'}
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
                id="complete-file-upload-list"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleCompleteFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="complete-file-upload-list" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                <Upload size={16} /> 選擇檔案
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {completeForm.file ? completeForm.file.name : '未選擇任何檔案'}
              </span>
            </div>
            {completePreview && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 4px 0' }}>圖片預覽 (已壓縮):</p>
                <img src={completePreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #eee' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="btn btn-secondary">取消</button>
            <button type="submit" className="btn btn-primary">確認辦理結案</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EngineeringListPage;
