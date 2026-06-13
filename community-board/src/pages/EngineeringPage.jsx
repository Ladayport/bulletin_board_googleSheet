import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, CheckCircle, Upload, Calendar, FileText, Info } from 'lucide-react';
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
 * 輔助功能：針對 Google Drive 連結進行轉換 (確保能直接顯示)
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
 * 輔助功能：依據檔案類型渲染附件（維持按鈕存在，點擊時另開分頁查看）
 */
const renderFileAttachment = (fileUrl, fileType) => {
  if (!fileUrl) return null;
  
  const isImage = fileType?.includes('image/');
  const isPDF = fileType === 'application/pdf';
  const displayUrl = fileUrl;

  let btnLabel = '下載檔案';
  if (isImage) btnLabel = '檢視圖片附件';
  else if (isPDF) btnLabel = '開啟 PDF 附件';

  return (
    <div style={{ marginTop: '6px' }}>
      <a
        href={displayUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation(); // 阻止冒泡，避免點擊卡片跳轉
        }}
        style={{
          color: 'var(--primary-color)',
          fontSize: '0.75rem',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        <FileText size={12} /> {btnLabel}
      </a>
    </div>
  );
};

const EngineeringPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('資料載入中，請稍候...');
  const [siteTitle, setSiteTitle] = useState(mockSiteData.title);
  const [rawBulletins, setRawBulletins] = useState([]);

  // 預覽狀態
  const [addPreview, setAddPreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [completePreview, setCompletePreview] = useState(null);

  // 權限狀態
  const isAuthenticated = authService.isAuthenticated();

  // 篩選日期範圍 (預設抓前後各半年，以便呈現甘特圖)
  const getDefaultDateFilter = () => {
    const today = new Date();
    const halfYearAgo = new Date();
    halfYearAgo.setMonth(today.getMonth() - 6);
    const halfYearLater = new Date();
    halfYearLater.setMonth(today.getMonth() + 6);
    return {
      startDate: halfYearAgo.toISOString().split('T')[0],
      endDate: halfYearLater.toISOString().split('T')[0]
    };
  };
  const [dateFilter, setDateFilter] = useState(getDefaultDateFilter());

  // 當前甘特圖分頁狀態 ('incomplete' | 'completed')
  const [ganttTab, setGanttTab] = useState('incomplete');

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

  // 監聽網址參數，若有 ?openAdd=true 則自動打開新增彈窗
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('openAdd') === 'true') {
      openAddModal();
      // 清除網址參數，避免重複觸發
      navigate('/category/engineering', { replace: true });
    }
  }, [location, navigate]);

  const fetchData = async () => {
    try {
      setLoadingMessage('正在取得工程進度資料，請稍候...');
      setLoading(true);
      const data = await api.get('getHomeData');
      if (data.success) {
        if (data.siteTitle) {
          setSiteTitle(data.siteTitle);
        }
        setRawBulletins(data.bulletins || []);
      }
    } catch (e) {
      console.error('[EngineeringPage] Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // 處理資料：過濾出 category 為 '工程'、'失物' 或 '失物招領' 且 status !== 'D' 的資料，並解析其中的 JSON 內容
  const parsedProjects = rawBulletins
    .filter(b => (b.category === '工程' || b.category === '失物' || b.category === '失物招領') && b.status !== 'D')
    .map(b => {
      let parsed = null;
      try {
        parsed = JSON.parse(b.content);
      } catch (e) {
        // 相容非 JSON 的舊失物招領資料
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

      // 防禦性修正：若 phases 中任何工期的 fileUrl 是 placeholder，則以最外層的真實 fileUrl 替代 (供 GAS 未升級時相容)
      if (phases && phases.length > 0) {
        phases.forEach(p => {
          if (p.fileUrl === '[LATEST_UPLOAD_URL]') {
            p.fileUrl = b.fileUrl || '';
          }
        });
      }
      // 同理，如果結案驗收單的 fileUrl 是 placeholder，則以最外層的真實 fileUrl 替代
      if (completedInfo) {
        if (completedInfo.fileUrl === '[LATEST_UPLOAD_URL]') {
          completedInfo.fileUrl = b.fileUrl || '';
        }
      }

      // 計算整個工程的最早開始日與最晚結束日
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

  // 依據篩選日期區間進行項目過濾
  // 【特別修正】進行中/未完成的工程項目不受篩選日期限制，永遠保留以防被遺漏；
  // 已完成/已結案的工程項目僅在開始日期符合篩選日期區間時才保留，避免頁面過於擁擠
  const filterStart = new Date(dateFilter.startDate);
  const filterEnd = new Date(dateFilter.endDate);
  filterEnd.setHours(23, 59, 59, 999);

  const filteredProjects = parsedProjects.filter(p => {
    if (!p.isCompleted) return true; // 未完成工程永遠顯示
    const pStart = p.projectStartDate;
    return pStart >= filterStart && pStart <= filterEnd; // 已完成工程才需篩選日期
  });

  // 未完成與已完成工程分流
  const incompleteProjects = filteredProjects.filter(p => !p.isCompleted);
  const completedProjects = filteredProjects.filter(p => p.isCompleted);
  const activeProjects = ganttTab === 'incomplete' ? incompleteProjects : completedProjects;

  // --- 甘特圖時間軸計算 ---
  // 找出當前顯示項目中的最早開始與最晚結束時間以決定畫面的 X 軸
  let timelineStart = filterStart;
  let timelineEnd = filterEnd;

  if (activeProjects.length > 0) {
    let minT = new Date(activeProjects[0].projectStartDate);
    let maxT = new Date(activeProjects[0].projectEndDate);
    activeProjects.forEach(p => {
      if (p.projectStartDate < minT) minT = p.projectStartDate;
      if (p.projectEndDate > maxT) maxT = p.projectEndDate;
    });
    // 向前後各自延伸 7 天，讓畫面比較好看
    minT.setDate(minT.getDate() - 7);
    maxT.setDate(maxT.getDate() + 7);
    timelineStart = minT;
    timelineEnd = maxT;
  }

  const totalDays = Math.max(1, Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24)));

  // 計算 X 軸上的日期刻度 (平均切成 5 個刻度)
  const timeTicks = [];
  for (let i = 0; i <= 4; i++) {
    const tickDate = new Date(timelineStart.getTime() + (totalDays * i / 4) * 24 * 60 * 60 * 1000);
    timeTicks.push(formatDateStr(tickDate));
  }

  // 計算特定日期在甘特圖時間軸的 Left 百分比
  const getLeftPercent = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 0;
    const diffTime = date - timelineStart;
    const percent = (diffTime / (1000 * 60 * 60 * 24 * totalDays)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  // 計算特定區間的 Width 百分比
  const getWidthPercent = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end - start;
    const days = Math.max(0.5, diffTime / (1000 * 60 * 60 * 24));
    const percent = (days / totalDays) * 100;
    return Math.max(0.5, Math.min(100 - getLeftPercent(startStr), percent));
  };

  // --- 圓餅圖統計計算 (開工與結案狀態，過去一年) ---
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const projectsInLastYear = parsedProjects.filter(p => {
    return p.projectStartDate >= oneYearAgo && p.projectStartDate <= new Date();
  });

  const completedCount = projectsInLastYear.filter(p => p.isCompleted).length;
  const incompleteCount = projectsInLastYear.filter(p => !p.isCompleted).length;

  const pieDataRaw = [
    { label: '進行中 / 未結案', count: incompleteCount, color: '#3b82f6' },
    { label: '已完成 / 已結案', count: completedCount, color: '#10b981' }
  ].filter(item => item.count > 0);

  const totalPieCount = completedCount + incompleteCount;

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

  // 產生 CSS conic-gradient
  const conicGradientStyle = pieData.length > 0
    ? `conic-gradient(${pieData.map(d => `${d.color} ${d.start}% ${d.end}%`).join(', ')})`
    : '#e2e8f0';

  // --- 操作按鈕與表單處理 ---

  // 處理新增工程檔案選擇
  const handleAddFileChange = async (e) => {
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
        setAddPreview(URL.createObjectURL(processedFile));
      } else {
        setAddPreview(null);
      }

      base64 = await fileToBase64(processedFile);

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

  // 處理編輯延伸工期檔案選擇
  const handleEditFileChange = async (e) => {
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
        setEditPreview(URL.createObjectURL(processedFile));
      } else {
        setEditPreview(null);
      }

      base64 = await fileToBase64(processedFile);

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

  // 處理結案檔案選擇
  const handleCompleteFileChange = async (e) => {
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
        setCompletePreview(URL.createObjectURL(processedFile));
      } else {
        setCompletePreview(null);
      }

      base64 = await fileToBase64(processedFile);

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

  // 開啟新增視窗
  const openAddModal = () => {
    setAddForm({
      uniqueId: generateUniqueCode(),
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
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
    setAddPreview(null);
    setIsAddModalOpen(true);
  };

  // 執行新增項目
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

      // 包裝主項目的 JSON content
      const contentObj = {
        notes: addForm.notes,
        phases: [
          {
            phaseIndex: 1,
            title: "第一工期 (主項目)",
            startDate: addForm.startDate.replace(/-/g, '/'),
            endDate: addForm.endDate.replace(/-/g, '/'),
            fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "", // 會被後端自動替換
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
        category: '工程',
        startDate: addForm.startDate,
        endDate: addForm.endDate,
        isUrgent: '',
        fileData,
        fileName,
        fileType,
        status: '未完成',
        operator: authService.getUser()?.name || 'Admin'
      };

      // 呼叫 API
      const response = await api.post('addBulletin', payload);
      if (response.success) {
        alert('工程項目新增成功！');
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

  // 開啟編輯(延伸工期)視窗
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

  // 執行編輯提交 (追加下一工期)
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

      // 建立新的延伸工期項目
      const newPhase = {
        phaseIndex: selectedProject.phases.length + 1,
        title: editForm.title,
        startDate: editForm.startDate.replace(/-/g, '/'),
        endDate: editForm.endDate.replace(/-/g, '/'),
        fileUrl: fileData ? "[LATEST_UPLOAD_URL]" : "",
        fileType: fileType,
        notes: editForm.notes || ''
      };

      // 串接新的工期
      const updatedPhases = [...selectedProject.phases, newPhase];

      // 更新主項目的總結束日期為所有工期的最晚時間
      let maxEnd = new Date(selectedProject.endDate);
      updatedPhases.forEach(p => {
        const pEnd = new Date(p.endDate);
        if (pEnd > maxEnd) maxEnd = pEnd;
      });

      const updatedContentObj = {
        notes: selectedProject.notes,
        phases: updatedPhases,
        completedInfo: selectedProject.completedInfo
      };

      const payload = {
        id: selectedProject.id,
        title: selectedProject.title,
        content: JSON.stringify(updatedContentObj),
        category: '工程',
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

  // 開啟結案視窗
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

  // 執行結案提交
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeForm.title || !completeForm.endDate) {
      alert('請填寫結案資訊');
      return;
    }

    setLoadingMessage('正在辦理工程結案與上傳驗收單，請稍候...');
    setLoading(true);
    try {
      const fileData = completeForm.fileData || '';
      const fileName = completeForm.fileName || '';
      const fileType = completeForm.fileType || '';

      // 設定結案資料
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
        category: '工程',
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
        alert('工程結案成功！');
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

  // 執行備註更新
  const handleUpdateNotes = async (project) => {
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
        setEditingProjectId(null);
        fetchData();
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

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '40px' }}>
      <LoadingOverlay show={loading} message={loadingMessage} />
      <Header title={siteTitle} />

      <main className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        {/* 返回按鈕與頁面標題 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
        }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <ArrowLeft size={20} /> 返回首頁
          </button>

          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '700' }}>
            🏗️ 工程進度追蹤系統
          </h2>

          {isAuthenticated && (
            <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={20} /> 新增工程項目
            </button>
          )}
        </div>

        {/* 統計圓餅圖與區間篩選 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px', marginBottom: '32px'
        }}>
          {/* 區間篩選工具列 */}
          <section style={{
            padding: '24px', backgroundColor: 'var(--bg-card)',
            borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
              📅 甘特圖篩選日期區間
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', width: '80px', color: 'var(--text-muted)' }}>開始區間</span>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', width: '80px', color: 'var(--text-muted)' }}>結束區間</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
              <button
                onClick={() => fetchData()}
                className="btn btn-primary"
                style={{ marginTop: '8px', width: '100%', py: '10px' }}
              >
                更新查詢
              </button>
            </div>
          </section>

          {/* 開始日期統計圓餅圖 */}
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
                (統計過去一年內開工的工程，共 {totalPieCount} 筆)
              </p>

              {/* 圖例說明 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                {pieData.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: d.color }}></div>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{d.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({d.count} 筆, {d.percent.toFixed(0)}%)</span>
                  </div>
                ))}
                {pieData.length === 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>過去一年無啟動之工程</div>
                )}
              </div>
            </div>

            {/* 圓餅圖圓圈 */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              backgroundImage: conicGradientStyle,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              position: 'relative', flexShrink: 0, margin: '0 auto'
            }}>
              {/* 圓心遮罩，做出 Donut 甜甜圈高級感 */}
              <div style={{
                position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%',
                borderRadius: '50%', backgroundColor: 'var(--bg-card)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}></div>
            </div>
          </section>
        </div>

        {/* 工程進度甘特圖區塊 */}
        <section style={{
          backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: '32px'
        }}>
          {/* 甘特圖分頁標籤 */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
            padding: '12px 24px 0 24px', gap: '8px'
          }}>
            <button
              onClick={() => setGanttTab('incomplete')}
              style={{
                padding: '10px 20px', border: 'none', borderBottom: ganttTab === 'incomplete' ? '3px solid var(--primary-color)' : '3px solid transparent',
                backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600',
                color: ganttTab === 'incomplete' ? 'var(--primary-color)' : '#64748b', fontSize: '0.95rem'
              }}
            >
              🛠️ 進行中 / 未完成工程 ({incompleteProjects.length})
            </button>
            <button
              onClick={() => setGanttTab('completed')}
              style={{
                padding: '10px 20px', border: 'none', borderBottom: ganttTab === 'completed' ? '3px solid var(--primary-color)' : '3px solid transparent',
                backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600',
                color: ganttTab === 'completed' ? 'var(--primary-color)' : '#64748b', fontSize: '0.95rem'
              }}
            >
              ✔️ 已完成 / 已結案工程 ({completedProjects.length})
            </button>
          </div>

          {/* 甘特圖主體 */}
          {activeProjects.length > 0 ? (
            <div style={{ overflowX: 'auto', padding: '24px' }}>
              <div style={{ minWidth: '800px', position: 'relative' }}>

                {/* 1. 甘特圖時間軸頭部 (日期刻度) */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '220px 1fr',
                  borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>工程項目名稱</div>
                  <div style={{ position: 'relative', height: '20px' }}>
                    {timeTicks.map((tick, index) => {
                      const leftPercent = (index / 4) * 100;
                      return (
                        <div
                          key={index}
                          style={{
                            position: 'absolute',
                            left: `${leftPercent}%`,
                            transform: index === 4 ? 'translateX(-100%)' : index > 0 ? 'translateX(-50%)' : 'none',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#64748b',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tick}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 甘特圖項目內容列 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeProjects.map(project => (
                    <div
                      key={project.id}
                      style={{
                        display: 'grid', gridTemplateColumns: '220px 1fr',
                        alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      {/* 左側：工程標題、識別碼與操作按鈕 */}
                      <div style={{ paddingRight: '16px' }}>
                        <div 
                          onClick={() => navigate(`/category/engineering/${project.id}`)}
                          style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '0.95rem', marginBottom: '2px', cursor: 'pointer', textDecoration: 'underline' }}
                          title="點擊查看工程歷程與明細"
                        >
                          {project.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
                          ID: {project.id}
                        </div>

                        {/* 備註微提示 */}
                        {project.notes && (
                          <div style={{
                            fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc',
                            padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid #cbd5e1',
                            marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }} title={project.notes}>
                            📝 {project.notes}
                          </div>
                        )}

                        {/* 管理操作按鈕 (僅登入時顯示) */}
                        {isAuthenticated && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {!project.isCompleted && (
                              <>
                                <button
                                  onClick={() => openEditModal(project)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Edit2 size={12} /> 延伸工期
                                </button>
                                <button
                                  onClick={() => openCompleteModal(project)}
                                  className="btn"
                                  style={{
                                    padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
                                    backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'
                                  }}
                                >
                                  <CheckCircle size={12} /> 結案
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 右側：甘特進度條軌道 */}
                      <div style={{ position: 'relative', height: '60px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        {/* 背景格線網格 */}
                        {[25, 50, 75].map((gridLine) => (
                          <div
                            key={gridLine}
                            style={{
                              position: 'absolute', left: `${gridLine}%`, top: 0, bottom: 0,
                              width: '1px', borderLeft: '1px dashed #e2e8f0', zIndex: 1
                            }}
                          ></div>
                        ))}

                        {/* 工期分段條 (呈現多工期) */}
                        {project.phases.map((phase, pIdx) => {
                          const left = getLeftPercent(phase.startDate);
                          const width = getWidthPercent(phase.startDate, phase.endDate);
                          // 根據工期給予不同的漸層色
                          const color = pIdx === 0
                            ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'  // 第一期為藍色
                            : 'linear-gradient(90deg, #10b981, #34d399)'; // 延伸工期為綠色

                          return (
                            <div
                              key={pIdx}
                              onClick={() => navigate(`/category/engineering/${project.id}`)}
                              style={{
                                position: 'absolute',
                                left: `${left}%`,
                                width: `${width}%`,
                                top: `${10 + pIdx * 16}px`, // 錯開高度以防重疊
                                height: '12px',
                                background: color,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                transition: 'transform 0.15s ease'
                              }}
                              title={`${phase.title}: ${phase.startDate} ~ ${phase.endDate}\n點擊查看工程歷程與明細`}
                              className="gantt-bar-segment"
                            >
                              {/* 懸停詳細浮動視窗的簡介標籤 */}
                              <span style={{
                                position: 'absolute', top: '-18px', left: '0', fontSize: '0.65rem',
                                color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px'
                              }}>
                                {phase.title}
                              </span>
                            </div>
                          );
                        })}

                        {/* 結案標記點 */}
                        {project.isCompleted && project.completedInfo && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${getLeftPercent(project.completedInfo.endDate)}%`,
                              top: '12px',
                              transform: 'translateX(-50%)',
                              zIndex: 15,
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                            title={`已結案: ${project.completedInfo.title}\n結束日期: ${project.completedInfo.endDate}`}
                          >
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              backgroundColor: '#166534', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '10px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ) : !loading && (
            <div style={{
              padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-card)'
            }}>
              📭 目前在此日期區間內沒有{ganttTab === 'incomplete' ? '進行中' : '已完成'}的工程項目。
            </div>
          )}
        </section>

        {/* 專案卡片詳細列表與檔案下載 */}
        <section>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '600' }}>
            📋 工程明細清單
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {activeProjects.map(project => (
              <div
                key={project.id}
                style={{
                  backgroundColor: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '16px',
                  padding: '24px', boxShadow: 'var(--shadow-sm)', position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'transform 0.2s', borderTop: project.isCompleted ? '4px solid #10b981' : '4px solid #3b82f6'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h4 
                      onClick={() => navigate(`/category/engineering/${project.id}`)}
                      style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                      title="點擊查看工程歷程與明細"
                    >
                      {project.title}
                    </h4>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                      backgroundColor: project.isCompleted ? '#dcfce7' : '#dbeafe',
                      color: project.isCompleted ? '#166534' : '#1e40af'
                    }}>
                      {project.isCompleted ? '已結案' : '未完成'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: 'monospace' }}>
                    工程唯一編號: {project.id}
                  </div>

                  {/* 聯絡人與廠商資訊 */}
                  {(project.contactPerson || project.contactPhone || project.vendorName || project.vendorPhone) && (
                    <div style={{
                      backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px',
                      fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px',
                      borderLeft: '4px solid #3b82f6', borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📞 聯絡與廠商資訊
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        {project.contactPerson && (
                          <div><span style={{ color: 'var(--text-muted)' }}>負責窗口：</span>{project.contactPerson}</div>
                        )}
                        {project.contactPhone && (
                          <div><span style={{ color: 'var(--text-muted)' }}>連絡電話：</span>{project.contactPhone}</div>
                        )}
                        {project.vendorName && (
                          <div><span style={{ color: 'var(--text-muted)' }}>廠商名稱：</span>{project.vendorName}</div>
                        )}
                        {project.vendorPhone && (
                          <div><span style={{ color: 'var(--text-muted)' }}>廠商電話：</span>{project.vendorPhone}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 備註與說明 (支援已登入者行內編輯) */}
                  {(project.notes || isAuthenticated) && (
                    <div style={{
                      backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px',
                      fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '16px',
                      borderLeft: '4px solid #cbd5e1', position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>工程備註說明：</strong>
                        {isAuthenticated && editingProjectId !== project.id && (
                          <button
                            onClick={() => {
                              setEditingProjectId(project.id);
                              setEditingNotes(project.notes || '');
                            }}
                            style={{
                              background: 'none', border: 'none', color: 'var(--primary-color)',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px',
                              padding: '2px 4px', fontSize: '0.75rem', fontWeight: '600'
                            }}
                          >
                            <Edit2 size={12} /> 編輯備註
                          </button>
                        )}
                      </div>

                      {editingProjectId === project.id ? (
                        <div style={{ marginTop: '8px' }}>
                          <textarea
                            rows={3}
                            value={editingNotes}
                            onChange={e => setEditingNotes(e.target.value)}
                            style={{
                              width: '100%', padding: '8px', borderRadius: '6px',
                              border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                              onClick={() => setEditingProjectId(null)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto' }}
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleUpdateNotes(project)}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto' }}
                            >
                              儲存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', color: project.notes ? '#4b5563' : '#9ca3af' }}>
                          {project.notes || '(目前無備註說明，可點選上方按鈕新增)'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 工期明細 */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> 歷程與工期明細
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {project.phases.map((phase, idx) => (
                        <div key={idx} style={{
                          backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.8rem',
                          display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: '#4b5563', marginRight: '6px' }}>
                                {phase.title}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {phase.startDate} ~ {phase.endDate}
                              </span>
                            </div>
                            {renderFileAttachment(phase.fileUrl, phase.fileType)}
                          </div>
                          {phase.notes && (
                            <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: '2px', borderLeft: '2px solid #cbd5e1', paddingLeft: '8px' }}>
                              📌 工期備註：{phase.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 結案資訊 */}
                  {project.isCompleted && project.completedInfo && (
                    <div style={{
                      backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                      padding: '12px', fontSize: '0.85rem', color: '#166534', marginTop: '12px'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '4px' }}>🏁 {project.completedInfo.title}</div>
                      <div>實際竣工日期：{project.completedInfo.endDate}</div>
                      {project.completedInfo.notes && (
                        <div style={{ marginTop: '6px', fontSize: '0.85rem', borderLeft: '3px solid #166534', paddingLeft: '8px', color: '#166534', marginBottom: '8px' }}>
                          備註：{project.completedInfo.notes}
                        </div>
                      )}
                      {renderFileAttachment(project.completedInfo.fileUrl, project.completedInfo.fileType)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 彈窗 A：新增工程項目 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="🏗️ 新增工程追蹤項目"
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>工程唯一碼</label>
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
              placeholder="請輸入工程項目標題"
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>上傳合約 / 施工圖檔案</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="file"
                id="add-file-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleAddFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="add-file-upload" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
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

          {/* 負責窗口與聯絡電話 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>負責窗口</label>
              <input
                type="text"
                value={addForm.contactPerson || ''}
                onChange={e => setAddForm({ ...addForm, contactPerson: e.target.value })}
                placeholder="請輸入負責窗口姓名"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>連絡電話</label>
              <input
                type="text"
                value={addForm.contactPhone || ''}
                onChange={e => setAddForm({ ...addForm, contactPhone: e.target.value })}
                placeholder="請輸入連絡電話"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          {/* 廠商名稱與廠商電話 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>廠商名稱</label>
              <input
                type="text"
                value={addForm.vendorName || ''}
                onChange={e => setAddForm({ ...addForm, vendorName: e.target.value })}
                placeholder="請輸入廠商名稱"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>廠商電話</label>
              <input
                type="text"
                value={addForm.vendorPhone || ''}
                onChange={e => setAddForm({ ...addForm, vendorPhone: e.target.value })}
                placeholder="請輸入廠商電話"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600' }}>備註 / 工程說明</label>
            <textarea
              rows={4}
              value={addForm.notes || ''}
              onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="請輸入工程的備註或延伸說明..."
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
                id="edit-file-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleEditFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="edit-file-upload" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
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
        title={selectedProject ? `🏁 工程項目結案: ${selectedProject.title}` : '工程項目結案'}
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
                id="complete-file-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleCompleteFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="complete-file-upload" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
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
            <button type="submit" className="btn" style={{ backgroundColor: '#166534', color: 'white', border: 'none' }}>辦理結案</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EngineeringPage;
