import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { 
    Wrench, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    User, 
    Phone, 
    MapPin, 
    FileText, 
    Send,
    Shield,
    FileCheck,
    MessageSquare,
    Search,
    ChevronDown,
    ChevronUp,
    CornerDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUp
} from 'lucide-react';
import '../styles/main.css';

// ================= Fallback 模擬測試資料 =================
const MOCK_TICKETS = [
    {
        id: 'REP20260706143000',
        category: '水電設備',
        location: 'B棟地下室',
        description: 'B棟地下室天花板嚴重漏水，水流已漫延至通道。',
        reporter: '陳**',
        phone: '0912***456',
        email: 'abc***@gmail.com',
        status: '處理中',
        date: '2026/07/06',
        createdTime: '2026/07/06 09:00:00',
        operator: '管理員'
    },
    {
        id: 'REP20260706101500',
        category: '公共設施',
        location: '一樓中庭花園',
        description: '中庭兒童遊戲區滑梯邊角有些微裂開，恐刮傷小朋友。',
        reporter: '林**',
        phone: '0933***888',
        email: 'lin***@gmail.com',
        status: '待處理',
        date: '2026/07/06',
        createdTime: '2026/07/06 10:15:00',
        operator: '林**'
    },
    {
        id: 'REP20260705080000',
        category: '電梯設備',
        location: 'A棟客梯',
        description: 'A棟客梯關門速度異常緩慢且發出異音。',
        reporter: '王**',
        phone: '0928***111',
        email: 'wang***@gmail.com',
        status: '已結案',
        date: '2026/07/05',
        createdTime: '2026/07/05 08:00:00',
        operator: '管理員'
    },
    {
        id: 'REP20260704090000',
        category: '安全消防',
        location: 'C棟防空避難室',
        description: '避難室手動滅火器外殼銹蝕，且指針偏向紅色洩壓區。',
        reporter: '黃**',
        phone: '0975***222',
        email: 'huang***@gmail.com',
        status: '處理中',
        date: '2026/07/04',
        createdTime: '2026/07/04 09:00:00',
        operator: '管理員'
    },
    {
        id: 'REP20260703110000',
        category: '水電設備',
        location: 'D棟梯廳',
        description: 'D棟5樓西側樓梯間緊急出口指示燈閃爍不亮。',
        reporter: '張**',
        phone: '0911***999',
        email: 'chang***@gmail.com',
        status: '待處理',
        date: '2026/07/03',
        createdTime: '2026/07/03 11:00:00',
        operator: '張**'
    },
    {
        id: 'REP20260702153000',
        category: '公共設施',
        location: '社區大門警衛室旁',
        description: '警衛室旁公告欄玻璃拉門滑軌卡住，無法順利拉開。',
        reporter: '許**',
        phone: '0988***555',
        email: 'hsu***@gmail.com',
        status: '待料',
        date: '2026/07/02',
        createdTime: '2026/07/02 15:30:00',
        operator: '管理員'
    },
    {
        id: 'REP20260701140000',
        category: '電梯設備',
        location: 'B棟客梯',
        description: 'B棟客梯車廂內緊急通話對講機無聲。',
        reporter: '趙**',
        phone: '0937***111',
        email: 'chao***@gmail.com',
        status: '處理中',
        date: '2026/07/01',
        createdTime: '2026/07/01 14:00:00',
        operator: '管理員'
    },
    {
        id: 'REP20260630090000',
        category: '水電設備',
        location: '中庭花園走廊',
        description: '走廊第二盞景觀矮燈玻璃破碎。',
        reporter: '廖**',
        phone: '0919***888',
        email: 'liao***@gmail.com',
        status: '待處理',
        date: '2026/06/30',
        createdTime: '2026/06/30 09:00:00',
        operator: '廖**'
    },
    {
        id: 'REP20260629160000',
        category: '安全消防',
        location: 'E棟地下二樓',
        description: '排風機發出尖銳高頻摩擦音。',
        reporter: '古**',
        phone: '0987***777',
        email: 'ku***@gmail.com',
        status: '處理中',
        date: '2026/06/29',
        createdTime: '2026/06/29 16:00:00',
        operator: '管理員'
    },
    {
        id: 'REP20260628103000',
        category: '公共設施',
        location: '韻律教室',
        description: '落地鏡面左下角有小裂痕。',
        reporter: '曾**',
        phone: '0922***333',
        email: 'tseng***@gmail.com',
        status: '待料',
        date: '2026/06/28',
        createdTime: '2026/06/28 10:30:00',
        operator: '管理員'
    },
    {
        id: 'REP20260627110000',
        category: '水電設備',
        location: 'A棟地下室',
        description: '地下室集水坑抽水馬達異常發熱。',
        reporter: '謝**',
        phone: '0936***444',
        email: 'hsieh***@gmail.com',
        status: '待處理',
        date: '2026/06/27',
        createdTime: '2026/06/27 11:00:00',
        operator: '謝**'
    }
];

