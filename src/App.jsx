/**
 * QuantStar - Professional A-Share Trading Platform v5.0
 * Main Application Component
 * 
 * Features:
 * - Real-time stock data fetching
 * - Interactive K-line charts with volume and technical indicators
 * - Paper trading simulation with trade confirmation
 * - Strategy backtesting with equity curve
 * - AI-powered investment advice
 * - localStorage persistence
 * - Toast notification system
 */

import React, { useState, useCallback } from 'react';
import { Cpu, MessageSquare, Briefcase } from 'lucide-react';

// Hooks
import { useStockData } from './hooks/useStockData';
import { usePaperAccount } from './hooks/usePaperAccount';
import { useSearch } from './hooks/useSearch';
import { useLocalStorage } from './hooks/useLocalStorage';

// Components
import Header from './components/Header';
import StockChart from './components/StockChart';
import PaperTrading from './components/PaperTrading/PaperTrading';
import StrategyBuilder from './components/Strategy/StrategyBuilder';
import BacktestResult from './components/Strategy/BacktestResult';
import AIAdvisor from './components/AIAdvisor/AIAdvisor';
import { ToastProvider } from './components/Toast';

// Default watchlist
const DEFAULT_WATCHLIST = [
    { code: '600519', name: '贵州茅台' },
    { code: '000001', name: '平安银行' },
    { code: '002594', name: '比亚迪' },
    { code: '300750', name: '宁德时代' }
];

function AppContent() {
    // Persisted State (survives refresh)
    const [watchlist, setWatchlist] = useLocalStorage('watchlist', DEFAULT_WATCHLIST);
    const [selectedStock, setSelectedStock] = useLocalStorage('selected_stock', DEFAULT_WATCHLIST[0]);
    const [chatMessages, setChatMessages] = useLocalStorage('chat_messages', [
        {
            role: 'ai',
            content:
                '您好！我是您的专属 AI 投顾。我可以帮您分析当前股票走势，或者诊断您的模拟账户持仓，给出调仓建议。'
        }
    ]);

    // UI Layout State (not persisted)
    const [activeRightTab, setActiveRightTab] = useState('PAPER');

    // Strategy State
    const [backtestResult, setBacktestResult] = useState(null);
    const [backtestTrades, setBacktestTrades] = useState([]);

    // Custom Hooks
    const { marketData, isLoadingData, dataError, portfolioPrices, updatePortfolioPrices } =
        useStockData(selectedStock);

    const { paperAccount, executePaperTrade, addManualPosition, resetAccount } =
        usePaperAccount(updatePortfolioPrices);

    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        showDropdown,
        setShowDropdown,
        searchError,
        handleSelectSearchedStock
    } = useSearch();

    // Handlers
    const toggleWatchlist = useCallback(() => {
        if (watchlist.some(s => s.code === selectedStock.code)) {
            setWatchlist(prev => prev.filter(s => s.code !== selectedStock.code));
        } else {
            setWatchlist(prev => [...prev, selectedStock]);
        }
    }, [watchlist, selectedStock, setWatchlist]);

    const handleSelectStock = useCallback((stock) => {
        setSelectedStock(stock);
    }, [setSelectedStock]);

    const handleBacktestComplete = useCallback((trades, result) => {
        setBacktestTrades(trades);
        setBacktestResult(result);
    }, []);

    const isWatchlisted = watchlist.some(s => s.code === selectedStock.code);

    return (
        <div className="flex flex-col h-screen bg-[#0b0f19] text-slate-200 font-sans overflow-hidden">
            {/* Top Navigation Bar */}
            <Header
                selectedStock={selectedStock}
                watchlist={watchlist}
                isWatchlisted={isWatchlisted}
                marketData={marketData}
                isLoadingData={isLoadingData}
                dataError={dataError}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                searchError={searchError}
                handleSelectSearchedStock={handleSelectSearchedStock}
                onToggleWatchlist={toggleWatchlist}
                onSelectStock={handleSelectStock}
            />

            {/* Main Content Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Area: Chart */}
                <main className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar min-w-0">
                    <StockChart
                        selectedStock={selectedStock}
                        marketData={marketData}
                        backtestTrades={backtestTrades}
                        paperAccount={paperAccount}
                        isWatchlisted={isWatchlisted}
                        onToggleWatchlist={toggleWatchlist}
                    />

                    {/* Backtest Result */}
                    {backtestResult && activeRightTab === 'STRATEGY' && (
                        <BacktestResult result={backtestResult} />
                    )}
                </main>

                {/* Right Area: Sidebar Tabs - Enhanced */}
                <aside className="w-[420px] max-w-[420px] border-l border-slate-800 bg-[#0f1423]
                    flex flex-col z-10 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] sidebar-panel">
                    {/* Tab Navigation - Enhanced */}
                    <div className="relative flex border-b border-slate-800 bg-slate-900/20">
                        {['STRATEGY', 'PAPER', 'AI'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveRightTab(tab)}
                                className={`relative flex-1 py-4 text-[13px] font-medium
                                    flex justify-center items-center gap-1.5 transition-all duration-200
                                    ${activeRightTab === tab
                                        ? 'text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {tab === 'STRATEGY' && (
                                    <>
                                        <Cpu size={14} /> 策略
                                    </>
                                )}
                                {tab === 'PAPER' && (
                                    <>
                                        <Briefcase size={14} /> 模拟盘
                                    </>
                                )}
                                {tab === 'AI' && (
                                    <>
                                        <MessageSquare size={14} /> AI 投顾
                                    </>
                                )}
                                {/* Active Indicator */}
                                {activeRightTab === tab && (
                                    <div
                                        className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-300 ${
                                            tab === 'PAPER'
                                                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                                                : tab === 'AI'
                                                    ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                                                    : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content with Animation */}
                    <div className="flex-1 overflow-hidden">
                        {activeRightTab === 'PAPER' && (
                            <div className="h-full animate-fade-in-up">
                                <PaperTrading
                                    selectedStock={selectedStock}
                                    marketData={marketData}
                                    paperAccount={paperAccount}
                                    portfolioPrices={portfolioPrices}
                                    onExecuteTrade={executePaperTrade}
                                    onAddManualPosition={addManualPosition}
                                    onResetAccount={resetAccount}
                                    onSelectStock={(code) => setSearchQuery(code)}
                                />
                            </div>
                        )}

                        {activeRightTab === 'AI' && (
                            <div className="h-full animate-fade-in-up">
                                <AIAdvisor
                                    selectedStock={selectedStock}
                                    marketData={marketData}
                                    paperAccount={paperAccount}
                                    portfolioPrices={portfolioPrices}
                                    chatMessages={chatMessages}
                                    setChatMessages={setChatMessages}
                                />
                            </div>
                        )}

                        {activeRightTab === 'STRATEGY' && (
                            <div className="h-full animate-fade-in-up">
                                <StrategyBuilder
                                    marketData={marketData}
                                    onBacktestComplete={handleBacktestComplete}
                                />
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Custom Scrollbar Styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `
                }}
            />
        </div>
    );
}

function App() {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;
