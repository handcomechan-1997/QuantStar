/**
 * Backtest Result Component - Enhanced UI
 * Displays backtest performance metrics with equity curve chart
 */

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LineChart, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

const BacktestResult = ({ result }) => {
    const chartRef = useRef(null);
    const echartsInstance = useRef(null);

    useEffect(() => {
        if (!result?.equityCurve || !chartRef.current) return;

        if (!echartsInstance.current) {
            echartsInstance.current = echarts.init(chartRef.current);
        }

        const dates = result.equityCurve.map(d => d.date);
        const equities = result.equityCurve.map(d => d.equity);

        const option = {
            backgroundColor: 'transparent',
            animation: false,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                textStyle: { color: '#e2e8f0', fontSize: 11 },
                formatter: params => {
                    const p = params[0];
                    const ret = ((p.value - 100000) / 100000 * 100).toFixed(2);
                    return `${p.name}<br/>权益: ¥${Number(p.value).toLocaleString()}<br/>收益率: ${ret}%`;
                }
            },
            grid: { left: '10%', right: '4%', top: '8%', bottom: '12%' },
            xAxis: {
                type: 'category', data: dates,
                axisLabel: { color: '#64748b', fontSize: 10 },
                axisLine: { lineStyle: { color: '#1e293b' } }
            },
            yAxis: {
                type: 'value', scale: true,
                axisLabel: {
                    color: '#64748b', fontSize: 10,
                    formatter: v => (v / 10000).toFixed(0) + '万'
                },
                splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
            },
            series: [{
                type: 'line', data: equities,
                smooth: true, symbol: 'none',
                lineStyle: { width: 2.5, color: '#3b82f6' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59,130,246,0.25)' },
                        { offset: 1, color: 'rgba(59,130,246,0.02)' }
                    ])
                },
                markLine: {
                    silent: true,
                    data: [{ yAxis: 100000, lineStyle: { color: '#475569', type: 'dashed', width: 1 } }],
                    label: { show: true, formatter: '初始', color: '#64748b', fontSize: 10 }
                }
            }]
        };

        echartsInstance.current.setOption(option, true);

        const handleResize = () => echartsInstance.current?.resize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [result]);

    useEffect(() => {
        return () => {
            if (echartsInstance.current) {
                echartsInstance.current.dispose();
                echartsInstance.current = null;
            }
        };
    }, []);

    if (!result) return null;

    const isPositiveReturn = Number(result.totalReturn) >= 0;

    return (
        <div className="bg-gradient-to-br from-[#0f1423] to-[#131a2a] rounded-2xl border border-slate-800/80 p-6
            animate-fade-in-up shadow-xl">
            {/* Header */}
            <h3 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <LineChart size={14} className="text-blue-400" />
                </div>
                回测性能分析报告
            </h3>

            {/* Metrics Grid - Enhanced */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                {/* Final Capital */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50
                    hover:border-blue-500/30 transition-all">
                    <div className="text-slate-500 text-[10px] mb-2 font-medium uppercase tracking-wider">
                        期末权益
                    </div>
                    <div className="text-lg font-bold font-mono text-blue-400 price-tag">
                        ¥{Number(result.finalCapital).toLocaleString()}
                    </div>
                </div>

                {/* Total Return */}
                <div className={`p-4 rounded-xl border transition-all ${
                    isPositiveReturn
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-emerald-500/5 border-emerald-500/20'
                }`}>
                    <div className={`text-[10px] mb-2 font-medium uppercase tracking-wider flex items-center gap-1 ${
                        isPositiveReturn ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                        总收益率
                        {isPositiveReturn
                            ? <TrendingUp size={12} />
                            : <TrendingDown size={12} />
                        }
                    </div>
                    <div className={`text-lg font-bold font-mono price-tag ${
                        isPositiveReturn ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                        {result.totalReturn}%
                    </div>
                </div>

                {/* Max Drawdown */}
                <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                    <div className="text-yellow-400 text-[10px] mb-2 font-medium uppercase tracking-wider">
                        最大回撤
                    </div>
                    <div className="text-lg font-bold font-mono text-yellow-500 price-tag">
                        -{result.maxDrawdown}%
                    </div>
                </div>

                {/* Win Rate */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="text-slate-500 text-[10px] mb-2 font-medium uppercase tracking-wider flex items-center gap-1">
                        <BarChart2 size={10} />
                        胜率
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-200 price-tag">
                        {result.winRate}%
                    </div>
                </div>

                {/* Trade Count */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="text-slate-500 text-[10px] mb-2 font-medium uppercase tracking-wider">
                        交易对数
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-200 price-tag">
                        {result.tradeCount}
                    </div>
                </div>
            </div>

            {/* Equity Curve Chart */}
            {result.equityCurve && result.equityCurve.length > 0 && (
                <div className="bg-slate-900/30 rounded-xl border border-slate-800/50 p-4">
                    <div className="text-xs text-slate-500 mb-3 font-medium">权益曲线</div>
                    <div ref={chartRef} className="w-full h-[200px]"></div>
                </div>
            )}
        </div>
    );
};

export default BacktestResult;
