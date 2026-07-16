const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname);
const files = [
    'DownloadPage.jsx',
    'ForumPage.jsx',
    'GasPage.jsx',
    'BookingPage.jsx',
    'PackagePage.jsx',
    'VisitorPage.jsx'
];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let normalized = content.replace(/\r\n/g, '\n');

    // 1. 移除 import Footer
    const targetImport = "import Footer from '../components/layout/Footer';\n";
    if (normalized.includes(targetImport)) {
        normalized = normalized.replace(targetImport, '');
    } else {
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
    console.log(`Cleaned Footer in ${file}`);
});
