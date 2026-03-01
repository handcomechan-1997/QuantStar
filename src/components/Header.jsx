/**
 * Header Component
 * Top navigation bar with stock selector, search, and price display
 */

import React from 'react';
import { TrendingUp, Search, ChevronDown } from 'lucide-react';

const Header = ({
    selectedStock,
    watchlist,
    isWatchlisted,
    marketData,
    isLoadingData,
    dataError,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showDropdown,
    setShowDropdown,
    searchError,
    handleSelectSearchedStock,
    onToggleWatchlist,
    onSelectStock
}) => {
    return (
        <header className="h-16 border-b border-slate-800 bg-[#0f1423] flex items-center px-6 shrink-0 z-20 relative">
            <div className="flex items-center w-64">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                    <TrendingUp size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-wide text-white">
                    Quant<span className="text-blue-400">Star</span>
                </h1>
            </div>

            <div className="flex-1 max-w-3xl mx-auto flex items-center gap-4">
                <div className="relative group w-48">
                    <select
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-2 px-3 appearance-none focus:outline-none focus:border-blue-500 transition cursor-pointer text-sm"
                        value={selectedStock.code}
                        onChange={(e) => {
                            const stock = watchlist.find(s => s.code === e.target.value) || {
                                code: e.target.value,
                                name: e.target.options[e.target.selectedIndex].text
                            };
                            onSelectStock(stock);
                        }}
                    >
                        <optgroup label="我的自选股">
                            {watchlist.map(s => (
                                <option key={s.code} value={s.code}>
                                    {s.name} ({s.code})
                                </option>
                            ))}
                        </optgroup>
                        {!isWatchlisted && (
                            <optgroup label="当前浏览">
                                <option value={selectedStock.code}>
                                    {selectedStock.name} ({selectedStock.code})
                                </option>
                            </optgroup>
                        )}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="输入拼音缩写 (如 gzmt)、股票名或代码..."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                    />
                    {showDropdown && searchQuery.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                            {isSearching ? (
                                <div className="p-3 text-sm text-slate-400 flex items-center justify-center">
                                    <span className="animate-spin border-2 border-slate-500 border-t-transparent rounded-full w-4 h-4 mr-2"></span>
                                    检索中...
                                </div>
                            ) : searchError ? (
                                <div className="p-3 text-sm text-yellow-400 text-center">
                                    {searchError}
                                </div>
                            ) : searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((res, i) => (
                                        <li
                                            key={i}
                                            onClick={() => handleSelectSearchedStock(res, onSelectStock)}
                                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition"
                                        >
                                            <span className="text-sm font-medium text-white">
                                                {res.name} <span className="text-slate-500 ml-2">{res.code}</span>
                                                {res.isDirectCode && <span className="text-xs text-blue-400 ml-2">(直接输入)</span>}
                                            </span>
                                            <span className="text-xs text-slate-500 uppercase">{res.pinyin}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-3 text-sm text-slate-500 text-center">无匹配结果</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-64 flex flex-col items-end">
                {marketData.length > 0 && !isLoadingData ? (
                    <div className="flex items-center">
                        <span
                            className={`text-xl font-bold ${
                                marketData[marketData.length - 1].close >
                                (marketData[marketData.length - 2]?.close || 0)
                                    ? 'text-red-500'
                                    : 'text-emerald-500'
                            }`}
                        >
                            ¥{marketData[marketData.length - 1].close.toFixed(2)}
                        </span>
                    </div>
                ) : isLoadingData ? (
                    <span className="text-sm text-yellow-400">加载数据中...</span>
                ) : (
                    <span className="text-sm text-red-400 text-right">
                        数据中断<br />
                        {dataError}
                    </span>
                )}
            </div>
        </header>
    );
};

export default Header;
