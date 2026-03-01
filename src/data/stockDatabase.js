/**
 * Local Stock Database
 * Fallback data when API search fails
 * Contains most popular A-share stocks
 */

export const LOCAL_STOCK_DATABASE = [
    // 科技龙头
    { code: '300750', name: '宁德时代', pinyin: 'ndsd' },
    { code: '002594', name: '比亚迪', pinyin: 'byd' },
    { code: '300059', name: '东方财富', pinyin: 'dfcf' },
    { code: '002475', name: '立讯精密', pinyin: 'lxjm' },
    { code: '002415', name: '海康威视', pinyin: 'hkws' },
    { code: '300033', name: '同花顺', pinyin: 'ths' },
    { code: '002236', name: '大华股份', pinyin: 'dhgf' },
    { code: '002405', name: '四维图新', pinyin: 'swtx' },
    { code: '300014', name: '亿纬锂能', pinyin: 'ywln' },
    { code: '002129', name: '中环股份', pinyin: 'zhgf' },

    // 白酒板块
    { code: '600519', name: '贵州茅台', pinyin: 'gzmt' },
    { code: '000858', name: '五粮液', pinyin: 'wly' },
    { code: '000568', name: '泸州老窖', pinyin: 'lzljj' },
    { code: '002304', name: '洋河股份', pinyin: 'yhgf' },
    { code: '000596', name: '古井贡酒', pinyin: 'gjgj' },
    { code: '600809', name: '山西汾酒', pinyin: 'sxfj' },

    // 金融板块
    { code: '000001', name: '平安银行', pinyin: 'payh' },
    { code: '600036', name: '招商银行', pinyin: 'zsyh' },
    { code: '601166', name: '兴业银行', pinyin: 'xyyh' },
    { code: '600000', name: '浦发银行', pinyin: 'pfyh' },
    { code: '601318', name: '中国平安', pinyin: 'zgpa' },
    { code: '600030', name: '中信证券', pinyin: 'zxzq' },
    { code: '601211', name: '国泰君安', pinyin: 'gtja' },

    // 新能源
    { code: '600900', name: '长江电力', pinyin: 'cjdl' },
    { code: '601877', name: '正泰电器', pinyin: 'ztdq' },
    { code: '600438', name: '通威股份', pinyin: 'twgf' },
    { code: '002074', name: '国轩高科', pinyin: 'gxgk' },
    { code: '300274', name: '阳光电源', pinyin: 'ygdy' },

    // 汽车板块
    { code: '000625', name: '长安汽车', pinyin: 'caqc' },
    { code: '600104', name: '上汽集团', pinyin: 'sqjt' },
    { code: '601238', name: '广汽集团', pinyin: 'gcjt' },
    { code: '002536', name: '飞龙股份', pinyin: 'flgf' },

    // 医药生物
    { code: '300760', name: '迈瑞医疗', pinyin: 'mryl' },
    { code: '300122', name: '智飞生物', pinyin: 'zfsw' },
    { code: '300347', name: '泰格医药', pinyin: 'tgyy' },
    { code: '002007', name: '华兰生物', pinyin: 'hlsw' },
    { code: '000538', name: '云南白药', pinyin: 'ynby' },
    { code: '600276', name: '恒瑞医药', pinyin: 'hryy' },

    // 消费板块
    { code: '000895', name: '双汇发展', pinyin: 'shfz' },
    { code: '600887', name: '伊利股份', pinyin: 'ylgf' },
    { code: '000333', name: '美的集团', pinyin: 'mdjt' },
    { code: '000651', name: '格力电器', pinyin: 'gldq' },
    { code: '002271', name: '东方雨虹', pinyin: 'dfyh' },

    // 房地产
    { code: '000002', name: '万科A', pinyin: 'wka' },
    { code: '001979', name: '招商蛇口', pinyin: 'zssk' },
    { code: '600048', name: '保利发展', pinyin: 'bldf' },

    // 基建
    { code: '601390', name: '中国中铁', pinyin: 'zgtz' },
    { code: '601186', name: '中国铁建', pinyin: 'zgtj' },
    { code: '601668', name: '中国建筑', pinyin: 'zgjz' },
    { code: '600585', name: '海螺水泥', pinyin: 'hlsn' },

    // 有色金属
    { code: '601899', name: '紫金矿业', pinyin: 'zjky' },
    { code: '002460', name: '赣锋锂业', pinyin: 'gfly' },
    { code: '600547', name: '山东黄金', pinyin: 'sdhj' },

    // 煤炭
    { code: '601225', name: '陕西煤业', pinyin: 'sxmy' },
    { code: '601088', name: '中国神华', pinyin: 'zgsh' },

    // 钢铁
    { code: '600019', name: '宝钢股份', pinyin: 'bggf' },

    // 军工
    { code: '600893', name: '航发动力', pinyin: 'hfdl' },
    { code: '002049', name: '紫光国微', pinyin: 'zggw' },

    // 半导体
    { code: '688981', name: '中芯国际', pinyin: 'zxgj' },
    { code: '002371', name: '北方华创', pinyin: 'bfhc' },
    { code: '300661', name: '圣邦股份', pinyin: 'sbgf' },

    // 互联网
    { code: '300750', name: '宁德时代', pinyin: 'ndsd' },
];

/**
 * Search in local database
 * @param {string} keyword - Search keyword
 * @returns {Array} Matching stocks
 */
export const searchLocalDatabase = (keyword) => {
    if (!keyword || keyword.trim().length === 0) return [];

    const searchTerm = keyword.trim().toLowerCase();

    return LOCAL_STOCK_DATABASE.filter(stock => {
        return (
            stock.code.includes(searchTerm) ||
            stock.name.includes(searchTerm) ||
            stock.pinyin.toLowerCase().includes(searchTerm)
        );
    }).map(stock => ({
        market: stock.code.startsWith('6') ? 'sh' : stock.code.startsWith('68') ? 'sh' : 'sz',
        code: stock.code,
        name: stock.name,
        pinyin: stock.pinyin,
        isLocal: true
    }));
};
