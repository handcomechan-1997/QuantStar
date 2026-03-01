/**
 * Stock Chart Component
 * Displays K-line chart with moving averages and trade markers
 */

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Star } from 'lucide-react';
import { calculateSMA } from '../utils/indicators';

const StockChart = ({
    selectedStock,
    marketData,
    backtestTrades,
    paperAccount,
    isWatchlisted,
    onToggleWatchlist
}) => {
    const chartRef = useRef(null);
    const echartsInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || marketData.length === 0) return;
        if (!echartsInstance.current) {
            echartsInstance.current = echarts.init(chartRef.current);
        }

        const dates = marketData.map(d => d.date);
        const klineData = marketData.map(d => [d.open, d.close, d.low, d.high]);
        const ma5 = calculateSMA(marketData, 5);
        const ma20 = calculateSMA(marketData, 20);

        const markPointData = backtestTrades.map(trade => ({
            name: trade.type,
            coord: [trade.date, trade.price],
            value: trade.type === 'BUY' ? 'B' : 'S',
            itemStyle: { color: trade.type === 'BUY' ? '#ef4444' : '#10b981' }
        }));

        paperAccount.history
            .filter(t => t.code === selectedStock.code)
            .forEach(trade => {
                markPointData.push({
                    name: 'Manual ' + trade.type,
                    coord: [trade.date, trade.price],
                    value: trade.type === 'BUY' ? '买' : '卖',
                    itemStyle: {
                        color: trade.type === 'BUY' ? '#b91c1c' : '#047857',
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                });
            });

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { color: '#475569' } }
            },
            legend: {
                data: ['K线', 'MA5', 'MA20'],
                textStyle: { color: '#94a3b8' },
                top: 10
            },
            grid: { left: '8%', right: '3%', top: '15%', bottom: '15%' },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { color: '#64748b' },
                axisLine: { lineStyle: { color: '#334155' } }
            },
            yAxis: {
                scale: true,
                axisLabel: { color: '#64748b' },
                splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
            },
            dataZoom: [
                { type: 'inside', start: 60, end: 100 },
                {
                    show: true,
                    type: 'slider',
                    bottom: 10,
                    height: 20,
                    borderColor: 'transparent',
                    fillerColor: 'rgba(59, 130, 246, 0.2)',
                    textStyle: { color: 'transparent' }
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: klineData,
                    itemStyle: {
                        color: '#ef4444',
                        color0: '#10b981',
                        borderColor: '#ef4444',
                        borderColor0: '#10b981'
                    },
                    markPoint: {
                        data: markPointData,
                        label: { formatter: '{c}', color: '#fff', fontSize: 10 },
                        symbolSize: 35
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: ma5,
                    smooth: true,
                    lineStyle: { width: 1.5, color: '#eab308' },
                    symbol: 'none'
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: ma20,
                    smooth: true,
                    lineStyle: { width: 1.5, color: '#a855f7' },
                    symbol: 'none'
                }
            ]
        };

        echartsInstance.current.setOption(option);
        const handleResize = () => echartsInstance.current?.resize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [marketData, backtestTrades, paperAccount.history, selectedStock]);

    return (
        <>
            <div className="flex justify-between items-end px-2">
                <div className="flex items-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight mr-3">
                        {selectedStock.name}
                    </h2>
                    <button
                        onClick={onToggleWatchlist}
                        className={`p-1.5 rounded-lg border transition ${
                            isWatchlisted
                                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                        }`}
                        title={isWatchlisted ? '取消自选' : '加入自选'}
                    >
                        <Star size={18} className={isWatchlisted ? 'fill-current' : ''} />
                    </button>
                    <span className="text-slate-400 font-mono text-sm ml-4">
                        {selectedStock.code} · 前复权日线
                    </span>
                </div>
            </div>

            <div className="w-full h-[500px] bg-[#0f1423] rounded-2xl border border-slate-800 relative shadow-sm shrink-0">
                <div ref={chartRef} className="w-full h-full"></div>
            </div>
        </>
    );
};

export default StockChart;
