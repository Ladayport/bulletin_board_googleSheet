# 階段三：後台管理與公告發布功能 (Phase 3: Admin Dashboard & Publishing Logic)

## 🎯 階段目標

1. 安裝並配置圖片壓縮套件 (`browser-image-compression`)。
2. 實作 **Private Route (路由保護)**，確保只有登入者能進入後台。
3. 開發 **Login (登入頁)** 與 **Admin Dashboard (後台首頁)**。
4. 完成 **新增公告表單**，包含：
* 圖片自動壓縮至 720px 寬度。
* 檔案轉 Base64 字串處理。
* 即時預覽功能。

---

## 1. 安裝必要依賴 (Dependencies)

我們需要一個強大的前端壓縮庫來處理圖片，避免上傳數 MB 的原圖卡死 GAS。

```bash
npm install browser-image-compression
```

---

## 2. 模擬認證服務 (Auth Service)

在串接 GAS 真實資料庫前，我們先用 `localStorage` 模擬登入狀態。

### `src/services/auth.js`

```javascript
// 模擬的登入邏輯
export const authService = {
  login: async (username, password) => {
    // 階段四將替換為呼叫 GAS API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('authToken', 'mock-token-123');
          resolve({ success: true, user: { name: '管理員' } });
        } else {
          reject({ success: false, message: '帳號或密碼錯誤' });
        }
      }, 800); // 模擬網路延遲
    });
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};
```

---

## 3. 路由保護組件 (Private Route)

防止未登入使用者直接輸入網址進入後台。

### `src/components/layout/PrivateRoute.jsx`

```javascript
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';

const PrivateRoute = () => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
```

---

## 4. 登入頁面開發 (Login Page)

### `src/pages/Login.jsx`

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import '../styles/main.css'; // 確保引入通用樣式

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData.username, formData.password);
      navigate('/admin'); // 登入成功跳轉
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-body)' 
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>
          管理員登入
        </h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '0.9rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>帳號</label>
            <input
              type="text"
              className="form-input" // 需在 main.css 定義或暫時用 style
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>密碼</label>
            <input
              type="password"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '驗證中...' : '登入系統'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

---

## 5. 核心：新增公告與圖片處理 (Add Announcement)

這是本階段最複雜的組件，負責處理檔案壓縮與 Base64 轉換。

### `src/utils/imageUtils.js`

建立工具函式庫。

```javascript
import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.8,          // 限制最大檔案大小 (0.8MB)
    maxWidthOrHeight: 720,   // 限制最大寬度或高度 (符合您的需求)
    useWebWorker: true,
    fileType: 'image/jpeg'   // 強制轉為 JPG
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // 回傳包含 data:image/jpeg;base64,... 的字串
    reader.onerror = (error) => reject(error);
  });
};
```

### `src/pages/admin/AddAnnouncement.jsx`

```javascript
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
    if(!form.title || !form.content) return alert('請填寫完整資訊');

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
              onChange={e => setForm({...form, title: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>分類</label>
            <select 
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
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
            onChange={e => setForm({...form, content: e.target.value})}
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
```

---

## 6. 後台管理首頁 (Admin Dashboard)

### `src/pages/admin/AdminDashboard.jsx`

```javascript
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import Card from '../../components/ui/Card';
import { PlusCircle, LogOut, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>後台管理系統</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={18} /> 登出
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* 功能卡片 1: 發佈公告 */}
        <Card onClick={() => navigate('/admin/add')} className="interactive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '50%', color: 'var(--primary-color)' }}>
              <PlusCircle size={40} />
            </div>
            <div>
              <h3>發佈新公告</h3>
              <p style={{ color: 'var(--text-muted)' }}>撰寫並發佈新的社區公告或通知</p>
            </div>
          </div>
        </Card>

        {/* 功能卡片 2: 管理列表 (暫未實作) */}
        <Card style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '50%', color: '#9ca3af' }}>
              <FileText size={40} />
            </div>
            <div>
              <h3>管理現有公告</h3>
              <p style={{ color: 'var(--text-muted)' }}>編輯或刪除已發佈的資訊 (開發中)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

---

## 7. 路由整合 (App.jsx Update)

最後，將所有新頁面串接起來。

### `src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAnnouncement from './pages/admin/AddAnnouncement';
import PrivateRoute from './components/layout/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* 公開頁面 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 後台保護區域 */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add" element={<AddAnnouncement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

---

## ✅ 階段三驗收標準

1. **登入測試**：
* 在瀏覽器輸入 `http://localhost:5173/admin`，應被強制導回 `/login`。
* 輸入錯誤帳密 (非 admin/admin) 應顯示紅字錯誤訊息。
* 輸入正確帳密應成功跳轉至後台。


2. **圖片壓縮測試**：
* 進入「發佈新公告」。
* 開啟 F12 Console。
* 上傳一張大圖 (例如 5MB 照片)。
* Console 應顯示 `原始大小` 與 `壓縮後大小` (後者應顯著變小，通常在 500KB 以下)。
* 應在畫面看到圖片預覽。


3. **PDF 測試**：
* 上傳 PDF 檔，應顯示檔名且不顯示圖片預覽。


4. **模擬發送**：
* 填寫完表單按「確認發佈」，應跳出成功 Alert 並跳轉回後台首頁。
