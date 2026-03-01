/**
 * Backtest Result Component
 * Displays backtest performance metrics
 */

import React from 'react';
import { LineChart } from 'lucide-react';

const BacktestResult = ({ result }) => {
    if (!result) return null;

    return (
        <div className="bg-[#0f1423] rounded-2xl border border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-5 flex items-center">
                <LineChart size={16} className="mr-2 text-blue-400" /> 回测性能分析报告
            </h3>
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">期末权益 (¥)</div>
                    <div className="text-xl font-mono text-blue-400">
                        {Number(result.finalCapital).toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">总收益率</div>
                    <div
                        className={`text-xl font-mono font-bold ${
                            Number(result.totalReturn) >= 0 ? 'text-red-500' : 'text-emerald-500'
                        }`}
                    >
                        {result.totalReturn}%
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">最大回撤</div>
                    <div className="text-xl font-mono text-yellow-500">-{result.maxDrawdown}%</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">交易对数</div>
                    <div className="text-xl font-mono text-slate-200">{result.tradeCount}</div>
                </div>
            </div>
        </div>
    );
};

export default BacktestResult;
