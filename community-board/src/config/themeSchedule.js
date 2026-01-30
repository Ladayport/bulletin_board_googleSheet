/**
 * 主題排程表 (主題控制中心)
 * 系統會依據此列表【由上而下】檢查優先權
 * 採【月日循環】模式,不綁定年份,方便每年自動套用
 */

export const THEME_SCHEDULE = [
    {
        id: 'newyear',
        start: '02-15',
        end: '02-22',
        description: '農曆新年 (紅色系)'
    },
    {
        id: 'spring',
        start: '03-01',
        end: '04-30',
        description: '春季櫻花 (粉色系)'
    },
    {
        id: 'summer',
        start: '06-01',
        end: '08-31',
        description: '夏季海洋 (青色系)'
    },
    {
        id: 'halloween',
        start: '10-25',
        end: '10-31',
        description: '萬聖節 (紫橘色系)'
    },
    {
        id: 'autumn',
        start: '09-01',
        end: '11-30',
        description: '秋季楓葉 (橘褐色系)'
    },
    {
        id: 'winter',
        start: '12-01',
        end: '12-20',
        description: '冬季冰雪 (灰藍色系)'
    },
    {
        id: 'newyear', // 聖誕節沿用新年紅色系
        start: '12-21',
        end: '12-31',
        description: '聖誕跨年 (紅色系)'
    },
    {
        id: 'cozy',
        start: '01-01',
        end: '02-14',
        description: '日常溫馨風 (奶茶色系)'
    }
];
