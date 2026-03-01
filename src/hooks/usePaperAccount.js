/**
 * Custom Hook for Paper Trading Account Management
 * Handles all paper trading operations and state
 */

import { useState, useEffect } from 'react';

const INITIAL_ACCOUNT = {
    initialCash: 1000000,
    cash: 1000000,
    positions: {},
    history: []
};

export const usePaperAccount = (updatePortfolioPrices) => {
    const [paperAccount, setPaperAccount] = useState(INITIAL_ACCOUNT);

    // Update portfolio prices when positions change
    useEffect(() => {
        updatePortfolioPrices(paperAccount.positions);
    }, [paperAccount.positions, updatePortfolioPrices]);

    /**
     * Execute a paper trade (buy or sell)
     * @param {string} type - 'BUY' or 'SELL'
     * @param {Object} stock - Stock object with code and name
     * @param {number} shares - Number of shares to trade
     * @param {number} currentPrice - Current market price
     * @param {string} dateStr - Date string for the trade
     */
    const executePaperTrade = (type, stock, shares, currentPrice, dateStr) => {
        const totalAmount = currentPrice * shares;

        setPaperAccount(prev => {
            let newCash = prev.cash;
            let newPositions = { ...prev.positions };

            if (type === 'BUY') {
                if (newCash < totalAmount) {
                    alert('资金不足，无法买入！');
                    return prev;
                }
                newCash -= totalAmount;
                const existingPos = newPositions[stock.code] || { name: stock.name, shares: 0, avgCost: 0 };
                const totalCost = (existingPos.shares * existingPos.avgCost) + totalAmount;
                const newShares = existingPos.shares + shares;
                newPositions[stock.code] = {
                    name: stock.name,
                    shares: newShares,
                    avgCost: totalCost / newShares
                };
            } else {
                const existingPos = newPositions[stock.code];
                if (!existingPos || existingPos.shares < shares) {
                    alert('持仓不足，无法卖出！');
                    return prev;
                }
                newCash += totalAmount;
                const newShares = existingPos.shares - shares;
                if (newShares === 0) {
                    delete newPositions[stock.code];
                } else {
                    newPositions[stock.code] = { ...existingPos, shares: newShares };
                }
            }

            const newTrade = {
                id: Date.now(),
                date: dateStr,
                type,
                code: stock.code,
                name: stock.name,
                price: currentPrice,
                shares
            };
            return { ...prev, cash: newCash, positions: newPositions, history: [newTrade, ...prev.history] };
        });
    };

    /**
     * Add manual position entry
     * @param {Object} stock - Stock object with code and name
     * @param {number} cost - Cost price per share
     * @param {number} shares - Number of shares
     */
    const addManualPosition = (stock, cost, shares) => {
        const totalAmount = cost * shares;

        setPaperAccount(prev => {
            let newCash = prev.cash - totalAmount;
            let newPositions = { ...prev.positions };

            const existingPos = newPositions[stock.code] || { name: stock.name, shares: 0, avgCost: 0 };
            const totalCostValue = (existingPos.shares * existingPos.avgCost) + totalAmount;
            const newShares = existingPos.shares + shares;

            newPositions[stock.code] = {
                name: stock.name,
                shares: newShares,
                avgCost: totalCostValue / newShares
            };

            const newTrade = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                type: 'BUY',
                code: stock.code,
                name: stock.name,
                price: cost,
                shares: shares,
                isManual: true
            };
            return { ...prev, cash: newCash, positions: newPositions, history: [newTrade, ...prev.history] };
        });
    };

    return {
        paperAccount,
        executePaperTrade,
        addManualPosition
    };
};