const INITIAL_MOCK_LOGS = {
    'REP20260706143000': [
        {
            logId: 'LOG20260706090000',
            ticketId: 'REP20260706143000',
            operator: '系統',
            operatorLevel: 0,
            content: 'B棟地下室天花板嚴重漏水，水流已漫延至通道。 (狀態: 待處理)',
            statusChange: '待處理',
            timestamp: '2026/07/06 09:00:00'
        },
        {
            logId: 'LOG20260706101500',
            ticketId: 'REP20260706143000',
            operator: '陳**',
            operatorLevel: 1,
            content: '除了漏水，旁邊的燈管好像也短路不亮了，請一併確認。',
            statusChange: '',
            timestamp: '2026/07/06 10:15:00'
        },
        {
            logId: 'LOG20260706143000_rep',
            ticketId: 'REP20260706143000',
            operator: '管理員',
            operatorLevel: 99,
            content: '已聯絡水電阿伯，預計明日上午前往查看，請住戶注意安全。',
            statusChange: '處理中',
            timestamp: '2026/07/06 14:30:00'
        }
    ],
    'REP20260706101500': [
        {
            logId: 'LOG20260706101501',
            ticketId: 'REP20260706101500',
            operator: '系統',
            operatorLevel: 0,
            content: '中庭兒童遊戲區滑梯邊角有些微裂開，恐刮傷小朋友。 (狀態: 待處理)',
            statusChange: '待處理',
            timestamp: '2026/07/06 10:15:00'
        }
    ],
    'REP20260705080000': [
        {
            logId: 'LOG20260705080001',
            ticketId: 'REP20260705080000',
            operator: '系統',
            operatorLevel: 0,
            content: 'A棟客梯關門速度異常緩慢且發出異音。 (狀態: 待處理)',
            statusChange: '待處理',
            timestamp: '2026/07/05 08:00:00'
        },
        {
            logId: 'LOG20260705100000',
            ticketId: 'REP20260705080000',
            operator: '管理員',
            operatorLevel: 99,
            content: '已安排保養廠技師前來調整關門連桿與上油潤滑。',
            statusChange: '處理中',
            timestamp: '2026/07/05 10:00:00'
        },
        {
            logId: 'LOG20260705140000',
            ticketId: 'REP20260705080000',
            operator: '管理員',
            operatorLevel: 99,
            content: '技師已調整完畢，經現場來回測試三次運作正常，予以結案。',
            statusChange: '已結案',
            timestamp: '2026/07/05 14:00:00'
        }
    ]
};

