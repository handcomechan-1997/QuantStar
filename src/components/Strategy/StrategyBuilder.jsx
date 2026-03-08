/**
 * Strategy Builder Component - Enhanced UI
 * Features: rule editing, backtesting, equity curve, strategy save/load
 */

import React, { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Save, FolderOpen, X, Zap, Target } from 'lucide-react';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, evaluateRule } from '../../utils/indicators';
import { useToast } from '../Toast';
import { storageGet, storageSet } from '../../hooks/useLocalStorage';

const INDICATORS = [
    { value: 'PRICE', label: '当前价格', color: 'white' },
    { value: 'MA5', label: 'MA5', color: 'yellow' },
    { value: 'MA10', label: 'MA10', color: 'blue' },
    { value: 'MA20', label: 'MA20', color: 'purple' },
    { value: 'RSI', label: 'RSI(14)', color: 'cyan' },
    { value: 'BOLL_UPPER', label: '布林上轨', color: 'orange' },
    { value: 'BOLL_LOWER', label: '布林下轨', color: 'orange' },
    { value: 'DIF', label: 'MACD DIF', color: 'blue' },
    { value: 'DEA', label: 'MACD DEA', color: 'orange' }
];

const OPERATORS = [
    { value: '>', label: '上穿 / 大于', icon: '↑' },
    { value: '<', label: '下穿 / 小于', icon: '↓' }
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
            <div key={rule.id}
                className="flex items-center gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30
                    hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-200">
                {/* Rule Number */}
                <span className="text-xs text-slate-500 w-5 font-mono">{index + 1}.</span>

                {/* Indicator Select */}
                <select
                    value={rule.indicator}
                    onChange={(e) => updateFn(rule.id, 'indicator', e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-slate-700 text-white rounded-lg py-2 px-2.5
                        text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                        transition-all cursor-pointer"
                >
                    {INDICATORS.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                </select>

                {/* Operator Select */}
                <select
                    value={rule.operator}
                    onChange={(e) => updateFn(rule.id, 'operator', e.target.value)}
                    className="w-24 bg-slate-900 border-2 border-slate-700 text-white rounded-lg py-2 px-2.5
                        text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                        transition-all cursor-pointer"
                >
                    {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.icon} {op.label}</option>
                    ))}
                </select>

                {/* Value Select */}
                <select
                    value={rule.value}
                    onChange={(e) => updateFn(rule.id, 'value', e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-slate-700 text-white rounded-lg py-2 px-2.5
                        text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                        transition-all cursor-pointer"
                >
                    {INDICATORS.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                    <optgroup label="数值">
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="70">70</option>
                        <option value="80">80</option>
                    </optgroup>
                </select>

                {/* Delete Button */}
                {rulesList.length > 1 && (
                    <button
                        onClick={() => removeFn(rule.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10
                            transition-all duration-200"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Enhanced Info Banner */}
            <div className="flex items-start text-slate-400 text-xs m-5 mb-3 p-4
                bg-gradient-to-r from-blue-900/20 to-transparent rounded-xl border border-blue-500/20">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 shrink-0">
                    <Target size={16} className="text-blue-400" />
                </div>
                <div>
                    <div className="font-semibold text-slate-300 mb-1">无代码策略回测</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                        配置买卖条件，所有条件同时满足时触发交易信号
                    </div>
                </div>
            </div>

            {/* Strategy Save/Load Buttons */}
            <div className="flex gap-2 px-5 mb-4">
                <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5
                        bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30
                        text-blue-400 rounded-xl text-xs font-medium transition-all duration-200
                        hover:shadow-lg hover:shadow-blue-500/10"
                >
                    <Save size={14} /> 保存策略
                </button>
                <button
                    onClick={() => setShowLoadDialog(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5
                        bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50
                        text-slate-400 rounded-xl text-xs font-medium transition-all duration-200
                        hover:text-white hover:border-slate-600"
                >
                    <FolderOpen size={14} /> 加载策略
                    {savedStrategies.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                            {savedStrategies.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Buy Rules Section - Enhanced */}
            <div className="px-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                        买入条件
                    </h3>
                    <button
                        onClick={addBuyRule}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1
                            px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all"
                    >
                        <Plus size={12} /> 添加
                    </button>
                </div>
                <div className="space-y-2">
                    {buyRules.map((rule, index) => renderRuleRow(rule, index, true))}
                </div>
            </div>

            {/* Sell Rules Section - Enhanced */}
            <div className="px-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                        卖出条件
                    </h3>
                    <button
                        onClick={addSellRule}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1
                            px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all"
                    >
                        <Plus size={12} /> 添加
                    </button>
                </div>
                <div className="space-y-2">
                    {sellRules.map((rule, index) => renderRuleRow(rule, index, false))}
                </div>
            </div>

            {/* Strategy Logic Explanation - Enhanced */}
            <div className="px-5 mb-5">
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-4 rounded-xl border border-slate-700/30">
                    <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                        <div className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <Zap size={12} className="text-yellow-400" />
                            策略逻辑
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>买入：当所有买入条件同时满足时，全仓买入</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>卖出：当所有卖出条件同时满足时，清仓卖出</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
                            <span className="text-slate-500">初始资金：10万元</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-500">一次只能持有一只股票</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Run Backtest Button - Enhanced */}
            <div className="px-5 mt-auto pb-5">
                <button
                    onClick={runBacktestEngine}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500
                        hover:from-blue-500 hover:to-blue-400
                        text-white rounded-xl font-bold text-sm
                        flex justify-center items-center gap-2 transition-all duration-200
                        shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40
                        active:scale-[0.98] btn-primary"
                >
                    <Play size={18} /> 运行回测
                </button>
            </div>

            {/* Save Dialog - Enhanced */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSaveDialog(false)} />
                    <div className="relative bg-gradient-to-br from-[#131829] to-[#0f1423]
                        border border-slate-700/50 rounded-2xl shadow-2xl w-[360px] p-6
                        animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Save size={16} className="text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold">保存策略</h3>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            value={strategyName}
                            onChange={e => setStrategyName(e.target.value)}
                            placeholder="输入策略名称..."
                            className="w-full bg-slate-900 border-2 border-slate-700 text-white rounded-xl
                                py-3 px-4 text-sm focus:outline-none focus:border-blue-500
                                focus:ring-2 focus:ring-blue-500/10 mb-5 transition-all"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveStrategy()}
                        />

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400
                                    hover:text-white hover:border-slate-600 transition-all text-sm"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveStrategy}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500
                                    text-white font-bold hover:from-blue-500 hover:to-blue-400
                                    transition-all text-sm shadow-lg shadow-blue-500/25"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Dialog - Enhanced */}
            {showLoadDialog && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowLoadDialog(false)} />
                    <div className="relative bg-gradient-to-br from-[#131829] to-[#0f1423]
                        border border-slate-700/50 rounded-2xl shadow-2xl w-[400px] p-6
                        animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <FolderOpen size={16} className="text-slate-400" />
                                </div>
                                <h3 className="text-white font-bold">已保存的策略</h3>
                            </div>
                            <button
                                onClick={() => setShowLoadDialog(false)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800
                                    transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Strategy List */}
                        {savedStrategies.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
                                    <FolderOpen size={20} className="text-slate-600" />
                                </div>
                                <div className="text-slate-500 text-sm">暂无保存的策略</div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {savedStrategies.map(s => (
                                    <div
                                        key={s.id}
                                        className="group flex items-center justify-between bg-slate-800/30 p-3 rounded-xl
                                            border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-700/50
                                            transition-all cursor-pointer"
                                    >
                                        <div
                                            className="flex-1"
                                            onClick={() => handleLoadStrategy(s)}
                                        >
                                            <div className="text-sm text-white font-medium mb-0.5">{s.name}</div>
                                            <div className="text-[10px] text-slate-500">
                                                {s.buyRules.length}条买入 / {s.sellRules.length}条卖出 · {s.createdAt}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStrategy(s.id);
                                            }}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10
                                                transition-all opacity-0 group-hover:opacity-100"
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
