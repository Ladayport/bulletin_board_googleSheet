import { useState } from 'react';
import { compressImage, fileToBase64 } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const AddAnnouncement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        title: '',
        category: '公告',
        content: '',
        file: null,      // 原始檔案物件
        fileData: ''     // Base64 字串 (準備傳給 GAS)
    });

    // 處理檔案選擇
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 檢查檔案類型
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
            alert('只支援 JPG, PNG 圖片或 PDF 文件');
            return;
        }

        try {
            let processedFile = file;
            let base64 = '';

            // 如果是圖片，進行壓縮
            if (file.type.startsWith('image/')) {
                console.log(`原始大小: ${file.size / 1024} KB`);
                processedFile = await compressImage(file);
                console.log(`壓縮後大小: ${processedFile.size / 1024} KB`);

                // 建立預覽圖
                setPreview(URL.createObjectURL(processedFile));
            } else {
                setPreview(null); // PDF 不顯示圖片預覽
            }

            // 轉為 Base64
            base64 = await fileToBase64(processedFile);

            setForm(prev => ({
                ...prev,
                file: processedFile,
                fileData: base64 // 這是要傳給 GAS 的核心資料
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

        // --- 這裡將在階段四替換為真實 API 呼叫 ---
        console.log("準備傳送的資料:", {
            ...form,
            fileData: form.fileData.substring(0, 50) + "..." // Log 只顯示前段避免卡住
        });

        setTimeout(() => {
            alert('模擬發布成功！');
            setLoading(false);
            navigate('/admin');
        }, 1500);
        // ----------------------------------------
    };

    return (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '20px auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>發佈新公告</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                            <option value="緊急">緊急</option>
                            <option value="失物">失物</option>
                        </select>
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
                    {form.file && form.file.type === 'application/pdf' && (
                        <div style={{ marginTop: '16px', color: 'var(--danger-color)' }}>
                            已選取 PDF 文件: {form.file.name}
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
                        {loading ? '資料上傳中...' : '確認發佈'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddAnnouncement;
