/**
 * Position Card Component - Enhanced UI
 * Displays a single position with PnL calculation and visual indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PositionCard = ({ code, position, currentPrice, onSelect }) => {
    const marketValue = position.shares * currentPrice;
    const costValue = position.shares * position.avgCost;
    const pnl = marketValue - costValue;
    const pnlPercent = costValue > 0 ? (pnl / costValue) * 100 : 0;
    const isProfit = pnl >= 0;

    return (
        <div
            className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl
                border border-slate-700/40 cursor-pointer
                hover:bg-slate-800/80 hover:border-slate-600/50
                transition-all duration-300 shadow-sm hover:shadow-lg
                hover:-translate-y-0.5"
            onClick={() => onSelect(code)}
        >
            {/* Top highlight line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/20 to-transparent rounded-t-xl" />

            <div className="flex justify-between items-start">
                {/* Left: Stock Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Stock Avatar */}
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20
                            flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-400">
                                {position.name.charAt(0)}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-200 truncate">
                                {position.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                {code}
                            </div>
                        </div>
                    </div>

                    {/* Cost & Price Row */}
                    <div className="flex gap-4 text-[11px]">
                        <div>
                            <span className="text-slate-500">成本</span>
                            <span className="ml-1 font-mono text-slate-300">¥{position.avgCost.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">现价</span>
                            <span className="ml-1 font-mono text-slate-300">¥{currentPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Position & PnL */}
                <div className="text-right ml-4">
                    <div className="text-sm font-mono text-white mb-1.5 price-tag">
                        {position.shares}股
                    </div>
                    <div className={`flex items-center justify-end gap-1 mb-1 ${
                        isProfit ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                        {isProfit ? (
                            <TrendingUp size={12} className="shrink-0" />
                        ) : (
                            <TrendingDown size={12} className="shrink-0" />
                        )}
                        <span className="text-sm font-bold price-tag">
                            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </span>
                    </div>
                    <div className={`text-xs font-mono ${
                        isProfit ? 'text-red-400/70' : 'text-emerald-400/70'
                    }`}>
                        ¥{pnl.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500/0 group-hover:bg-blue-500/50
                rounded-l-xl transition-all duration-300" />
        </div>
    );
};

export default PositionCard;
