/**
 * Paper Trading Module
 * Main component for paper trading functionality
 */

import React, { useState } from 'react';
import { Wallet, Briefcase, Edit3, X } from 'lucide-react';
import ManualEntry from './ManualEntry';
import PositionCard from './PositionCard';

const PaperTrading = ({
    selectedStock,
    marketData,
    paperAccount,
    portfolioPrices,
    onExecuteTrade,
    onAddManualPosition,
    onSelectStock
}) => {
    const [tradeShares, setTradeShares] = useState(100);
    const [showManualEntry, setShowManualEntry] = useState(false);

    const currentPrice = marketData[marketData.length - 1]?.close || 0;
    const dateStr = marketData[marketData.length - 1]?.date || new Date().toISOString().split('T')[0];

    // Calculate total portfolio value
    const totalMarketValue = Object.entries(paperAccount.positions).reduce((acc, [code, pos]) => {
        const price = portfolioPrices[code] || pos.avgCost;
        return acc + pos.shares * price;
    }, 0);
    const totalAssets = paperAccount.cash + totalMarketValue;

    const handleBuy = () => {
        onExecuteTrade('BUY', selectedStock, tradeShares, currentPrice, dateStr);
    };

    const handleSell = () => {
        onExecuteTrade('SELL', selectedStock, tradeShares, currentPrice, dateStr);
    };

    const handleAddManual = (cost, shares) => {
        onAddManualPosition(selectedStock, cost, shares);
        setShowManualEntry(false);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in">
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Account Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="text-slate-400 text-xs flex items-center mb-1">
                        <Wallet size={14} className="mr-1" /> 总资产 (¥)
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
                            <span className="text-slate-500 text-sm shrink-0">股 (Shares)</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBuy}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold transition active:scale-95"
                            >
                                按市价买入
                            </button>
                            <button
                                onClick={handleSell}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold transition active:scale-95"
                            >
                                按市价卖出
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
            </div>
        </div>
    );
};

export default PaperTrading;
