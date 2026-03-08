/**
 * Manual Entry Component - Enhanced UI
 * Allows manual entry of historical positions
 */

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useToast } from '../Toast';

const ManualEntry = ({ selectedStock, onAddPosition, onCancel }) => {
    const [manualCost, setManualCost] = useState('');
    const [manualShares, setManualShares] = useState('');
    const toast = useToast();

    const handleSubmit = () => {
        const cost = Number(manualCost);
        const shares = Number(manualShares);
        if (cost <= 0 || shares <= 0) {
            toast.warning('请输入有效的成本和股数');
            return;
        }
        onAddPosition(cost, shares);
        setManualCost('');
        setManualShares('');
    };

    const estimatedTotal = (Number(manualCost) * Number(manualShares)) || 0;

    return (
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-blue-500/30 p-5 rounded-2xl mb-3
            animate-fade-in-up shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Plus size={14} className="text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-blue-300">
                        录入历史持仓
                    </span>
                </div>
                <button
                    onClick={onCancel}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Stock Info */}
            <div className="mb-4 p-3 bg-slate-800/50 rounded-xl">
                <div className="text-sm font-medium text-white">{selectedStock.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{selectedStock.code}</div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="text-[10px] text-slate-500 block mb-1.5 uppercase tracking-wider">
                        成本价 (¥)
                    </label>
                    <input
                        type="number"
                        value={manualCost}
                        onChange={e => setManualCost(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-2.5 px-3
                            text-white text-sm font-mono
                            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                            transition-all"
                        placeholder="14.50"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-500 block mb-1.5 uppercase tracking-wider">
                        持股数
                    </label>
                    <input
                        type="number"
                        value={manualShares}
                        onChange={e => setManualShares(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-2.5 px-3
                            text-white text-sm font-mono
                            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                            transition-all"
                        placeholder="1000"
                    />
                </div>
            </div>

            {/* Estimated Total */}
            {estimatedTotal > 0 && (
                <div className="mb-4 p-3 bg-slate-800/30 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 mb-1">预估总成本</div>
                    <div className="text-lg font-bold font-mono text-white price-tag">
                        ¥{estimatedTotal.toLocaleString()}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500
                    hover:from-blue-500 hover:to-blue-400
                    text-white rounded-xl font-semibold text-sm
                    shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                    transition-all duration-200 active:scale-[0.98] btn-primary"
            >
                确认录入
            </button>
        </div>
    );
};

export default ManualEntry;
