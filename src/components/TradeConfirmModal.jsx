/**
 * Trade Confirmation Modal
 * Shows order details and requires user confirmation before executing
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const TradeConfirmModal = ({ isOpen, trade, onConfirm, onCancel }) => {
    if (!isOpen || !trade) return null;

    const totalAmount = trade.price * trade.shares;
    const isBuy = trade.type === 'BUY';

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

            {/* Modal */}
            <div className="relative bg-[#131829] border border-slate-700 rounded-2xl shadow-2xl w-[360px] animate-scale-in">
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-700 ${
                    isBuy ? 'bg-red-500/5' : 'bg-emerald-500/5'
                }`}>
                    <h3 className={`font-bold ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isBuy ? '买入确认' : '卖出确认'}
                    </h3>
                    <button onClick={onCancel} className="text-slate-500 hover:text-white transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Stock Info */}
                    <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">{trade.stockName}</span>
                        <span className="text-slate-400 font-mono text-sm">{trade.stockCode}</span>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-slate-900/60 rounded-xl p-4 space-y-3 border border-slate-800">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">委托方向</span>
                            <span className={`font-semibold text-sm ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isBuy ? '买入' : '卖出'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">委托价格</span>
                            <span className="text-white font-mono text-sm">¥{trade.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">委托数量</span>
                            <span className="text-white font-mono text-sm">{trade.shares.toLocaleString()} 股</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between">
                            <span className="text-slate-400 text-sm font-semibold">委托金额</span>
                            <span className="text-white font-mono font-bold">
                                ¥{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 text-xs text-yellow-400/80 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/20">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>模拟交易以收盘价成交，实际市场可能存在滑点差异。</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 pt-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition text-sm font-medium"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-white font-bold transition text-sm active:scale-95 ${
                            isBuy
                                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
                        }`}
                    >
                        确认{isBuy ? '买入' : '卖出'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeConfirmModal;
