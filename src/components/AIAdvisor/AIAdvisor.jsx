/**
 * AI Advisor Component - Enhanced UI
 * Main component for AI-powered investment advice with modern chat interface
 */

import React, { useState } from 'react';
import { Cpu, Settings, Send, Sparkles, Zap } from 'lucide-react';
import ChatMessage from './ChatMessage';

const AIAdvisor = ({
    selectedStock,
    marketData,
    paperAccount,
    portfolioPrices,
    chatMessages,
    setChatMessages
}) => {
    // Read API key from environment variable (set in .env.local)
    const [apiKey, setApiKey] = useState(process.env.REACT_APP_DEEPSEEK_API_KEY || '');
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSendMessage = async (customPrompt = null) => {
        const textToSend = customPrompt || userInput;
        if (!textToSend.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        if (!customPrompt) setUserInput('');
        setIsAnalyzing(true);

        const latestData = marketData[marketData.length - 1];
        const context = `[当前大盘看板] 股票：${selectedStock.name}(${selectedStock.code})。最新收盘价：${latestData?.close || '未知'}，成交量：${latestData?.volume || '未知'}。`;

        try {
            if (!apiKey) {
                setTimeout(() => {
                    setChatMessages(prev => [
                        ...prev,
                        {
                            role: 'ai',
                            content: `**[本地模拟回复]**\n已收到您的请求。根据您的持仓情况，系统计算出浮盈/亏变化。大模型建议关注持仓盈亏比，严格控制风险。\n\n*(提示：填写 DeepSeek API Key 即可获取真实大模型深度研报)*`
                        }
                    ]);
                    setIsAnalyzing(false);
                }, 1500);
                return;
            }

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content:
                                '你是一位专业的A股资产管理顾问。请根据用户提供的行情数据或持仓状态（包含成本与浮盈）给出专业调仓建议。'
                        },
                        ...chatMessages.map(m => ({
                            role: m.role === 'ai' ? 'assistant' : 'user',
                            content: m.content
                        })),
                        { role: 'user', content: `${context}\n用户输入：${textToSend}` }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'ai', content: data.choices[0].message.content }]);
        } catch (error) {
            setChatMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    content: `❌ API 调用失败: ${error.message}。请检查 API Key 且网络支持跨域。`
                }
            ]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzePortfolio = () => {
        const posDetails = Object.entries(paperAccount.positions)
            .map(([code, pos]) => {
                const price = portfolioPrices[code] || pos.avgCost;
                const pnl = (price - pos.avgCost) * pos.shares;
                const pnlPct = ((price - pos.avgCost) / pos.avgCost) * 100;
                return `${pos.name}(${code}): ${pos.shares}股, 成本¥${pos.avgCost.toFixed(2)}, 现价¥${price.toFixed(2)}, 浮动盈亏: ¥${pnl.toFixed(2)}(${pnlPct.toFixed(2)}%)`;
            })
            .join('\n  ');

        const posStr = posDetails ? `\n  ${posDetails}` : '空仓';
        const prompt = `请分析我的模拟账户情况并给出建议：\n- 可用资金: ￥${paperAccount.cash.toFixed(2)}\n- 当前持仓状态: ${posStr}`;
        handleSendMessage(prompt);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Enhanced Header */}
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center
                bg-gradient-to-r from-purple-900/10 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Cpu size={14} className="text-purple-400" />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400
                            animate-pulse" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">DeepSeek AI</span>
                    {apiKey && (
                        <span className="ml-1 px-1.5 py-0.5 text-[9px] text-green-400 bg-green-500/10
                            rounded border border-green-500/20">
                            已连接
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-slate-800
                        transition-all duration-200"
                >
                    <Settings size={14} />
                </button>
            </div>

            {/* API Settings Panel */}
            {showApiSettings && (
                <div className="px-5 py-4 bg-slate-900/50 border-b border-slate-800 animate-fade-in-up">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
                        API Key 配置
                    </div>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-2.5 px-4
                            text-xs text-white font-mono
                            focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10
                            transition-all"
                    />
                    <div className="text-[10px] text-slate-600 mt-2">
                        从环境变量自动加载，也可手动输入
                    </div>
                </div>
            )}

            {/* Quick Action Button */}
            <div className="px-4 py-3 border-b border-slate-800">
                <button
                    onClick={handleAnalyzePortfolio}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600/20 to-purple-500/20
                        hover:from-purple-600/30 hover:to-purple-500/30
                        border border-purple-500/30 text-purple-300 rounded-xl
                        text-xs font-semibold transition-all duration-200
                        flex items-center justify-center gap-2 group
                        shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10"
                >
                    <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                    分析我的模拟持仓
                    <Zap size={12} className="text-purple-400/50" />
                </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg} />
                ))}

                {/* Typing Indicator */}
                {isAnalyzing && (
                    <div className="flex items-start animate-fade-in-up">
                        <div className="w-7 h-7 rounded-lg bg-purple-900/30 flex items-center justify-center mr-3 mt-0.5">
                            <Cpu size={14} className="text-purple-400 animate-pulse" />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl rounded-tl-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce-dot"
                                        style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce-dot"
                                        style={{ animationDelay: '160ms' }} />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce-dot"
                                        style={{ animationDelay: '320ms' }} />
                                </div>
                                <span className="text-xs text-purple-400">AI 正在分析...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Input Area */}
            <div className="p-4 bg-gradient-to-t from-[#0f1423] to-transparent border-t border-slate-800">
                <div className="relative flex items-center bg-slate-900 border-2 border-slate-700
                    rounded-2xl focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 p-1.5
                    transition-all duration-200">
                    <input
                        type="text"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="输入问题，如：分析下现在能买入吗？"
                        className="w-full bg-transparent text-slate-200 text-sm py-2 pl-4 pr-2
                            focus:outline-none placeholder:text-slate-600"
                        disabled={isAnalyzing}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isAnalyzing || !userInput.trim()}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                            flex items-center gap-1.5 ${
                            userInput.trim() && !isAnalyzing
                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                        <Send size={14} />
                        <span className="hidden sm:inline">发送</span>
                    </button>
                </div>

                {/* Hint */}
                <div className="text-[10px] text-slate-600 text-center mt-2">
                    按 Enter 发送 · AI建议仅供参考，不构成投资建议
                </div>
            </div>
        </div>
    );
};

export default AIAdvisor;
