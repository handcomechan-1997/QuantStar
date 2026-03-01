/**
 * Strategy Builder Component
 * Features: rule editing, backtesting, equity curve, strategy save/load
 */

import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Trash2, Save, FolderOpen, X } from 'lucide-react';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, evaluateRule } from '../../utils/indicators';
import { useToast } from '../Toast';
import { storageGet, storageSet } from '../../hooks/useLocalStorage';

const INDICATORS = [
    { value: 'PRICE', label: '当前价格' },
    { value: 'MA5', label: 'MA5 均线' },
    { value: 'MA10', label: 'MA10 均线' },
    { value: 'MA20', label: 'MA20 均线' },
    { value: 'RSI', label: 'RSI(14)' },
    { value: 'BOLL_UPPER', label: '布林上轨' },
    { value: 'BOLL_LOWER', label: '布林下轨' },
    { value: 'DIF', label: 'MACD DIF' },
    { value: 'DEA', label: 'MACD DEA' }
];

const OPERATORS = [
    { value: '>', label: '上穿 / 大于' },
    { value: '<', label: '下穿 / 小于' }
];

const StrategyBuilder = ({ marketData, onBacktestComplete }) => {
    const toast = useToast();
    const [buyRules, setBuyRules] = useState([
        { id: 1, indicator: 'PRICE', operator: '>', value: 'MA20' }
    ]);
    const [sellRules, setSellRules] = useState([
        { id: 1, indicator: 'PRICE', operator: '<', value: 'MA5' }
    ]);
    const [savedStrategies, setSavedStrategies] = useState(() => storageGet('strategies', []));
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [strategyName, setStrategyName] = useState('');

    // Persist strategies
    useEffect(() => {
        storageSet('strategies', savedStrategies);
    }, [savedStrategies]);

    // Rule CRUD
    const addBuyRule = () => {
        const newId = Math.max(...buyRules.map(r => r.id), 0) + 1;
        setBuyRules([...buyRules, { id: newId, indicator: 'PRICE', operator: '>', value: 'MA20' }]);
    };

    const addSellRule = () => {
        const newId = Math.max(...sellRules.map(r => r.id), 0) + 1;
        setSellRules([...sellRules, { id: newId, indicator: 'PRICE', operator: '<', value: 'MA5' }]);
    };

    const removeBuyRule = (id) => {
        if (buyRules.length > 1) setBuyRules(buyRules.filter(r => r.id !== id));
    };

    const removeSellRule = (id) => {
        if (sellRules.length > 1) setSellRules(sellRules.filter(r => r.id !== id));
    };

    const updateBuyRule = (id, field, value) => {
        setBuyRules(buyRules.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const updateSellRule = (id, field, value) => {
        setSellRules(sellRules.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    };

    // Save / Load
    const handleSaveStrategy = () => {
        if (!strategyName.trim()) {
            toast.warning('请输入策略名称');
            return;
        }
        const strategy = {
            id: Date.now(),
            name: strategyName.trim(),
            buyRules,
            sellRules,
            createdAt: new Date().toLocaleDateString()
        };
        setSavedStrategies(prev => [strategy, ...prev]);
        setStrategyName('');
        setShowSaveDialog(false);
        toast.success(`策略「${strategy.name}」已保存`);
    };

    const handleLoadStrategy = (strategy) => {
        setBuyRules(strategy.buyRules);
        setSellRules(strategy.sellRules);
        setShowLoadDialog(false);
        toast.info(`已加载策略「${strategy.name}」`);
    };

    const handleDeleteStrategy = (id) => {
        setSavedStrategies(prev => prev.filter(s => s.id !== id));
        toast.info('策略已删除');
    };

    const runBacktestEngine = () => {
        if (marketData.length === 0) {
            toast.warning('暂无行情数据，无法回测');
            return;
        }

        const closes = marketData.map(d => d.close);
        const rsi = calculateRSI(marketData, 14);
        const macd = calculateMACD(marketData);
        const boll = calculateBollingerBands(marketData);

        const indicators = {
            PRICE: closes,
            MA5: calculateSMA(marketData, 5),
            MA10: calculateSMA(marketData, 10),
            MA20: calculateSMA(marketData, 20),
            RSI: rsi,
            BOLL_UPPER: boll.upper,
            BOLL_LOWER: boll.lower,
            DIF: macd.dif,
            DEA: macd.dea
        };

        let cash = 100000;
        let position = 0;
        let maxEquity = cash;
        let maxDrawdown = 0;
        const executedTrades = [];
        const equityCurve = [];

        for (let i = 26; i < marketData.length; i++) {
            const price = marketData[i].close;
            const currentEquity = cash + position * price;

            equityCurve.push({
                date: marketData[i].date,
                equity: Number(currentEquity.toFixed(2))
            });

            if (currentEquity > maxEquity) maxEquity = currentEquity;
            const dd = (maxEquity - currentEquity) / maxEquity;
            if (dd > maxDrawdown) maxDrawdown = dd;

            const buy = buyRules.every(r => evaluateRule(r, i, indicators));
            const sell = sellRules.every(r => evaluateRule(r, i, indicators));

            if (buy && position === 0) {
                position = Math.floor(cash / price);
                cash -= position * price;
                executedTrades.push({
                    type: 'BUY', date: marketData[i].date, price, shares: position
                });
            } else if (sell && position > 0) {
                cash += position * price;
                executedTrades.push({
                    type: 'SELL', date: marketData[i].date, price, shares: position
                });
                position = 0;
            }
        }

        const finalEquity = cash + position * marketData[marketData.length - 1].close;

        // Calculate win rate
        let wins = 0;
        let totalPairs = 0;
        for (let i = 0; i < executedTrades.length - 1; i += 2) {
            if (executedTrades[i].type === 'BUY' && executedTrades[i + 1]?.type === 'SELL') {
                totalPairs++;
                if (executedTrades[i + 1].price > executedTrades[i].price) wins++;
            }
        }

        const result = {
            initialCapital: 100000,
            finalCapital: finalEquity.toFixed(2),
            totalReturn: (((finalEquity - 100000) / 100000) * 100).toFixed(2),
            maxDrawdown: (maxDrawdown * 100).toFixed(2),
            tradeCount: Math.floor(executedTrades.length / 2),
            winRate: totalPairs > 0 ? ((wins / totalPairs) * 100).toFixed(1) : '0.0',
            equityCurve
        };

        onBacktestComplete(executedTrades, result);
        toast.success(`回测完成：收益率 ${result.totalReturn}%，共 ${result.tradeCount} 笔交易`);
    };

    const renderRuleRow = (rule, index, isBuy) => {
        const updateFn = isBuy ? updateBuyRule : updateSellRule;
        const removeFn = isBuy ? removeBuyRule : removeSellRule;
        const rulesList = isBuy ? buyRules : sellRules;

        return (
            <div key={rule.id} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                <select
                    value={rule.indicator}
                    onChange={(e) => updateFn(rule.id, 'indicator', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                >
                    {INDICATORS.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                </select>
                <select
                    value={rule.operator}
                    onChange={(e) => updateFn(rule.id, 'operator', e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                >
                    {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                </select>
                <select
                    value={rule.value}
                    onChange={(e) => updateFn(rule.id, 'value', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-blue-500"
                >
                    {INDICATORS.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                    <option value="30">数值: 30</option>
                    <option value="50">数值: 50</option>
                    <option value="70">数值: 70</option>
                    <option value="80">数值: 80</option>
                </select>
                {rulesList.length > 1 && (
                    <button
                        onClick={() => removeFn(rule.id)}
                        className="text-slate-500 hover:text-red-400 transition p-1"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Info Banner */}
            <div className="flex items-center text-slate-400 text-xs m-5 mb-3 p-3 bg-blue-900/10 rounded-lg border border-blue-900/30">
                <Info size={14} className="text-blue-400 mr-2 shrink-0" />
                免代码回测：配置买卖条件，所有条件同时满足时触发交易信号。
            </div>

            {/* Strategy Save/Load buttons */}
            <div className="flex gap-2 px-5 mb-3">
                <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition"
                >
                    <Save size={12} /> 保存策略
                </button>
                <button
                    onClick={() => setShowLoadDialog(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800 transition"
                >
                    <FolderOpen size={12} /> 加载策略
                    {savedStrategies.length > 0 && (
                        <span className="text-[10px] text-blue-400">({savedStrategies.length})</span>
                    )}
                </button>
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
                    {buyRules.map((rule, index) => renderRuleRow(rule, index, true))}
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
                    {sellRules.map((rule, index) => renderRuleRow(rule, index, false))}
                </div>
            </div>

            {/* Strategy Logic Explanation */}
            <div className="px-5 mb-4">
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                        <div className="font-semibold text-slate-300 mb-1">策略逻辑：</div>
                        <div>买入：当所有买入条件同时满足时，全仓买入</div>
                        <div>卖出：当所有卖出条件同时满足时，清仓卖出</div>
                        <div>初始资金：10万元，一次只能持有一只股票</div>
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

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)} />
                    <div className="relative bg-[#131829] border border-slate-700 rounded-2xl shadow-2xl w-[340px] p-5 animate-scale-in">
                        <h3 className="text-white font-bold mb-3">保存策略</h3>
                        <input
                            type="text"
                            value={strategyName}
                            onChange={e => setStrategyName(e.target.value)}
                            placeholder="输入策略名称..."
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 mb-4"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveStrategy()}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition text-sm"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveStrategy}
                                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition text-sm"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Dialog */}
            {showLoadDialog && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoadDialog(false)} />
                    <div className="relative bg-[#131829] border border-slate-700 rounded-2xl shadow-2xl w-[380px] p-5 animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold">已保存的策略</h3>
                            <button onClick={() => setShowLoadDialog(false)} className="text-slate-500 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>
                        {savedStrategies.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm py-6">暂无保存的策略</div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {savedStrategies.map(s => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition"
                                    >
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleLoadStrategy(s)}
                                        >
                                            <div className="text-sm text-white font-medium">{s.name}</div>
                                            <div className="text-[10px] text-slate-500">
                                                {s.buyRules.length}条买入 / {s.sellRules.length}条卖出 · {s.createdAt}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteStrategy(s.id)}
                                            className="text-slate-600 hover:text-red-400 transition p-1 ml-2"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrategyBuilder;
