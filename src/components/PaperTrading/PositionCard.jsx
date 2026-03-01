/**
 * Position Card Component
 * Displays a single position with PnL calculation
 */

import React from 'react';

const PositionCard = ({ code, position, currentPrice, onSelect }) => {
    const marketValue = position.shares * currentPrice;
    const costValue = position.shares * position.avgCost;
    const pnl = marketValue - costValue;
    const pnlPercent = costValue > 0 ? (pnl / costValue) * 100 : 0;
    const isProfit = pnl >= 0;

    return (
        <div
            className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition shadow-sm"
            onClick={() => onSelect(code)}
        >
            <div>
                <div className="text-sm font-medium text-slate-200">
                    {position.name} <span className="text-[10px] text-slate-500">{code}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                    成本: <span className="font-mono">¥{position.avgCost.toFixed(2)}</span> | 现价:{' '}
                    <span className="font-mono">¥{currentPrice.toFixed(2)}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-mono text-white">{position.shares} 股</div>
                <div
                    className={`text-xs font-mono mt-1 font-bold ${
                        isProfit ? 'text-red-500' : 'text-emerald-500'
                    }`}
                >
                    {isProfit ? '+' : ''}{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </div>
            </div>
        </div>
    );
};

export default PositionCard;
