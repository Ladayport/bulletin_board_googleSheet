import { useState } from 'react';
import { compressImage, fileToBase64 } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { authService } from '../../services/auth';

const AddAnnouncement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  // Note: toISOString returns UTC, you might want local time properly formatted
  // Ideally use a library or proper offset method, but sticking to ISO slice for simplicity per request
  // Adjusting for local timezone offset manually to ensure 'datetime-local' input works correctly
  const toLocalISO = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [form, setForm] = useState({
    title: '',
    category: '公告',
    content: '',
    isEmergency: false,
    startDate: toLocalISO(now),
    endDate: toLocalISO(nextWeek),
    file: null,
    fileData: '',
    fileName: '',
    fileType: ''
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
        fileName: file.name,
        fileType: file.type,
        fileData: base64 // base64 string
      }));

    } catch (err) {
      console.error('檔案處理失敗', err);
      alert('檔案處理失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return alert('請填寫完整資訊');
    if (!form.startDate || !form.endDate) return alert('開始日期與結束日期為必填項');

    setLoading(true);

    // 準備傳送給 GAS 的 Payload
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      isUrgent: form.isEmergency ? 'Y' : '', // GAS 邏輯
      startDate: form.startDate,
      endDate: form.endDate,
      fileData: form.fileData,
      fileName: form.fileName,
      fileType: form.fileType,
      operator: authService.getUser()?.name || 'Admin',
    };

    try {
      const result = await api.post('addBulletin', payload);

      if (result.success) {
        alert('發布成功！');
        navigate('/admin');
      } else {
        throw new Error(result.message || '發佈失敗');
      }
    } catch (err) {
      console.error(err);
      alert('發佈失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: '800px', margin: '20px auto' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>發佈新公告</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
