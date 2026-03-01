/**
 * Stock Data API Module
 * Fetches real-time and historical data from Tencent's public APIs
 */

/**
 * Fetches real A-Share historical data using Tencent's JSONP API.
 * @param {string} code - Stock code (e.g., '600519', '000001')
 * @param {number} days - Number of days to fetch (default: 300)
 * @returns {Promise<Array>} Array of historical data objects
 */
export const fetchTencentData = async (code, days = 300) => {
    const prefix = code.startsWith('6') ? 'sh' : 'sz';
    const symbol = `${prefix}${code}`;
    const targetUrl = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${symbol},day,,,${days},qfq`;

    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    let lastError = new Error('Network Request Failed');

    for (const proxyUrl of proxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (data && data.code === 0 && data.data && data.data[symbol]) {
                const rawData = data.data[symbol].qfqday || data.data[symbol].day || [];
                if (rawData.length === 0) throw new Error('No historical data returned');

                return rawData.map(item => ({
                    date: item[0],
                    open: Number(item[1]),
                    close: Number(item[2]),
                    high: Number(item[3]),
                    low: Number(item[4]),
                    volume: Number(item[5])
                }));
            } else {
                throw new Error('API Data Format Error');
            }
        } catch (error) {
            lastError = error;
            continue;
        }
    }
    throw new Error(`Data proxies failed (${lastError.name === 'AbortError' ? 'Timeout' : 'Connection Refused'})`);
};

/**
 * Fetches real-time prices for multiple stock codes to calculate PnL accurately.
 * @param {Array<string>} codes - Array of stock codes
 * @returns {Promise<Object>} Object mapping codes to their current prices
 */
export const fetchBatchPrices = async (codes) => {
    if (!codes || codes.length === 0) return {};
    const prefixedCodes = codes.map(c => c.startsWith('6') ? `sh${c}` : `sz${c}`);
    const url = `https://qt.gtimg.cn/q=${prefixedCodes.join(',')}`;

    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (const proxy of proxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(proxy, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) continue;

            const text = await res.text();
            const result = {};
            const lines = text.split(';');

            lines.forEach(line => {
                const match = line.match(/v_(s[hz]\d{6})="(.*?)"/);
                if (match) {
                    const code = match[1].substring(2);
                    const parts = match[2].split('~');
                    if (parts.length > 3) {
                        result[code] = Number(parts[3]); // parts[3] is the current real-time price
                    }
                }
            });
            return result;
        } catch (e) {
            console.warn(`Batch API proxy failed: ${proxy}`, e);
            continue;
        }
    }
    return {};
};

/**
 * Fuzzy searches stocks using Tencent Smartbox API.
 * Enhanced with better error handling and multiple proxy support.
 *
 * @param {string} keyword - Search keyword (pinyin, code, or name)
 * @returns {Promise<Array>} Array of matching stocks
 */
export const searchStocksAPI = async (keyword) => {
    if (!keyword || keyword.trim().length === 0) return [];

    const trimmedKeyword = keyword.trim();
    const url = `https://smartbox.gtimg.cn/s3/?v=2&q=${encodeURIComponent(trimmedKeyword)}&t=all`;

    // List of CORS proxies to try (in order of reliability)
    const proxyConfigs = [
        {
            name: 'Direct',
            getUrl: () => url
        },
        {
            name: 'CorsProxy.io',
            getUrl: () => `https://corsproxy.io/?${encodeURIComponent(url)}`
        },
        {
            name: 'AllOrigins',
            getUrl: () => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        },
        {
            name: 'CodeTabs',
            getUrl: () => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        }
    ];

    for (const config of proxyConfigs) {
        try {
            const proxyUrl = config.getUrl();
            console.log(`Trying ${config.name} proxy...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(proxyUrl, {
                signal: controller.signal,
                mode: 'cors'
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                console.warn(`${config.name} returned status ${res.status}`);
                continue;
            }

            const text = await res.text();

            // Parse the response
            const match = text.match(/v_hint="(.*?)";/);
            if (match && match[1]) {
                const items = match[1].split('^');
                const results = items.map(item => {
                    const parts = item.split('~');
                    if (parts.length >= 4) {
                        return {
                            market: parts[0],
                            code: parts[1],
                            name: parts[2],
                            pinyin: parts[3]
                        };
                    }
                    return null;
                }).filter(Boolean);

                if (results.length > 0) {
                    console.log(`✅ Search successful via ${config.name}: Found ${results.length} results`);
                    return results;
                }
            }

            console.warn(`${config.name} returned no valid data`);
        } catch (e) {
            console.warn(`❌ ${config.name} failed:`, e.message);
            continue;
        }
    }

    console.error('❌ All search proxies failed. Please check your network connection.');
    return [];
};
