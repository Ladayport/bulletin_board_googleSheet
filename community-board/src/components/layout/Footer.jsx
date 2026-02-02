import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '32px 20px',
            marginTop: '60px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '0.85rem'
        }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>
                © {new Date().getFullYear()} Community Bulletin Board. All rights reserved.
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                【資安警語】本系統全面禁止張貼機敏資料與未授權內容，操作軌跡皆有紀錄。
            </p>
        </footer>
    );
};

export default Footer;
