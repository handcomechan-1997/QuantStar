/**
 * Paper Trading Module
 * Main component for paper trading functionality
 * Features: trade confirmation, toast notifications, trade history, account reset
 */

import React, { useState } from 'react';
import { Wallet, Briefcase, Edit3, X, History, RotateCcw, ChevronDown } from 'lucide-react';
import ManualEntry from './ManualEntry';
import PositionCard from './PositionCard';
import TradeConfirmModal from '../TradeConfirmModal';
import { useToast } from '../Toast';

const PaperTrading = ({
    selectedStock,
    marketData,
    paperAccount,
    portfolioPrices,
    onExecuteTrade,
    onAddManualPosition,
    onResetAccount,
    onSelectStock
}) => {
    const [tradeShares, setTradeShares] = useState(100);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [pendingTrade, setPendingTrade] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const toast = useToast();

    const currentPrice = marketData[marketData.length - 1]?.close || 0;
    const dateStr = marketData[marketData.length - 1]?.date || new Date().toISOString().split('T')[0];

    // Calculate total portfolio value
    const totalMarketValue = Object.entries(paperAccount.positions).reduce((acc, [code, pos]) => {
        const price = portfolioPrices[code] || pos.avgCost;
        return acc + pos.shares * price;
    }, 0);
    const totalAssets = paperAccount.cash + totalMarketValue;

    // Open confirmation modal instead of executing directly
    const handleBuy = () => {
        if (tradeShares <= 0) {
            toast.warning('请输入有效的交易数量');
            return;
        }
        setPendingTrade({
            type: 'BUY',
            stockName: selectedStock.name,
            stockCode: selectedStock.code,
            price: currentPrice,
            shares: tradeShares
        });
    };

    const handleSell = () => {
        if (tradeShares <= 0) {
            toast.warning('请输入有效的交易数量');
            return;
        }
        setPendingTrade({
            type: 'SELL',
            stockName: selectedStock.name,
            stockCode: selectedStock.code,
            price: currentPrice,
            shares: tradeShares
        });
    };

    // Execute after confirmation
    const handleConfirmTrade = () => {
        if (!pendingTrade) return;
        const result = onExecuteTrade(
            pendingTrade.type,
            selectedStock,
            pendingTrade.shares,
            pendingTrade.price,
            dateStr
        );
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
        setPendingTrade(null);
    };

    const handleAddManual = (cost, shares) => {
        onAddManualPosition(selectedStock, cost, shares);
        toast.success(`已录入 ${selectedStock.name} ${shares}股，成本 ¥${cost}`);
        setShowManualEntry(false);
    };

    const handleResetAccount = () => {
        onResetAccount();
        setShowResetConfirm(false);
        toast.info('模拟账户已重置为初始状态');
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Account Summary Card - Enhanced */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />

                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Wallet size={14} className="text-blue-400" />
                            <span className="font-medium">总资产</span>
                        </div>
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="group flex items-center gap-1 text-slate-500 hover:text-yellow-400 transition-colors"
                            title="重置账户"
                        >
                            <RotateCcw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    {/* Main Amount */}
                    <div className="mb-5 relative z-10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg text-slate-400">¥</span>
                            <div className="text-4xl font-bold font-mono tracking-tight gradient-text price-tag">
                                {totalAssets.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 relative z-10">
                        <div className="flex-1">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">可用现金</div>
                            <div className="text-base font-mono text-blue-400 price-tag">
                                ¥{paperAccount.cash.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-700/50" />
                        <div className="flex-1 text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">累计盈亏</div>
                            <div
                                className={`text-base font-mono font-bold price-tag ${
                                    totalAssets >= paperAccount.initialCash
                                        ? 'text-red-400'
                                        : 'text-emerald-400'
                                }`}
                            >
                                {totalAssets >= paperAccount.initialCash ? '+' : ''}
                                {(totalAssets - paperAccount.initialCash).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade Form - Enhanced */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                        交易 <span className="text-blue-400 ml-1">{selectedStock.name}</span>
                    </h3>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50 shadow-lg">
                        {/* Current Price Display */}
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                            <span className="text-xs text-slate-500">当前市价</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm text-slate-400">¥</span>
                                <span className="text-xl font-bold font-mono text-white price-tag">
                                    {currentPrice.toFixed(2) || '--'}
                                </span>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="number"
                                    value={tradeShares}
                                    onChange={e => setTradeShares(Number(e.target.value))}
                                    className="flex-1 bg-slate-800 border-2 border-slate-700 text-white rounded-xl py-3 px-4 text-base font-mono
                                        focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                                        transition-all duration-200 input-enhanced"
                                    min="100"
                                    step="100"
                                    placeholder="输入股数"
                                />
                                <span className="text-slate-500 text-sm shrink-0 font-medium">股</span>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="flex gap-2 mb-2">
                                {[
                                    { label: '全仓', amount: Math.floor(paperAccount.cash / currentPrice / 100) * 100 },
                                    { label: '半仓', amount: Math.floor(paperAccount.cash / currentPrice / 200) * 100 },
                                    { label: '1/4仓', amount: Math.floor(paperAccount.cash / currentPrice / 400) * 100 }
                                ].filter(btn => btn.amount >= 100).map(btn => (
                                    <button
                                        key={btn.label}
                                        onClick={() => setTradeShares(btn.amount)}
                                        className="flex-1 py-1.5 text-[10px] font-medium text-blue-400 bg-blue-500/10
                                            hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            {/* Estimated Amount */}
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>最小: 100股</span>
                                <span>预计金额: ¥{(currentPrice * tradeShares).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleBuy}
                                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
                                    text-white rounded-xl font-bold text-sm transition-all duration-200
                                    shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30
                                    active:scale-[0.98] btn-primary"
                            >
                                买入
                            </button>
                            <button
                                onClick={handleSell}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400
                                    text-white rounded-xl font-bold text-sm transition-all duration-200
                                    shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30
                                    active:scale-[0.98] btn-primary"
                            >
                                卖出
                            </button>
                        </div>
                    </div>
                </div>

                {/* Positions & Manual Entry - Enhanced */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                            <Briefcase size={14} className="mr-1.5 text-blue-400" /> 当前持仓
                        </h3>
                        <button
                            onClick={() => setShowManualEntry(!showManualEntry)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            {showManualEntry ? (
                                <>
                                    <X size={12} /> 取消
                                </>
                            ) : (
                                <>
                                    <Edit3 size={12} /> 录入持仓
                                </>
                            )}
                        </button>
                    </div>

                    {/* Manual Entry Form */}
                    {showManualEntry && (
                        <div className="mb-3 animate-fade-in-up">
                            <ManualEntry
                                selectedStock={selectedStock}
                                onAddPosition={handleAddManual}
                                onCancel={() => setShowManualEntry(false)}
                            />
                        </div>
                    )}

                    {/* Position List */}
                    {Object.keys(paperAccount.positions).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                                <Briefcase size={28} className="text-slate-600" />
                            </div>
                            <div className="text-slate-400 text-sm mb-1">暂无持仓</div>
                            <div className="text-slate-600 text-xs">使用上方交易面板买入股票</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(paperAccount.positions).map(([code, pos]) => (
                                <PositionCard
                                    key={code}
                                    code={code}
                                    position={pos}
                                    currentPrice={portfolioPrices[code] || pos.avgCost}
                                    onSelect={onSelectStock}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Trade History - Enhanced */}
                <div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-slate-300 mb-3
                            hover:text-white transition-colors"
                    >
                        <span className="flex items-center">
                            <History size={14} className="mr-1.5 text-purple-400" /> 交易记录
                            {paperAccount.history.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-[10px] font-normal text-slate-400
                                    bg-slate-800 rounded-full">
                                    {paperAccount.history.length}笔
                                </span>
                            )}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
                    </button>

                    {showHistory && (
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in-up">
                            {paperAccount.history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <History size={24} className="text-slate-700 mb-2" />
                                    <div className="text-slate-500 text-xs">暂无交易记录</div>
                                </div>
                            ) : (
                                paperAccount.history.map(trade => (
                                    <div
                                        key={trade.id}
                                        className="group bg-slate-800/30 p-3 rounded-xl border border-slate-700/30
                                            hover:bg-slate-800/50 hover:border-slate-700/50
                                            flex justify-between items-center transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    trade.type === 'BUY'
                                                        ? 'bg-red-500/15 text-red-400'
                                                        : 'bg-emerald-500/15 text-emerald-400'
                                                }`}
                                            >
                                                {trade.type === 'BUY' ? '买入' : '卖出'}
                                            </span>
                                            <span className="text-sm text-slate-300 font-medium">{trade.name}</span>
                                            {trade.isManual && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                                    录入
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 font-mono">
                                                ¥{trade.price.toFixed(2)} × {trade.shares}
                                            </div>
                                            <div className="text-[10px] text-slate-600">{trade.date}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Trade Confirmation Modal */}
            <TradeConfirmModal
                isOpen={!!pendingTrade}
                trade={pendingTrade}
                onConfirm={handleConfirmTrade}
                onCancel={() => setPendingTrade(null)}
            />

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
                    <div className="relative bg-[#131829] border border-slate-700 rounded-2xl shadow-2xl w-[320px] p-5 animate-scale-in">
                        <h3 className="text-white font-bold mb-2">确认重置账户？</h3>
                        <p className="text-slate-400 text-sm mb-5">
                            此操作将清空所有持仓和交易记录，恢复初始资金 ¥1,000,000。此操作不可撤销。
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition text-sm"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleResetAccount}
                                className="flex-1 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition text-sm"
                            >
                                确认重置
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaperTrading;
