/**
 * Technical Indicators Calculation Module
 * Provides functions for calculating various technical indicators
 */

/**
 * Calculates Simple Moving Average (SMA)
 * @param {Array} data - Array of stock data objects
 * @param {number} period - Period for the moving average
 * @returns {Array} Array of SMA values (null for periods without enough data)
 */
export const calculateSMA = (data, period) => {
    const result = new Array(data.length).fill(null);
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        result[i] = Number((sum / period).toFixed(2));
    }
    return result;
};

/**
 * Calculates Exponential Moving Average (EMA)
 * @param {Array} closes - Array of close prices
 * @param {number} period - Period for the EMA
 * @returns {Array} Array of EMA values
 */
export const calculateEMA = (closes, period) => {
    const result = new Array(closes.length).fill(null);
    const multiplier = 2 / (period + 1);

    // First EMA is the SMA of the first 'period' values
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += closes[i];
    }
    result[period - 1] = sum / period;

    for (let i = period; i < closes.length; i++) {
        result[i] = (closes[i] - result[i - 1]) * multiplier + result[i - 1];
    }
    return result;
};

/**
 * Calculates RSI (Relative Strength Index)
 * @param {Array} data - Array of stock data objects with close prices
 * @param {number} period - RSI period (default 14)
 * @returns {Array} Array of RSI values (0-100)
 */
export const calculateRSI = (data, period = 14) => {
    const result = new Array(data.length).fill(null);
    if (data.length < period + 1) return result;

    const changes = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i].close - data[i - 1].close);
    }

    // Calculate initial average gain/loss
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 0; i < period; i++) {
        if (changes[i] > 0) avgGain += changes[i];
        else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;

    // First RSI value
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[period] = Number((100 - 100 / (1 + rs)).toFixed(2));

    // Subsequent RSI values using Wilder's smoothing
    for (let i = period; i < changes.length; i++) {
        const gain = changes[i] > 0 ? changes[i] : 0;
        const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[i + 1] = Number((100 - 100 / (1 + currentRs)).toFixed(2));
    }
    return result;
};

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of stock data objects
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal line period (default 9)
 * @returns {Object} { dif, dea, histogram } arrays
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const closes = data.map(d => d.close);
    const len = data.length;
    const dif = new Array(len).fill(null);
    const dea = new Array(len).fill(null);
    const histogram = new Array(len).fill(null);

    const fastEMA = calculateEMA(closes, fastPeriod);
    const slowEMA = calculateEMA(closes, slowPeriod);

    // Calculate DIF (MACD line)
    const difValues = [];
    for (let i = 0; i < len; i++) {
        if (fastEMA[i] !== null && slowEMA[i] !== null) {
            dif[i] = Number((fastEMA[i] - slowEMA[i]).toFixed(4));
            difValues.push(dif[i]);
        }
    }

    // Calculate DEA (Signal line) - EMA of DIF
    const difStartIndex = len - difValues.length;
    if (difValues.length >= signalPeriod) {
        const signalEMA = calculateEMA(difValues, signalPeriod);
        for (let i = 0; i < signalEMA.length; i++) {
            if (signalEMA[i] !== null) {
                const idx = difStartIndex + i;
                dea[idx] = Number(signalEMA[i].toFixed(4));
                histogram[idx] = Number(((dif[idx] - dea[idx]) * 2).toFixed(4));
            }
        }
    }

    return { dif, dea, histogram };
};

/**
 * Calculates Bollinger Bands
 * @param {Array} data - Array of stock data objects
 * @param {number} period - Moving average period (default 20)
 * @param {number} multiplier - Standard deviation multiplier (default 2)
 * @returns {Object} { upper, middle, lower } arrays
 */
export const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
    const len = data.length;
    const upper = new Array(len).fill(null);
    const middle = new Array(len).fill(null);
    const lower = new Array(len).fill(null);

    for (let i = period - 1; i < len; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        const sma = sum / period;

        let varianceSum = 0;
        for (let j = 0; j < period; j++) {
            varianceSum += Math.pow(data[i - j].close - sma, 2);
        }
        const stdDev = Math.sqrt(varianceSum / period);

        middle[i] = Number(sma.toFixed(2));
        upper[i] = Number((sma + multiplier * stdDev).toFixed(2));
        lower[i] = Number((sma - multiplier * stdDev).toFixed(2));
    }

    return { upper, middle, lower };
};

/**
 * Evaluates a trading rule against historical data
 * @param {Object} rule - Rule object with indicator, operator, and value
 * @param {number} i - Index in the data array
 * @param {Object} indicators - Object containing calculated indicators
 * @returns {boolean} Whether the rule is satisfied
 */
export const evaluateRule = (rule, i, indicators) => {
    const leftValue = indicators[rule.indicator]?.[i];
    const rightValue = isNaN(Number(rule.value))
        ? indicators[rule.value]?.[i]
        : Number(rule.value);

    if (leftValue === null || leftValue === undefined ||
        rightValue === null || rightValue === undefined) return false;

    return rule.operator === '>'
        ? leftValue > rightValue
        : rule.operator === '<'
            ? leftValue < rightValue
            : false;
};
