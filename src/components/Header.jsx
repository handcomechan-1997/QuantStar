/**
 * Header Component - Enhanced UI
 * Top navigation bar with stock selector, search, and price display
 */

import React from 'react';
import { TrendingUp, Search, ChevronDown, TrendingDown } from 'lucide-react';

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
    // Calculate price change
    const latestPrice = marketData[marketData.length - 1]?.close || 0;
    const prevPrice = marketData[marketData.length - 2]?.close || 0;
    const priceChange = latestPrice - prevPrice;
    const priceChangePercent = prevPrice > 0 ? ((priceChange / prevPrice) * 100).toFixed(2) : '0.00';
    const isUp = priceChange >= 0;

    return (
        <header className="h-16 border-b border-slate-800 bg-gradient-to-r from-[#0f1423] to-[#131a2a]
            flex items-center px-6 shrink-0 z-20 relative shadow-lg">
            {/* Logo */}
            <div className="flex items-center w-64">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                    flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                    <TrendingUp size={20} className="text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-wide text-white">
                    Quant<span className="text-blue-400">Star</span>
                </h1>
            </div>

            {/* Search & Select Area */}
            <div className="flex-1 max-w-3xl mx-auto flex items-center gap-4">
                {/* Watchlist Select */}
                <div className="relative group w-48">
                    <select
                        className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 rounded-xl py-2.5 px-3.5
                            appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                            transition-all cursor-pointer text-sm font-medium"
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
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                        text-slate-400 pointer-events-none" />
                </div>

                {/* Search Input */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="搜索股票 (拼音/代码/名称)..."
                        className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 rounded-xl
                            py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500
                            focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                    />

                    {/* Search Dropdown */}
                    {showDropdown && searchQuery.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700
                            rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                            {isSearching ? (
                                <div className="p-4 text-sm text-slate-400 flex items-center justify-center">
                                    <span className="animate-spin border-2 border-slate-500 border-t-transparent
                                        rounded-full w-4 h-4 mr-2" />
                                    检索中...
                                </div>
                            ) : searchError ? (
                                <div className="p-4 text-sm text-yellow-400 text-center">
                                    {searchError}
                                </div>
                            ) : searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((res, i) => (
                                        <li
                                            key={i}
                                            onClick={() => handleSelectSearchedStock(res, onSelectStock)}
                                            className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer
                                                flex justify-between items-center transition-colors"
                                        >
                                            <span className="text-sm font-medium text-white">
                                                {res.name}
                                                <span className="text-slate-500 ml-2 text-xs">{res.code}</span>
                                                {res.isDirectCode && (
                                                    <span className="text-[10px] text-blue-400 ml-2 px-1.5 py-0.5
                                                        bg-blue-500/10 rounded">
                                                        直接输入
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-slate-500 uppercase">{res.pinyin}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-sm text-slate-500 text-center">无匹配结果</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Price Display */}
            <div className="w-64 flex flex-col items-end">
                {marketData.length > 0 && !isLoadingData ? (
                    <div className="flex flex-col items-end">
                        <div className={`text-xl font-bold font-mono price-tag ${
                            isUp ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                            ¥{latestPrice.toFixed(2)}
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${
                            isUp ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span className="font-mono">
                                {isUp ? '+' : ''}{priceChange.toFixed(2)} ({isUp ? '+' : ''}{priceChangePercent}%)
                            </span>
                        </div>
                    </div>
                ) : isLoadingData ? (
                    <div className="flex items-center gap-2">
                        <span className="animate-spin border-2 border-yellow-500 border-t-transparent
                            rounded-full w-4 h-4" />
                        <span className="text-sm text-yellow-400">加载中...</span>
                    </div>
                ) : (
                    <div className="text-right">
                        <span className="text-sm text-red-400">数据中断</span>
                        <div className="text-[10px] text-slate-600">{dataError}</div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