const RepairPage = () => {
    const navigate = useNavigate();
    
    // 登入狀態與層級
    const [currentUser, setCurrentUser] = useState(null);
    const [userLevel, setUserLevel] = useState(0); // 預設訪客 (0)
    
    // 管理員切換 Tab (住戶檢視模式 vs 管理員主控台)
    const [isAdminConsole, setIsAdminConsole] = useState(false);
    
    // RWD 視窗偵測
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 資料狀態
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Fallback 模擬狀態
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackTickets, setFallbackTickets] = useState(MOCK_TICKETS);
    const [fallbackLogs, setFallbackLogs] = useState(INITIAL_MOCK_LOGS);

    // 分頁狀態
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 前台分類篩選狀態：'active' (未結案), 'closed' (已結案), 'all' (全部)
    const [filterMode, setFilterMode] = useState('active');

    // 選取的案件狀態 (最下方 Table 顯示用)
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketLogs, setTicketLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // 回覆輸入狀態
    const [replyContent, setReplyContent] = useState('');
    const [replyStatusChange, setReplyStatusChange] = useState(''); // 管理員變更狀態用

    // 篩選與搜尋狀態 (管理員主控台專用)
    const [statusFilter, setStatusFilter] = useState('active'); // active, all, 待處理, 處理中, 待料
    const [searchQuery, setSearchQuery] = useState('');

    // 新增報修表單狀態
    const [formData, setFormData] = useState({
        category: '水電設備',
        location: '',
        description: '',
        reporter: '',
        phone: '',
        email: ''
    });

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // 初始化與權限檢查
    useEffect(() => {
        const user = authService.getUser();
        const level = authService.getUserLevel();
        
        setCurrentUser(user);
        setUserLevel(level);
        
        // 若為管理員，預設開啟管理員主控台
        if (level >= 99) {
            setIsAdminConsole(true);
        }
        
        // 預設將登入者姓名填入申報人
        if (user) {
            setFormData(prev => ({
                ...prev,
                reporter: user.name || ''
            }));
        }

        // 監聽視窗 RWD
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        
        // 載入報修單資料
        fetchTickets(user ? user.username : '');

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 當 fallbackTickets 改變且處於 fallback 模式時，更新 tickets 狀態
    useEffect(() => {
        if (isFallback) {
            // 前端過濾：不管有無登入，前台（以及住戶檢視模式）均回傳全部 fallbackTickets
            setTickets(fallbackTickets);
        }
    }, [fallbackTickets, isFallback]);

    // 取得報修單主表
    const fetchTickets = async (username) => {
        setLoading(true);
        try {
            const res = await api.getRepairTickets(username);
            if (res.success) {
                setTickets(res.tickets || []);
                setIsFallback(false);
            } else {
                if (res.message && (res.message.includes('Unknown action') || res.message.includes('Server Error'))) {
                    console.log('GAS 後端尚未更新，啟用前端測試 Fallback 模式');
                    setIsFallback(true);
                } else {
                    console.error(res.message);
                }
            }
        } catch (error) {
            console.log('API 連線失敗，啟用前端測試 Fallback 模式', error);
            setIsFallback(true);
        } finally {
            setLoading(false);
        }
    };

    // 取得單筆報修歷程 logs
    const fetchTicketLogs = async (ticketId) => {
        setLogsLoading(true);
        if (isFallback) {
            setTimeout(() => {
                setTicketLogs(fallbackLogs[ticketId] || []);
                setLogsLoading(false);
            }, 300);
            return;
        }

        try {
            const res = await api.getRepairLogs(ticketId);
            if (res.success) {
                setTicketLogs(res.logs || []);
            }
        } catch (error) {
            console.error('載入歷程失敗', error);
        } finally {
            setLogsLoading(false);
        }
    };

    // 點擊列表中的項目
    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setReplyContent('');
        setReplyStatusChange(ticket.status);
        fetchTicketLogs(ticket.id);
        
        // 平滑滾動到底部詳細資料區
        if (!isAdminConsole) {
            setTimeout(() => {
                const detailEl = document.getElementById('repair-detail-section');
                if (detailEl) {
                    detailEl.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    // 回滾到上方表格
    const handleScrollToTable = () => {
        const tableEl = document.getElementById('repair-list-section');
        if (tableEl) {
            tableEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 格式化時間
    const getFormattedTime = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    // 住戶提交新報修
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (userLevel < 1) {
            alert('請先登入系統');
            return;
        }
        if (!formData.location || !formData.description || !formData.reporter || !formData.phone) {
            alert('請填寫所有必填欄位');
            return;
        }

        setSubmitting(true);
        
        // 1. Fallback 模擬提交邏輯
        if (isFallback) {
            setTimeout(() => {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, '0');
                const ticketId = `REP${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
                
                const newTicket = {
                    id: ticketId,
                    category: formData.category,
                    location: formData.location,
                    description: formData.description,
                    reporter: formData.reporter,
                    phone: formData.phone.substring(0, 4) + '***' + formData.phone.substring(formData.phone.length - 3),
                    email: formData.email ? (formData.email.split('@')[0].substring(0, 3) + '***@' + formData.email.split('@')[1]) : '',
                    status: '待處理',
                    date: `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`,
                    createdTime: getFormattedTime(),
                    operator: formData.reporter
                };

                const initialLog = {
                    logId: `LOG${ticketId.substring(3)}`,
                    ticketId: ticketId,
                    operator: '系統',
                    operatorLevel: 0,
                    content: `${formData.description} (狀態：待處理)`,
                    statusChange: '待處理',
                    timestamp: getFormattedTime()
                };

                setFallbackTickets(prev => [newTicket, ...prev]);
                setFallbackLogs(prev => ({
                    ...prev,
                    [ticketId]: [initialLog]
                }));

                setSuccessMessage(`【模擬成功】報修單已建立！單號為：${ticketId}。\n系統已發送 Email 通知信至您填寫的信箱。`);
                setIsSuccessModalOpen(true);
                setSubmitting(false);

                // 重設表單
                setFormData({
                    category: '水電設備',
                    location: '',
                    description: '',
                    reporter: currentUser ? currentUser.name : '',
                    phone: '',
                    email: ''
                });
                
                setFilterMode('active'); // 返回未結案
                setCurrentPage(1); // 返回第一頁
            }, 800);
            return;
        }

        // 2. 真實 API 提交邏輯
        try {
            const ticketData = {
                username: currentUser.username,
                category: formData.category,
                location: formData.location,
                description: formData.description,
                reporter: formData.reporter,
                phone: formData.phone,
                email: formData.email
            };

            const res = await api.addRepairTicket(ticketData);
            if (res.success) {
                setSuccessMessage(`報修單已成功建立！單號為：${res.ticketId}。我們已寄送通知信，並將盡速為您處理。`);
                setIsSuccessModalOpen(true);
                
                // 重設表單
                setFormData({
                    category: '水電設備',
                    location: '',
                    description: '',
                    reporter: currentUser ? currentUser.name : '',
                    phone: '',
                    email: ''
                });

                // 重新載入列表
                fetchTickets(currentUser.username);
                setFilterMode('active');
                setCurrentPage(1);
            } else {
                alert('提交失敗：' + res.message);
            }
        } catch (error) {
            alert('提交發生錯誤，請稍後再試');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // 住戶送出補充說明，或管理員送出回覆與變更狀態
    const handleSubmitReply = async (ticket, isDirectClose = false) => {
        if (userLevel < 1) {
            alert('請先登入系統');
            return;
        }
        
        if (!isDirectClose && !replyContent.trim()) {
            alert('請輸入回覆或說明內容');
            return;
        }

        setSubmitting(true);
        const finalStatus = isDirectClose ? '已結案' : (userLevel >= 99 ? replyStatusChange : '');
        const finalContent = isDirectClose 
            ? '管理員已現場處理完成，直接予以結案。' 
            : replyContent;

        // 1. Fallback 模擬回覆邏輯
        if (isFallback) {
            setTimeout(() => {
                const now = new Date();
                const logId = `LOG${now.getTime()}`;
                
                const newLog = {
                    logId: logId,
                    ticketId: ticket.id,
                    operator: currentUser.name,
                    operatorLevel: userLevel,
                    content: finalContent,
                    statusChange: finalStatus,
                    timestamp: getFormattedTime()
                };

                // 更新 logs
                setFallbackLogs(prev => ({
                    ...prev,
                    [ticket.id]: [...(prev[ticket.id] || []), newLog]
                }));

                // 更新主檔狀態
                setFallbackTickets(prev => prev.map(t => {
                    if (t.id === ticket.id) {
                        return {
                            ...t,
                            status: finalStatus || t.status,
                            operator: currentUser.name
                        };
                    }
                    return t;
                }));

                // 同步更新當前選取案件內的歷程與狀態
                setTicketLogs(prev => [...prev, newLog]);
                
                // 更新 selectedTicket 物件狀態本身
                setSelectedTicket(prev => {
                    if (prev && prev.id === ticket.id) {
                        return {
                            ...prev,
                            status: finalStatus || prev.status,
                            operator: currentUser.name
                        };
                    }
                    return prev;
                });

                setReplyContent('');
                setSubmitting(false);

                if (isDirectClose) {
                    alert('【模擬成功】已快速結案並發信通知申報人！');
                } else {
                    alert('【模擬成功】已送出回覆，系統已發信通知。');
                }
            }, 600);
            return;
        }

        // 2. 真實 API 回覆邏輯
        try {
            const logData = {
                username: currentUser.username,
                ticketId: ticket.id,
                operatorName: currentUser.name,
                content: finalContent,
                statusChange: finalStatus
            };

            const res = await api.addRepairLog(logData);
            if (res.success) {
                await fetchTicketLogs(ticket.id);
                
                // 同步更新選中的狀態
                setSelectedTicket(prev => {
                    if (prev && prev.id === ticket.id) {
                        return {
                            ...prev,
                            status: finalStatus || prev.status
                        };
                    }
                    return prev;
                });

                await fetchTickets(currentUser.username);
                setReplyContent('');
            } else {
                alert('更新失敗：' + res.message);
            }
        } catch (error) {
            alert('更新發生錯誤，請稍後再試');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
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
            case '待料':
                return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' };
            default:
                return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    // 統計各項筆數
    const activeCount = tickets.filter(t => t.status !== 'ignore' && t.status !== '已結案').length;
    const closedCount = tickets.filter(t => t.status === 'ignore' ? false : t.status === '已結案').length;
    const allCount = tickets.length;

    // 統計個人報修筆數
    const getMyTickets = () => {
        if (!currentUser) return [];
        const maskedName = currentUser.name ? (currentUser.name.substring(0, 1) + '**') : '';
        return tickets.filter(t => 
            t.reporter === currentUser.name || 
            t.reporter === maskedName
        );
    };

    const myTickets = getMyTickets();

    // 前台資料分類過濾
    const getFilteredTickets = () => {
        if (filterMode === 'active') {
            return tickets.filter(t => t.status !== '已結案');
        } else if (filterMode === 'closed') {
            return tickets.filter(t => t.status === '已結案');
        }
        return tickets;
    };

    const filteredTickets = getFilteredTickets();

    // 取得當前頁面資料 (Pagination 處理)
    const getPaginatedTickets = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTickets.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    // 管理員後台資料篩選與搜尋
    const getFilteredAdminTickets = () => {
        return tickets.filter(ticket => {
            // 1. 狀態篩選
            if (statusFilter === 'active' && ticket.status === '已結案') return false;
            if (statusFilter !== 'all' && statusFilter !== 'active' && ticket.status !== statusFilter) return false;
            
            // 2. 搜尋字串篩選
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchId = ticket.id.toLowerCase().includes(query);
                const matchLoc = ticket.location.toLowerCase().includes(query);
                const matchCat = ticket.category.toLowerCase().includes(query);
                return matchId || matchLoc || matchCat;
            }
            return true;
        });
    };

    const adminTickets = getFilteredAdminTickets();

    // 處理分類按鈕切換
    const handleFilterChange = (mode) => {
        setFilterMode(mode);
        setCurrentPage(1);
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="社區線上報修系統" />
            
            {/* 頂部管理員切換 Tab */}
            {userLevel >= 99 && (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '8px 16px',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => {
                            setIsAdminConsole(false);
                            setCurrentPage(1);
                            setSelectedTicket(null);
                        }}
                        className={`btn ${!isAdminConsole ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 24px', fontSize: '0.95rem' }}
                    >
                        住戶檢視模式
                    </button>
                    <button
                        onClick={() => {
                            setIsAdminConsole(true);
                            setSelectedTicket(null);
                        }}
                        className={`btn ${isAdminConsole ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 24px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Shield size={16} /> 管理員主控台
                    </button>
                </div>
            )}

            <main style={{ flex: 1, padding: isMobile ? '24px 16px' : '32px 40px', maxWidth: '100%', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                
                {/* 1. 住戶 / 訪客模式畫面 */}
                {!isAdminConsole ? (
                    <>
                        {/* 頂部主題橫幅 - 琥珀金至工程橘漸層 */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderRadius: '20px',
                            padding: '40px 24px',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            marginBottom: '32px',
                            boxShadow: '0 10px 25px -5px rgba(217, 119, 6, 0.3)'
                        }}>
                            <Wrench size={48} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '700' }}>公共設施修繕申報處</h2>
                            <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                                凡發現社區中庭、電梯、走廊、安全通道等公設有故障損壞，歡迎在此提交。已登入住戶可隨時補充說明並追蹤進度。
                            </p>
                        </div>

                        {/* Fallback 模擬中提示 */}
                        {isFallback && (
                            <div style={{
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                color: '#1e40af',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                marginBottom: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Shield size={18} color="#2563eb" />
                                <span>【系統提示】目前處於前端測試模擬模式（GAS 後端尚未更新，已啟用本機 Fallback 測試資料，支援全部模擬操作）。</span>
                            </div>
                        )}

                        
                            {userLevel >= 1 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: '32px',
                                marginBottom: '32px'
                            }}>
                                {/* 左欄：填寫新報修單表單 */}
                                <div style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                    height: 'fit-content'
                                }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Send size={20} color="#d97706" />
                                        填寫新報修單
                                    </h3>
                                    
                                    <form onSubmit={handleSubmitTicket}>
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
                                                <option value="水電設備">水電設備 (路燈、公共照明、抽水馬達)</option>
                                                <option value="電梯設備">電梯設備 (客梯、貨梯、電梯內面板)</option>
                                                <option value="公共設施">公共設施 (大廳、健身房、遊戲區、座椅、中庭)</option>
                                                <option value="安全消防">安全消防 (滅火器、消防栓、監控攝影機)</option>
                                                <option value="其他">其他公設損壞</option>
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
                                                    placeholder="例如：B棟中庭走廊、地下二樓A區3號電梯口"
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
                                                狀況詳細描述 <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <textarea 
                                                name="description"
                                                placeholder="請具體說明故障損壞情況..."
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
                                        <div style={{ marginBottom: '16px' }}>
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

                                        {/* 聯絡 Email (非必填，填寫後可收發信) */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                                Email 通知信箱 (選填)
                                            </label>
                                            <input 
                                                type="email"
                                                name="email"
                                                placeholder="填寫後狀態變更將會收到 Email 通知"
                                                value={formData.email}
                                                onChange={handleInputChange}
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
                                                backgroundColor: submitting ? '#fbd38d' : '#d97706',
                                                color: '#FFFFFF',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                border: 'none',
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 4px 6px rgba(217, 119, 6, 0.2)',
                                                transition: 'transform 0.1s, background-color 0.2s',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                            onMouseUp={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            {submitting ? '送出中...' : '送出申報單'}
                                        </button>
                                    </form>
                                </div>


                                {/* 右欄：我的報修紀錄卡片 */}
                                <div style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                    height: 'fit-content',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={20} color="#d97706" />
                                        我的報修紀錄
                                    </h3>
                                    
                                    {myTickets.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            您目前尚無報修紀錄。
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>單號</th>
                                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>類別</th>
                                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>故障位置</th>
                                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', width: '80px' }}>狀態</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myTickets.map((t) => {
                                                        const statusStyle = getStatusStyle(t.status);
                                                        const isSelected = selectedTicket && selectedTicket.id === t.id;
                                                        return (
                                                            <tr 
                                                                key={t.id} 
                                                                onClick={() => handleSelectTicket(t)}
                                                                style={{ 
                                                                    borderBottom: '1px solid #f1f5f9', 
                                                                    cursor: 'pointer',
                                                                    backgroundColor: isSelected ? '#fffbeb' : '#FFFFFF'
                                                                }}
                                                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                                                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                                            >
                                                                <td style={{ padding: '10px 12px', fontWeight: '600' }}>{t.id}</td>
                                                                <td style={{ padding: '10px 12px' }}>{t.category}</td>
                                                                <td style={{ padding: '10px 12px' }}>{t.location}</td>
                                                                <td style={{ padding: '10px 12px' }}>
                                                                    <span style={{
                                                                        fontSize: '0.65rem',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: statusStyle.bg,
                                                                        color: statusStyle.text,
                                                                        border: '1px solid ' + statusStyle.border,
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {t.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                            {/* 社區報修資料列表 (獨立於 Grid 之外，以 100% 寬度拉滿顯示) */}
                        <div 
                            id="repair-list-section"
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '20px',
                                padding: '28px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                width: '100%',
                                boxSizing: 'border-box',
                                marginBottom: '32px'
                            }}
                        >
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} color="#d97706" />
                                    社區報修資料列表
                                </h3>

                                {/* 分類篩選按鈕列 */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => handleFilterChange('active')}
                                        className={`btn ${filterMode === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Clock size={15} />
                                        未結案 ({activeCount} 筆)
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('closed')}
                                        className={`btn ${filterMode === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <CheckCircle size={15} />
                                        已結案 ({closedCount} 筆)
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('all')}
                                        className={`btn ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <FileText size={15} />
                                        全部資料 ({allCount} 筆)
                                    </button>
                                </div>
                                
                                {loading && !isFallback ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', flex: 1 }}>
                                        資料載入中，請稍候...
                                    </div>
                                ) : filteredTickets.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', flex: 1 }}>
                                        目前此分類下無報修紀錄。
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
                                        {/* 表格 */}
                                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', width: '140px' }}>單號</th>
                                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', width: '100px' }}>發起日期</th>
                                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', width: '110px' }}>分類</th>
                                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>地點</th>
                                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', width: '95px' }}>狀態</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getPaginatedTickets().map((ticket) => {
                                                        const isSelected = selectedTicket && selectedTicket.id === ticket.id;
                                                        const statusStyle = getStatusStyle(ticket.status);
                                                        return (
                                                            <tr 
                                                                key={ticket.id} 
                                                                onClick={() => handleSelectTicket(ticket)}
                                                                style={{ 
                                                                    borderBottom: '1px solid #f1f5f9', 
                                                                    cursor: 'pointer',
                                                                    backgroundColor: isSelected ? '#fffbeb' : '#FFFFFF',
                                                                    transition: 'background-color 0.15s'
                                                                }}
                                                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                                                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                                            >
                                                                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{ticket.id}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b' }}>{ticket.date}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#1e293b', fontWeight: '500' }}>{ticket.category}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>{ticket.location}</td>
                                                                <td style={{ padding: '12px 16px' }}>
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: statusStyle.bg,
                                                                        color: statusStyle.text,
                                                                        border: `1px solid ${statusStyle.border}`,
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {ticket.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* 分頁按鈕 UI */}
                                        {totalPages > 1 && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderTop: '1px solid #e2e8f0',
                                                paddingTop: '16px',
                                                marginTop: 'auto'
                                            }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                    頁次：<strong>{currentPage} / {totalPages}</strong> 頁，共 {filteredTickets.length} 筆案件
                                                </span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentPage(prev => Math.max(prev - 1, 1));
                                                        }}
                                                        disabled={currentPage === 1}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <ArrowLeft size={14} /> 上一頁
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                                        }}
                                                        disabled={currentPage === totalPages}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        下一頁 <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* 住戶端：最下方顯示詳細資料與處理歷程 */}
                        {selectedTicket && (
                            <div 
                                id="repair-detail-section"
                                className="fade-in"
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                    marginTop: '32px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Wrench size={22} color="var(--primary-color)" />
                                        案件詳細資料與處理歷程
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={handleScrollToTable} 
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '6px 14px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                borderColor: 'var(--primary-color)',
                                                color: 'var(--primary-color)'
                                            }}
                                        >
                                            <ArrowUp size={14} /> 回到上方表格
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTicket(null)} 
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                        >
                                            收合詳細內容
                                        </button>
                                    </div>
                                </div>

                                {/* 主檔資料 Table */}
                                <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                                        <tbody>
                                            <tr>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', width: '140px', fontWeight: '600', color: '#475569' }}>報修單號</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#1e293b' }}>{selectedTicket.id}</td>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', width: '140px', fontWeight: '600', color: '#475569' }}>發起日期</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.date}</td>
                                            </tr>
                                            <tr>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>項目分類</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.category}</td>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>故障位置</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.location}</td>
                                            </tr>
                                            <tr>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>申報人姓名</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.reporter}</td>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>聯絡電話</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.phone || '無'}</td>
                                            </tr>
                                            <tr>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>目前狀態</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: getStatusStyle(selectedTicket.status).bg,
                                                        color: getStatusStyle(selectedTicket.status).text,
                                                        border: `1px solid ${getStatusStyle(selectedTicket.status).border}`,
                                                        fontWeight: '700'
                                                    }}>
                                                        {selectedTicket.status}
                                                    </span>
                                                </td>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>通知信箱</th>
                                                <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{selectedTicket.email || '無'}</td>
                                            </tr>
                                            <tr>
                                                <th style={{ backgroundColor: '#f8fafc', padding: '12px 16px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>狀況詳細描述</th>
                                                <td colSpan={3} style={{ padding: '16px', border: '1px solid #cbd5e1', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#334155' }}>
                                                    {selectedTicket.description}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* 處理歷程 Timeline */}
                                <div style={{ marginBottom: '28px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageSquare size={18} color="var(--primary-color)" />
                                        處置歷程時間軸
                                    </h4>

                                    {logsLoading ? (
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', paddingLeft: '8px' }}>載入歷程中...</div>
                                    ) : ticketLogs.length === 0 ? (
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', paddingLeft: '8px' }}>目前尚無處理歷程。</div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '18px',
                                            borderLeft: '2px solid #cbd5e1',
                                            paddingLeft: '20px',
                                            marginLeft: '6px'
                                        }}>
                                            {ticketLogs.map((log) => {
                                                const isSystem = log.operatorLevel === 0;
                                                const isUser = log.operatorLevel === 1;
                                                const isAdmin = log.operatorLevel >= 99;
                                                
                                                let roleBadge = '系統';
                                                let badgeColor = '#64748b';
                                                if (isUser) {
                                                    roleBadge = '住戶';
                                                    badgeColor = '#d97706';
                                                } else if (isAdmin) {
                                                    roleBadge = '管理員';
                                                    badgeColor = '#3b82f6';
                                                }

                                                return (
                                                    <div key={log.logId} style={{ position: 'relative' }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '-27px',
                                                            top: '4px',
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            backgroundColor: badgeColor,
                                                            border: '2px solid #FFFFFF'
                                                        }} />
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                                                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{log.operator}</strong>
                                                                <span style={{
                                                                    fontSize: '0.65rem',
                                                                    backgroundColor: roleBadge === '系統' ? '#f1f5f9' : (roleBadge === '住戶' ? '#fffbeb' : '#eff6ff'),
                                                                    color: badgeColor,
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>{roleBadge}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.timestamp}</span>
                                                            </div>
                                                            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                                                                {log.content}
                                                            </p>
                                                            {log.statusChange && (
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '2px 8px', borderRadius: '4px', marginTop: '4px' }}>
                                                                    <CornerDownRight size={11} />
                                                                    <span>推進狀態：</span>
                                                                    <strong style={{ color: getStatusStyle(log.statusChange).text }}>{log.statusChange}</strong>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* 補充說明操作區 (僅已登入住戶且案件未結案時顯示) */}
                                {userLevel >= 1 && selectedTicket.status !== '已結案' && (
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>
                                            針對此案件進行補充說明：
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text"
                                                placeholder="請在此輸入補充文字內容..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                onClick={() => handleSubmitReply(selectedTicket, false)}
                                                disabled={submitting}
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '12px 24px',
                                                    fontSize: '0.9rem',
                                                    backgroundColor: '#d97706',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Send size={15} /> 送出說明
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* 2. 管理員主控台介面 (Action Page) */
                    <div className="fade-in">
                        {/* 頂部管理員標題 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: 'var(--primary-color)', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={28} /> 安全報修管制台
                            </h2>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                權限管理員：{currentUser ? currentUser.name : ''} (層級：{userLevel})
                            </div>
                        </div>

                        {/* Fallback 模擬中提示 (管理員) */}
                        {isFallback && (
                            <div style={{
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                color: '#1e40af',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Shield size={18} color="#2563eb" />
                                <span>【系統提示】目前處於前端測試模擬模式（GAS 後端尚未更新，已啟用本機 Fallback 測試資料，支援全部模擬操作）。</span>
                            </div>
                        )}

                        {/* 篩選與搜尋面板 */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                            marginBottom: '24px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: '16px'
                        }}>
                            {/* 狀態切換 */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setStatusFilter('active')}
                                    className={`btn ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                >
                                    進行中 (預設)
                                </button>
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                >
                                    全部
                                </button>
                                <button
                                    onClick={() => setStatusFilter('待處理')}
                                    className={`btn ${statusFilter === '待處理' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                >
                                    待處理 ({tickets.filter(t => t.status === '待處理').length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('處理中')}
                                    className={`btn ${statusFilter === '處理中' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                >
                                    處理中 ({tickets.filter(t => t.status === '處理中').length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('待料')}
                                    className={`btn ${statusFilter === '待料' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                >
                                    待料 ({tickets.filter(t => t.status === '待料').length})
                                </button>
                            </div>

                            {/* 關鍵字搜尋 */}
                            <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
                                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                                <input
                                    type="text"
                                    placeholder="搜尋單號、地點、類別..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 38px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 案件管理列表 */}
                        {loading && !isFallback ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                載入資料中，請稍候...
                            </div>
                        ) : adminTickets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                沒有找到相符的報修案件。
                            </div>
                        ) : (
                            /* 電腦版採用 Table，手機版採用 Card List */
                            !isMobile ? (
                                <div style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                    overflow: 'hidden'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '150px' }}>單號</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '130px' }}>發起日期</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '140px' }}>分類</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>地點</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '100px' }}>申報人</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '110px' }}>狀態</th>
                                                <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', width: '120px', textAlign: 'center' }}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminTickets.map((ticket) => {
                                                const statusStyle = getStatusStyle(ticket.status);
                                                return (
                                                    <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                                                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{ticket.id}</td>
                                                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#64748b' }}>{ticket.date}</td>
                                                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' }}>{ticket.category}</td>
                                                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#475569' }}>{ticket.location}</td>
                                                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#475569' }}>{ticket.reporter}</td>
                                                        <td style={{ padding: '14px 20px' }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                backgroundColor: statusStyle.bg,
                                                                color: statusStyle.text,
                                                                border: `1px solid ${statusStyle.border}`,
                                                                fontWeight: '600'
                                                            }}>
                                                                {ticket.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleSelectTicket(ticket)}
                                                                className="btn btn-primary"
                                                                style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: 'var(--primary-color)' }}
                                                            >
                                                                查看與處理
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* 手機版採用 Card List */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {adminTickets.map((ticket) => {
                                        const statusStyle = getStatusStyle(ticket.status);
                                        return (
                                            <div
                                                key={ticket.id}
                                                style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{ticket.id}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.text,
                                                        border: `1px solid ${statusStyle.border}`,
                                                        fontWeight: '600'
                                                    }}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>{ticket.date}</div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>{ticket.category}</h4>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '12px' }}>
                                                    <strong>地點：</strong>{ticket.location}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>申報人: {ticket.reporter}</span>
                                                    <button
                                                        onClick={() => handleSelectTicket(ticket)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--primary-color)' }}
                                                    >
                                                        查看與處理
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                    </div>
                )}
            </main>

            {/* 管理員專屬：報修詳情與時間軸處理 Modal (後台 Action Page) */}
            <Modal
                isOpen={isAdminConsole && !!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                title={selectedTicket ? `管理員處置：${selectedTicket.id}` : '報修詳情'}
            >
                {selectedTicket && (
                    <div style={{ color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* 頂部區塊 */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }}>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--primary-color)' }}>{selectedTicket.category}</strong>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: getStatusStyle(selectedTicket.status).bg,
                                    color: getStatusStyle(selectedTicket.status).text,
                                    border: `1px solid ${getStatusStyle(selectedTicket.status).border}`,
                                    fontWeight: '700'
                                }}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                            
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>申報時間</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{selectedTicket.createdTime || selectedTicket.date}</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>故障地點</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{selectedTicket.location}</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>申報人姓名 (管理員可見)</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#ef4444' }}>{selectedTicket.reporter}</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>聯絡電話 (管理員可見)</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#ef4444' }}>{selectedTicket.phone}</span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>通知信箱 (管理員可見)</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#ef4444' }}>{selectedTicket.email || '無'}</span>
                            </div>
                            <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>原始描述</span>
                                <span style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', color: '#334155' }}>{selectedTicket.description}</span>
                            </div>
                        </div>

                        {/* 時間軸 */}
                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MessageSquare size={18} color="var(--primary-color)" />
                                處理歷程
                            </h4>
                            
                            {logsLoading ? (
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>載入歷程中...</div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    borderLeft: '2px solid #cbd5e1',
                                    paddingLeft: '16px',
                                    marginLeft: '6px'
                                }}>
                                    {ticketLogs.map((log) => {
                                        let roleBadge = '系統';
                                        let badgeColor = '#64748b';
                                        if (log.operatorLevel === 1) {
                                            roleBadge = '住戶';
                                            badgeColor = '#d97706';
                                        } else if (log.operatorLevel >= 99) {
                                            roleBadge = '管理員';
                                            badgeColor = '#3b82f6';
                                        }
                                        return (
                                            <div key={log.logId} style={{ position: 'relative' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-23px',
                                                    top: '4px',
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: badgeColor,
                                                    border: '2px solid #FFFFFF'
                                                }} />
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                        <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{log.operator}</strong>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            backgroundColor: roleBadge === '系統' ? '#f1f5f9' : (roleBadge === '住戶' ? '#fffbeb' : '#eff6ff'),
                                                            color: badgeColor,
                                                            padding: '0 4px',
                                                            borderRadius: '3px',
                                                            fontWeight: '600'
                                                        }}>{roleBadge}</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.timestamp}</span>
                                                    </div>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                                                        {log.content}
                                                    </p>
                                                    {log.statusChange && (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '1px 6px', borderRadius: '3px' }}>
                                                            <CornerDownRight size={10} />
                                                            <span>狀態變更：</span>
                                                            <strong style={{ color: getStatusStyle(log.statusChange).text }}>{log.statusChange}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 管理員處置區 */}
                        {selectedTicket.status !== '已結案' && (
                            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', marginTop: '8px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '10px' }}>
                                    處置回覆與進度推動
                                </div>
                                <textarea
                                    placeholder="輸入回覆文字內容..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        resize: 'vertical',
                                        marginBottom: '12px'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>變更狀態：</span>
                                        <select
                                            value={replyStatusChange}
                                            onChange={(e) => setReplyStatusChange(e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.85rem',
                                                backgroundColor: '#FFFFFF',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="待處理">待處理</option>
                                            <option value="處理中">處理中</option>
                                            <option value="待料">待料</option>
                                            <option value="已結案">已結案</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleSubmitReply(selectedTicket, true)}
                                            disabled={submitting}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fff5f5' }}
                                        >
                                            直接快速結案
                                        </button>
                                        <button
                                            onClick={() => handleSubmitReply(selectedTicket, false)}
                                            disabled={submitting}
                                            className="btn btn-primary"
                                            style={{ padding: '8px 20px', fontSize: '0.85rem', backgroundColor: 'var(--primary-color)' }}
                                        >
                                            {submitting ? '處理中...' : '送出回覆與推進'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => setSelectedTicket(null)} className="btn btn-secondary" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
                                關閉後台視窗
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 成功通知彈出框 */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="系統通知"
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
                        <FileCheck size={40} />
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: '700' }}>作業完成！</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-line' }}>
                        {successMessage}
                    </p>
                    <button
                        onClick={() => setIsSuccessModalOpen(false)}
                        className="btn btn-primary"
                        style={{ padding: '10px 32px', fontWeight: '700', backgroundColor: '#d97706', border: 'none' }}
                    >
                        我知道了
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default RepairPage;
