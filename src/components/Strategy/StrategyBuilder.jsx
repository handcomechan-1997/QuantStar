/**
 * Strategy Builder Component
 * Main component for strategy configuration and backtesting
 */

import React, { useState } from 'react';
import { Play, Info, Plus, Trash2 } from 'lucide-react';
import { calculateSMA, evaluateRule } from '../../utils/indicators';

const INDICATORS = [
    { value: 'PRICE', label: '当前价格' },
    { value: 'MA5', label: 'MA5 均线' },
    { value: 'MA10', label: 'MA10 均线' },
    { value: 'MA20', label: 'MA20 均线' }
];

const OPERATORS = [
    { value: '>', label: '上穿 / 大于' },
    { value: '<', label: '下穿 / 小于' }
];

const StrategyBuilder = ({ marketData, onBacktestComplete }) => {
    const [buyRules, setBuyRules] = useState([
        { id: 1, indicator: 'PRICE', operator: '>', value: 'MA20' }
    ]);
    const [sellRules, setSellRules] = useState([
        { id: 1, indicator: 'PRICE', operator: '<', value: 'MA5' }
    ]);

    // Add a new buy rule
    const addBuyRule = () => {
        const newId = Math.max(...buyRules.map(r => r.id), 0) + 1;
        setBuyRules([...buyRules, { id: newId, indicator: 'PRICE', operator: '>', value: 'MA20' }]);
    };

    // Add a new sell rule
    const addSellRule = () => {
        const newId = Math.max(...sellRules.map(r => r.id), 0) + 1;
        setSellRules([...sellRules, { id: newId, indicator: 'PRICE', operator: '<', value: 'MA5' }]);
    };

    // Remove a buy rule
    const removeBuyRule = (id) => {
        if (buyRules.length > 1) {
            setBuyRules(buyRules.filter(r => r.id !== id));
        }
    };

    // Remove a sell rule
    const removeSellRule = (id) => {
        if (sellRules.length > 1) {
            setSellRules(sellRules.filter(r => r.id !== id));
        }
    };

    // Update a buy rule
    const updateBuyRule = (id, field, value) => {
        setBuyRules(buyRules.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    };

    // Update a sell rule
    const updateSellRule = (id, field, value) => {
        setSellRules(sellRules.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const runBacktestEngine = () => {
        if (marketData.length === 0) return;

        // Calculate all indicators
        const indicators = {
            PRICE: marketData.map(d => d.close),
            MA5: calculateSMA(marketData, 5),
            MA10: calculateSMA(marketData, 10),
            MA20: calculateSMA(marketData, 20)
        };

        let cash = 100000;
        let position = 0;
        let maxEquity = cash;
        let maxDrawdown = 0;
        const executedTrades = [];

        for (let i = 20; i < marketData.length; i++) {
            const price = marketData[i].close;
            const currentEquity = cash + position * price;

            if (currentEquity > maxEquity) maxEquity = currentEquity;
            const dd = (maxEquity - currentEquity) / maxEquity;
            if (dd > maxDrawdown) maxDrawdown = dd;

            // Evaluate buy rules (ALL must be true)
            const buy = buyRules.every(r => evaluateRule(r, i, indicators));
            
            // Evaluate sell rules (ALL must be true)
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
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Info Banner */}
            <div className="flex items-center text-slate-400 text-xs m-5 mb-3 p-3 bg-blue-900/10 rounded-lg border border-blue-900/30">
                <Info size={14} className="text-blue-400 mr-2 shrink-0" />
                免代码回测：配置买卖条件，所有条件同时满足时触发交易信号。
            </div>

            {/* Buy Rules Section */}
            <div className="px-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-red-400 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        买入条件
                    </h3>
                    <button
                        onClick={addBuyRule}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition"
                    >
                        <Plus size={12} className="mr-1" /> 添加条件
                    </button>
                </div>

                <div className="space-y-2">
                    {buyRules.map((rule, index) => (
                        <div key={rule.id} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                            
                            <select
                                value={rule.indicator}
                                onChange={(e) => updateBuyRule(rule.id, 'indicator', e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {INDICATORS.map(ind => (
                                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                                ))}
                            </select>

                            <select
                                value={rule.operator}
                                onChange={(e) => updateBuyRule(rule.id, 'operator', e.target.value)}
                                className="w-24 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {OPERATORS.map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                            </select>

                            <select
                                value={rule.value}
                                onChange={(e) => updateBuyRule(rule.id, 'value', e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {INDICATORS.map(ind => (
                                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                                ))}
                            </select>

                            {buyRules.length > 1 && (
                                <button
                                    onClick={() => removeBuyRule(rule.id)}
                                    className="text-slate-500 hover:text-red-400 transition p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sell Rules Section */}
            <div className="px-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        卖出条件
                    </h3>
                    <button
                        onClick={addSellRule}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition"
                    >
                        <Plus size={12} className="mr-1" /> 添加条件
                    </button>
                </div>

                <div className="space-y-2">
                    {sellRules.map((rule, index) => (
                        <div key={rule.id} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                            
                            <select
                                value={rule.indicator}
                                onChange={(e) => updateSellRule(rule.id, 'indicator', e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {INDICATORS.map(ind => (
                                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                                ))}
                            </select>

                            <select
                                value={rule.operator}
                                onChange={(e) => updateSellRule(rule.id, 'operator', e.target.value)}
                                className="w-24 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {OPERATORS.map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                            </select>

                            <select
                                value={rule.value}
                                onChange={(e) => updateSellRule(rule.id, 'value', e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                            >
                                {INDICATORS.map(ind => (
                                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                                ))}
                            </select>

                            {sellRules.length > 1 && (
                                <button
                                    onClick={() => removeSellRule(rule.id)}
                                    className="text-slate-500 hover:text-red-400 transition p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Strategy Logic Explanation */}
            <div className="px-5 mb-4">
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                        <div className="font-semibold text-slate-300 mb-1">策略逻辑：</div>
                        <div>• 买入：当所有买入条件同时满足时，全仓买入</div>
                        <div>• 卖出：当所有卖出条件同时满足时，清仓卖出</div>
                        <div>• 初始资金：10万元，一次只能持有一只股票</div>
                    </div>
                </div>
            </div>

            {/* Run Backtest Button */}
            <div className="px-5 mt-auto pb-5">
                <button
                    onClick={runBacktestEngine}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center transition shadow-lg shadow-blue-500/20"
                >
                    <Play size={18} className="mr-2" /> 运行回测
                </button>
            </div>
        </div>
    );
};

export default StrategyBuilder;
