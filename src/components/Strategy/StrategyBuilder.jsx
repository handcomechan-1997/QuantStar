/**
 * Strategy Builder Component
 * Main component for strategy configuration and backtesting
 */

import React from 'react';
import { Play, Info } from 'lucide-react';
import { calculateSMA, evaluateRule } from '../../utils/indicators'; // Correct path from Strategy/ to utils/

const StrategyBuilder = ({ marketData, onBacktestComplete }) => {
    // Default trading rules (can be extended with UI in future)
    const buyRules = [
        { indicator: 'PRICE', operator: '>', value: 'MA20' }
    ];
    const sellRules = [
        { indicator: 'PRICE', operator: '<', value: 'MA5' }
    ];

    const runBacktestEngine = () => {
        if (marketData.length === 0) return;

        let cash = 100000;
        let position = 0;
        let maxEquity = cash;
        let maxDrawdown = 0;
        const executedTrades = [];

        const indicators = {
            PRICE: marketData.map(d => d.close),
            MA5: calculateSMA(marketData, 5),
            MA20: calculateSMA(marketData, 20)
        };

        for (let i = 20; i < marketData.length; i++) {
            const price = marketData[i].close;
            const currentEquity = cash + position * price;

            if (currentEquity > maxEquity) maxEquity = currentEquity;
            const dd = (maxEquity - currentEquity) / maxEquity;
            if (dd > maxDrawdown) maxDrawdown = dd;

            const buy = buyRules.every(r => evaluateRule(r, i, indicators));
            const sell = sellRules.every(r => evaluateRule(r, i, indicators));

            if (buy && position === 0) {
                position = Math.floor(cash / price);
                cash -= position * price;
                executedTrades.push({
                    type: 'BUY',
                    date: marketData[i].date,
                    price,
                    shares: position
                });
            } else if (sell && position > 0) {
                cash += position * price;
                executedTrades.push({
                    type: 'SELL',
                    date: marketData[i].date,
                    price,
                    shares: position
                });
                position = 0;
            }
        }

        const finalEquity = cash + position * marketData[marketData.length - 1].close;
        const result = {
            initialCapital: 100000,
            finalCapital: finalEquity.toFixed(2),
            totalReturn: (((finalEquity - 100000) / 100000) * 100).toFixed(2),
            maxDrawdown: (maxDrawdown * 100).toFixed(2),
            tradeCount: Math.floor(executedTrades.length / 2)
        };

        onBacktestComplete(executedTrades, result);
    };

    return (
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center text-slate-400 text-xs mb-4 p-3 bg-blue-900/10 rounded-lg border border-blue-900/30">
                <Info size={14} className="text-blue-400 mr-2 shrink-0" />
                免代码回测：请在下方配置买卖条件组合。
            </div>
            <button
                onClick={runBacktestEngine}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center mt-4"
            >
                <Play size={18} className="mr-2" /> 运行回测
            </button>
        </div>
    );
};

export default StrategyBuilder;
