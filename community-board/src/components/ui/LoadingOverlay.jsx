import React from 'react';

/**
 * LoadingOverlay 元件
 * 提供全螢幕的載入遮罩，並阻擋使用者操作
 */
const LoadingOverlay = ({
    show,
    message = "資料載入中，請稍候..."
}) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'opacity 0.3s ease-in-out'
        }}>
            {/* 旋轉載入圖示 */}
            <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid var(--primary-color, #2563eb)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            }} />

            <p style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                color: 'var(--text-main, #1f2937)',
                margin: 0
            }}>
                {message}
            </p>

            {/* 定義旋轉動畫 */}
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default LoadingOverlay;
