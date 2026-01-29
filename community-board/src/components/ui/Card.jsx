/* src/styles/main.css 追加內容 (Already added in previous step) */

import React from 'react';

const Card = ({ children, onClick, className = '' }) => {
    return (
        <div
            onClick={onClick}
            className={`card ${onClick ? 'interactive' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
