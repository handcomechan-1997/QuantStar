/**
 * AI Advisor Component
 * Main component for AI-powered investment advice
 */

import React, { useState } from 'react';
import { Cpu, Settings, Wallet, Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

const AIAdvisor = ({
    selectedStock,
    marketData,
    paperAccount,
    portfolioPrices,
    onAnalyzePortfolio
}) => {
    // Read API key from environment variable (set in .env.local)
    const [apiKey, setApiKey] = useState(process.env.REACT_APP_DEEPSEEK_API_KEY || '');
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: 'ai',
            content:
                '您好！我是您的专属 AI 投顾。我可以帮您分析当前股票走势，或者诊断您的模拟账户持仓，给出调仓建议。'
        }
    ]);
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
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in">
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                <span className="text-xs text-slate-400 flex items-center">
                    <Cpu size={12} className="mr-1" /> AI 模型
                    {apiKey && (
                        <span className="ml-2 text-green-400 text-[10px]">● 已配置</span>
                    )}
                </span>
                <button
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="text-slate-500 hover:text-purple-400"
                >
                    <Settings size={14} />
                </button>
            </div>

            {showApiSettings && (
                <div className="px-5 py-3 bg-slate-900 border-b border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-1.5">
                        DeepSeek API Key (已从环境变量加载)
                    </div>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="DeepSeek API Key..."
                        className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                </div>
            )}

            <div className="px-4 py-2 border-b border-slate-800 bg-purple-900/10">
                <button
                    onClick={handleAnalyzePortfolio}
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition flex items-center justify-center"
                >
                    <Wallet size={12} className="mr-1.5" /> 分析我的模拟持仓情况
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg} />
                ))}
                {isAnalyzing && (
                    <div className="flex items-start">
                        <div className="w-5 h-5 rounded bg-purple-900/50 flex items-center justify-center mr-2 mt-1">
                            <Cpu size={12} className="text-purple-400 animate-pulse" />
                        </div>
                        <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-sm text-xs text-purple-400 flex space-x-1">
                            <span>模型思考中</span>
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>
                                .
                            </span>
                            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>
                                .
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[#0f1423] border-t border-slate-800 shrink-0">
                <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 p-1">
                    <input
                        type="text"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="例如：帮我分析下目前能买入吗？"
                        className="w-full bg-transparent text-slate-200 text-sm py-2 pl-3 pr-2 focus:outline-none"
                        disabled={isAnalyzing}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isAnalyzing || !userInput.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white w-8 h-8 flex justify-center items-center rounded-lg transition shrink-0 mr-1"
                    >
                        <Send size={14} className={userInput.trim() && !isAnalyzing ? 'ml-0.5' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAdvisor;
