/**
 * Paper Trading Module
 * Main component for paper trading functionality
 * Features: trade confirmation, toast notifications, trade history, account reset
 */

import React, { useState } from 'react';
import { Wallet, Briefcase, Edit3, X, History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in">
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Account Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-slate-400 text-xs flex items-center">
                            <Wallet size={14} className="mr-1" /> 总资产 (¥)
                        </div>
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="text-slate-600 hover:text-yellow-400 transition"
                            title="重置账户"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white mb-4 relative z-10">
                        {totalAssets.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </div>

                    <div className="flex justify-between border-t border-slate-700 pt-3 relative z-10">
                        <div>
                            <div className="text-[10px] text-slate-500">可用现金</div>
                            <div className="text-sm font-mono text-blue-400">
                                {paperAccount.cash.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500">累计浮动盈亏</div>
                            <div
                                className={`text-sm font-mono font-bold ${
                                    totalAssets >= paperAccount.initialCash
                                        ? 'text-red-500'
                                        : 'text-emerald-500'
                                }`}
                            >
                                {totalAssets >= paperAccount.initialCash ? '+' : ''}
                                {(totalAssets - paperAccount.initialCash).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade Form */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                        交易 {selectedStock.name}
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>当前市价</span>
                            <span className="font-mono text-white">¥{currentPrice.toFixed(2) || '--'}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="number"
                                value={tradeShares}
                                onChange={e => setTradeShares(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 font-mono"
                                min="100"
                                step="100"
                            />
                            <span className="text-slate-500 text-sm shrink-0">股</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBuy}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold transition active:scale-95"
                            >
                                买入
                            </button>
                            <button
                                onClick={handleSell}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold transition active:scale-95"
                            >
                                卖出
                            </button>
                        </div>
                    </div>
                </div>

                {/* Positions & Manual Entry */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                            <Briefcase size={14} className="mr-1.5" /> 当前持仓与盈亏
                        </h3>
                        <button
                            onClick={() => setShowManualEntry(!showManualEntry)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition"
                        >
                            {showManualEntry ? (
                                <>
                                    <X size={12} className="mr-1" /> 取消
                                </>
                            ) : (
                                <>
                                    <Edit3 size={12} className="mr-1" /> 录入历史持仓
                                </>
                            )}
                        </button>
                    </div>

                    {/* Manual Entry Form */}
                    {showManualEntry && (
                        <ManualEntry
                            selectedStock={selectedStock}
                            onAddPosition={handleAddManual}
                            onCancel={() => setShowManualEntry(false)}
                        />
                    )}

                    {/* Position List */}
                    {Object.keys(paperAccount.positions).length === 0 ? (
                        <div className="text-center text-slate-500 text-xs py-4">空仓状态</div>
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

                {/* Trade History */}
                <div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-slate-300 mb-3"
                    >
                        <span className="flex items-center">
                            <History size={14} className="mr-1.5" /> 交易记录
                            {paperAccount.history.length > 0 && (
                                <span className="ml-2 text-xs font-normal text-slate-500">
                                    ({paperAccount.history.length}笔)
                                </span>
                            )}
                        </span>
                        {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showHistory && (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                            {paperAccount.history.length === 0 ? (
                                <div className="text-center text-slate-500 text-xs py-4">暂无交易记录</div>
                            ) : (
                                paperAccount.history.map(trade => (
                                    <div
                                        key={trade.id}
                                        className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 flex justify-between items-center text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    trade.type === 'BUY'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-emerald-500/20 text-emerald-400'
                                                }`}
                                            >
                                                {trade.type === 'BUY' ? '买' : '卖'}
                                            </span>
                                            <span className="text-slate-300">{trade.name}</span>
                                            {trade.isManual && (
                                                <span className="text-[10px] text-blue-400/60">录入</span>
                                            )}
                                        </div>
                                        <div className="text-right text-slate-400">
                                            <span className="font-mono">¥{trade.price.toFixed(2)}</span>
                                            <span className="mx-1">x</span>
                                            <span className="font-mono">{trade.shares}</span>
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
