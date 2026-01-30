import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { authService } from '../../services/auth';
import { compressImage, fileToBase64 } from '../../utils/imageUtils';

const EditBulletin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [preview, setPreview] = useState(null);
    const [originalData, setOriginalData] = useState(null);

    // 格式轉換輔助：將 YYYY/MM/DD 與 HH:mm:ss 轉為 HTML datetime-local 格式 (YYYY-MM-DDTHH:mm)
    const toInputFormat = (dateStr, timeStr) => {
        if (!dateStr) return '';
        const day = dateStr.replace(/\//g, '-');
        const time = timeStr ? timeStr.slice(0, 5) : '00:00';
        return `${day}T${time}`;
    };

    const [form, setForm] = useState({
        title: '',
        category: '公告通知',
        content: '',
        isEmergency: false,
        startDate: '',
        endDate: '',
        fileUrl: '',
        fileType: '',
        fileData: '',
        fileName: '',
        hasNewFile: false
    });

    // 載入公告資料
    useEffect(() => {
        const loadBulletin = async () => {
            try {
                setLoadingData(true);
                // 這裡使用 getHomeData 取得所有公告，以便尋找特定 ID (GAS 目前 getHomeData 會回傳所有 active/deleted)
                const result = await api.get('getHomeData');

                if (result.success && result.bulletins) {
                    const bulletin = result.bulletins.find(b => b.id.toString() === id.toString());

                    if (bulletin) {
                        setOriginalData(bulletin);
                        setForm({
                            title: bulletin.title || '',
                            // 同步分類代碼：確保與 AddAnnouncement/CategoryPage 一致
                            category: (bulletin.category === '公告' ? '公告通知' :
                                bulletin.category === '活動' ? '活動通知' :
                                    bulletin.category === '會議' ? '會議通知' :
                                        bulletin.category === '失物' ? '失物招領' :
                                            bulletin.category === '其他' ? '其他通知' : bulletin.category) || '公告通知',
                            content: bulletin.content || '',
                            isEmergency: bulletin.isUrgent === 'Y',
                            startDate: toInputFormat(bulletin.startDate, bulletin.startTime),
                            endDate: toInputFormat(bulletin.endDate, bulletin.endTime),
                            fileUrl: bulletin.fileUrl || '',
                            fileType: bulletin.fileType || '',
                            fileData: '',
                            fileName: '',
                            hasNewFile: false
                        });
                    } else {
                        alert('找不到該公告');
                        window.close();
                    }
                }
            } catch (error) {
                console.error('載入失敗:', error);
                alert('載入公告資料失敗');
            } finally {
                setLoadingData(false);
            }
        };

        loadBulletin();
    }, [id]);

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
                setPreview(URL.createObjectURL(processedFile));
            } else {
                setPreview(null);
            }

            base64 = await fileToBase64(processedFile);

            setForm(prev => ({
                ...prev,
                fileName: file.name,
                fileType: file.type,
                fileData: base64,
                hasNewFile: true
            }));

        } catch (err) {
            console.error('檔案處理失敗', err);
            alert('檔案處理失敗');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 基本必填檢查
        if (!form.title || !form.content) {
            alert('請填寫完整資訊');
            return;
        }
        // 日期必填檢查
        if (!form.startDate || !form.endDate) {
            alert('開始日期與結束日期為必填項');
            return;
        }

        setLoading(true);

        const payload = {
            id: id,
            operator: authService.getUser()?.name || 'Admin',
            title: form.title,
            content: form.content,
            category: form.category,
            isUrgent: form.isEmergency ? 'Y' : '',
            startDate: form.startDate, // 新增日期時間傳送
            endDate: form.endDate,
            originalFileUrl: form.fileUrl,
            fileType: form.hasNewFile ? form.fileType : originalData?.fileType || '',
        };

        // 只有上傳新檔案時才傳送 fileData 和 fileName
        if (form.hasNewFile) {
            payload.fileData = form.fileData;
            payload.fileName = form.fileName;
        }

        try {
            const result = await api.editBulletin(payload);

            if (result.success) {
                alert('修改成功！');
                window.close(); // 編輯通常是在新分頁開啟
            } else {
                throw new Error(result.message || '修改失敗');
            }
        } catch (err) {
            console.error(err);
            alert('修改失敗: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="card fade-in" style={{ maxWidth: '800px', margin: '20px auto', textAlign: 'center', padding: '40px' }}>
                <p>載入中...</p>
            </div>
        );
    }

    return (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '20px auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>編輯公告</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                公告 ID: {id}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* 緊急公告勾選 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <input
                        type="checkbox"
                        id="isEmergency"
                        checked={form.isEmergency}
                        onChange={e => setForm({ ...form, isEmergency: e.target.checked })}
                        style={{ width: '20px', height: '20px', accentColor: '#dc2626' }}
                    />
                    <label htmlFor="isEmergency" style={{ fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>
                        標記為緊急公告 (將置頂顯示)
                    </label>
                </div>

                {/* 標題與分類 */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>公告標題</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>分類</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="公告通知">公告通知</option>
                            <option value="活動通知">活動通知</option>
                            <option value="會議通知">會議通知</option>
                            <option value="失物招領">失物招領</option>
                            <option value="其他通知">其他通知</option>
                        </select>
                    </div>
                </div>

                {/* 開始與結束日期時間 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>開始時間</label>
                        <input
                            type="datetime-local"
                            value={form.startDate}
                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>結束時間</label>
                        <input
                            type="datetime-local"
                            value={form.endDate}
                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                </div>

                {/* 詳細內容 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>詳細內容</label>
                    <textarea
                        rows="6"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
                        required
                    />
                </div>

                {/* 附件處理 */}
                <div style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>附件上傳</label>

                    {form.fileUrl && !form.hasNewFile && (
                        <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px' }}>
                                目前附件: {form.fileType || '未知類型'}
                            </p>
                            <a
                                href={form.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.85rem', color: '#0284c7' }}
                            >
                                查看現有附件
                            </a>
                        </div>
                    )}

                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                    />

                    {preview && (
                        <div style={{ marginTop: '16px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>新圖片預覽 (已壓縮):</p>
                            <img src={preview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
                        </div>
                    )}

                    {form.hasNewFile && (
                        <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#059669' }}>
                            ✓ 已選擇新檔案: {form.fileName}
                        </p>
                    )}
                </div>

                {/* 按鈕區域 */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => window.close()}
                        className="btn btn-secondary"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? '儲存中...' : '儲存修改'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditBulletin;
