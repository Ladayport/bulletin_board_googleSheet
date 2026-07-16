const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'RepairPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 統一為 \n
let normalized = content.replace(/\r\n/g, '\n');

// 1. 移除 import Footer
const targetImport = "import Footer from '../components/layout/Footer';\n";
if (normalized.includes(targetImport)) {
    normalized = normalized.replace(targetImport, '');
} else {
    // 試試沒有換行符的
    normalized = normalized.replace("import Footer from '../components/layout/Footer';", '');
}

// 2. 移除 <Footer />
const targetFooter = "            <Footer />\n";
if (normalized.includes(targetFooter)) {
    normalized = normalized.replace(targetFooter, '');
} else {
    normalized = normalized.replace("<Footer />", '');
}

// 轉回 CRLF 並寫回檔案
const finalContent = normalized.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Remove Footer Success!');
