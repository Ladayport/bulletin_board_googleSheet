import React from 'react';
import { Megaphone } from 'lucide-react';
import '../../styles/main.css';

const EmergencyTicker = ({ messages }) => {
    if (!messages || messages.length === 0) return null;

    return (
        <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflow: 'hidden',
            marginBottom: '24px' // 與下方區塊的間距
        }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Megaphone size={20} className="animate-pulse" />
                緊急通告
            </div>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{
                    display: 'inline-block',
                    animation: 'ticker 20s linear infinite',
                    paddingLeft: '100%'
                }}>
                    {messages.join('    •    ')}
                </div>
            </div>
            <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
        </div>
    );
};

export default EmergencyTicker;
