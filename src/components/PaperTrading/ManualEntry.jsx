/**
 * Manual Entry Component
 * Allows manual entry of historical positions
 */

import React, { useState } from 'react';

const ManualEntry = ({ selectedStock, onAddPosition, onCancel }) => {
    const [manualCost, setManualCost] = useState('');
    const [manualShares, setManualShares] = useState('');

    const handleSubmit = () => {
        const cost = Number(manualCost);
        const shares = Number(manualShares);
        if (cost <= 0 || shares <= 0) {
            alert('请输入有效的成本和股数');
            return;
        }
        onAddPosition(cost, shares);
        setManualCost('');
        setManualShares('');
    };

    return (
        <div className="bg-blue-900/10 border border-blue-800/50 p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="text-xs text-blue-300 mb-3">
                正在将 <strong>{selectedStock.name} ({selectedStock.code})</strong> 录入模拟盘
            </div>
            <div className="flex gap-2 mb-3">
                <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1">买入成本 (¥)</label>
                    <input
                        type="number"
                        value={manualCost}
                        onChange={e => setManualCost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono"
                        placeholder="如: 14.50"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1">持有股数</label>
                    <input
                        type="number"
                        value={manualShares}
                        onChange={e => setManualShares(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono"
                        placeholder="如: 1000"
                    />
                </div>
            </div>
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold transition"
            >
                确认录入
            </button>
        </div>
    );
};

export default ManualEntry;
