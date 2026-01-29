import { useEffect } from 'react';
import Header from '../components/layout/Header';
import BulletinSection from '../components/home/BulletinSection';
import FeatureGrid from '../components/home/FeatureGrid';
import { mockSiteData, mockBulletins, mockStats } from '../utils/mockData';

const Home = () => {

    // 模擬從 API 設定瀏覽器標題
    useEffect(() => {
        document.title = mockSiteData.title;
    }, []);

    return (
        <>
            <Header title={mockSiteData.title} />

            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-lg)'
            }}>

                {/* 上方：快速功能區 (失物/會議/活動) */}
                <section>
                    <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-sub)' }}>快速服務</h2>
                    <FeatureGrid stats={mockStats} />
                </section>

                {/* 下方：最新公告區 */}
                <section>
                    <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-sub)' }}>最新公告</h2>
                    <BulletinSection bulletins={mockBulletins} />
                </section>

            </main>
        </>
    );
};

export default Home;
