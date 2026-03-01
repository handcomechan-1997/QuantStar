/**
 * Backtest Result Component
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
                lineStyle: { width: 2, color: '#3b82f6' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59,130,246,0.3)' },
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
        <div className="bg-[#0f1423] rounded-2xl border border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-5 flex items-center">
                <LineChart size={16} className="mr-2 text-blue-400" /> 回测性能分析报告
            </h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">期末权益 (¥)</div>
                    <div className="text-lg font-mono text-blue-400">
                        {Number(result.finalCapital).toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium flex items-center gap-1">
                        总收益率
                        {isPositiveReturn ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-emerald-500" />}
                    </div>
                    <div className={`text-lg font-mono font-bold ${isPositiveReturn ? 'text-red-500' : 'text-emerald-500'}`}>
                        {result.totalReturn}%
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">最大回撤</div>
                    <div className="text-lg font-mono text-yellow-500">-{result.maxDrawdown}%</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium flex items-center gap-1">
                        <BarChart2 size={12} /> 胜率
                    </div>
                    <div className="text-lg font-mono text-slate-200">{result.winRate}%</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-500 text-xs mb-1.5 font-medium">交易对数</div>
                    <div className="text-lg font-mono text-slate-200">{result.tradeCount}</div>
                </div>
            </div>

            {/* Equity Curve Chart */}
            {result.equityCurve && result.equityCurve.length > 0 && (
                <div className="bg-slate-900/30 rounded-xl border border-slate-800/50 p-3">
                    <div className="text-xs text-slate-500 mb-2 font-medium">权益曲线</div>
                    <div ref={chartRef} className="w-full h-[200px]"></div>
                </div>
            )}
        </div>
    );
};

export default BacktestResult;
