import { useState } from 'react';
import { compressImage, fileToBase64 } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const AddAnnouncement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    // 預設時間：開始為現在，結束為7天後
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 格式化為 datetime-local 輸入框需要的格式 (YYYY-MM-DDTHH:mm)
    const formatDateTime = (date) => date.toISOString().slice(0, 16);

    const [form, setForm] = useState({
        title: '',
        category: '公告',
        content: '',
        isEmergency: false, // 獨立開關
        startDate: formatDateTime(now),
        endDate: formatDateTime(nextWeek),
        file: null,
        fileData: ''
    });

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
                file: processedFile,
                fileData: base64
            }));

        } catch (err) {
            console.error('檔案處理失敗', err);
            alert('檔案處理失敗');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) return alert('請填寫完整資訊');

        setLoading(true);

        // 模擬儲存到 localStorage，讓前台可以看到
        const newBulletin = {
            id: Date.now(), // 模擬 ID
            date: form.startDate.split('T')[0], // 取日期部分顯示
            category: form.category,
            title: form.title,
            content: form.content,
            isEmergency: form.isEmergency,
            startDate: form.startDate,
            endDate: form.endDate,
            // fileData: form.fileData // 實作中檔案太大 localStorage 存不下，暫不存檔案內容到 localStorage
        };

        try {
            const existingData = JSON.parse(localStorage.getItem('local_bulletins') || '[]');
            const updatedData = [newBulletin, ...existingData];
            localStorage.setItem('local_bulletins', JSON.stringify(updatedData));

            console.log("已儲存至 LocalStorage:", newBulletin);

            setTimeout(() => {
                alert('發布成功！(已儲存至瀏覽器模擬資料庫)');
                setLoading(false);
                navigate('/admin');
            }, 800);
        } catch (err) {
            console.error(err);
            alert('儲存失敗 (可能是 LocalStorage 空間不足)');
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '20px auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>發佈新公告</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* 緊急公告開關 */}
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
                            <option value="公告">公告</option>
                            <option value="活動">活動</option>
                            <option value="會議">會議</option>
                            <option value="失物">失物</option>
                            <option value="其他">其他</option>
                            <option value="QA">QA</option>
                        </select>
                    </div>
                </div>

                {/* 時間設定 */}
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

                {/* 內容 */}
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

                {/* 檔案上傳區 */}
                <div style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>附件上傳 (JPG 會自動壓縮 / PDF)</label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <div style={{ marginTop: '16px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>圖片預覽 (已壓縮):</p>
                            <img src={preview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
                        </div>
                    )}
                </div>

                {/* 按鈕區 */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="btn btn-secondary"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? '發佈中...' : '確認發佈'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddAnnouncement;
