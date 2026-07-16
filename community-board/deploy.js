import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';

console.log('🚀 開始多單位部署打包流程...\n');

// 1. 清理先前的 dist 資料夾
if (existsSync('dist')) {
    console.log('🧹 清理舊的 dist 目錄...');
    rmSync('dist', { recursive: true, force: true });
}

try {
    // 2. 打包測試區 (根目錄)
    console.log('\n📦 [1/3] 打包測試區 (Testing)...');
    execSync('npm run build:testing', { stdio: 'inherit' });

    // 3. 打包單位 A (子目錄 nexus-alpha)
    console.log('\n📦 [2/3] 打包單位 A (Unit A)...');
    execSync('npm run build:unitA', { stdio: 'inherit' });

    // 4. 打包單位 B (子目錄 nexus-omega)
    console.log('\n📦 [3/3] 打包單位 B (Unit B)...');
    execSync('npm run build:unitB', { stdio: 'inherit' });

    // 5. 部署到 gh-pages
    console.log('\n🚀 [Deploy] 準備部署到 GitHub Pages...');
    execSync('npx gh-pages -d dist', { stdio: 'inherit' });

    console.log('\n✅ 部署完成！');
} catch (error) {
    console.error('\n❌ 部署過程中發生錯誤：', error.message);
    process.exit(1);
}
