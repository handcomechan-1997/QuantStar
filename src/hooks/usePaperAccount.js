/**
 * Custom Hook for Paper Trading Account Management
 * Handles all paper trading operations and state with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { storageGet, storageSet } from './useLocalStorage';

const STORAGE_KEY = 'paper_account';

const INITIAL_ACCOUNT = {
    initialCash: 1000000,
    cash: 1000000,
    positions: {},
    history: []
};

export const usePaperAccount = (updatePortfolioPrices) => {
    const [paperAccount, setPaperAccount] = useState(() => {
        return storageGet(STORAGE_KEY, INITIAL_ACCOUNT);
    });

    // Persist to localStorage whenever account changes
    useEffect(() => {
        storageSet(STORAGE_KEY, paperAccount);
    }, [paperAccount]);

    // Update portfolio prices when positions change
    useEffect(() => {
        updatePortfolioPrices(paperAccount.positions);
    }, [paperAccount.positions, updatePortfolioPrices]);

    /**
     * Execute a paper trade (buy or sell)
     * Returns { success: boolean, message: string } instead of using alert()
     */
    const executePaperTrade = useCallback((type, stock, shares, currentPrice, dateStr) => {
        const totalAmount = currentPrice * shares;
        let result = { success: false, message: '' };

        setPaperAccount(prev => {
            let newCash = prev.cash;
            let newPositions = { ...prev.positions };

            if (type === 'BUY') {
                if (newCash < totalAmount) {
                    result = { success: false, message: '资金不足，无法买入！' };
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
                result = { success: true, message: `成功买入 ${stock.name} ${shares}股，成交金额 ¥${totalAmount.toLocaleString()}` };
            } else {
                const existingPos = newPositions[stock.code];
                if (!existingPos || existingPos.shares < shares) {
                    result = { success: false, message: '持仓不足，无法卖出！' };
                    return prev;
                }
                newCash += totalAmount;
                const newShares = existingPos.shares - shares;
                if (newShares === 0) {
                    delete newPositions[stock.code];
                } else {
                    newPositions[stock.code] = { ...existingPos, shares: newShares };
                }
                result = { success: true, message: `成功卖出 ${stock.name} ${shares}股，回收金额 ¥${totalAmount.toLocaleString()}` };
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

        return result;
    }, []);

    /**
     * Add manual position entry
     */
    const addManualPosition = useCallback((stock, cost, shares) => {
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
    }, []);

    /**
     * Reset account to initial state
     */
    const resetAccount = useCallback(() => {
        setPaperAccount(INITIAL_ACCOUNT);
    }, []);

    return {
        paperAccount,
        executePaperTrade,
        addManualPosition,
        resetAccount
    };
};
