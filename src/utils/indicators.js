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
 * Evaluates a trading rule against historical data
 * @param {Object} rule - Rule object with indicator, operator, and value
 * @param {number} i - Index in the data array
 * @param {Object} indicators - Object containing calculated indicators
 * @returns {boolean} Whether the rule is satisfied
 */
export const evaluateRule = (rule, i, indicators) => {
    const leftValue = indicators[rule.indicator][i];
    const rightValue = isNaN(Number(rule.value))
        ? indicators[rule.value][i]
        : Number(rule.value);

    if (leftValue === null || rightValue === null) return false;

    return rule.operator === '>'
        ? leftValue > rightValue
        : rule.operator === '<'
            ? leftValue < rightValue
            : false;
};
