/**
 * Stock Chart Component
 * Displays K-line chart with volume, technical indicators, and timeframe selector
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { Star } from 'lucide-react';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../utils/indicators';

// Indicator configuration
const INDICATOR_OPTIONS = [
    { key: 'MA', label: 'MA均线' },
    { key: 'BOLL', label: '布林带' },
    { key: 'RSI', label: 'RSI' },
    { key: 'MACD', label: 'MACD' }
];

/**
 * Aggregate daily data into weekly or monthly bars
 */
const aggregateData = (data, period) => {
    if (period === 'day' || !data.length) return data;

    const groups = {};
    data.forEach(d => {
        let key;
        const date = new Date(d.date);
        if (period === 'week') {
            // Group by ISO week: find Monday of the week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            key = monday.toISOString().split('T')[0];
        } else {
            // Group by month
            key = d.date.substring(0, 7);
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(d);
    });

    return Object.entries(groups).map(([, bars]) => ({
        date: bars[bars.length - 1].date,
        open: bars[0].open,
        close: bars[bars.length - 1].close,
        high: Math.max(...bars.map(b => b.high)),
        low: Math.min(...bars.map(b => b.low)),
        volume: bars.reduce((s, b) => s + b.volume, 0)
    }));
};

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
    const [activeIndicators, setActiveIndicators] = useState(['MA']);
    const [timeframe, setTimeframe] = useState('day');

    const toggleIndicator = (key) => {
        setActiveIndicators(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Aggregate data based on selected timeframe
    const chartData = useMemo(() => aggregateData(marketData, timeframe), [marketData, timeframe]);

    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        if (!echartsInstance.current) {
            echartsInstance.current = echarts.init(chartRef.current);
        }

        const dates = chartData.map(d => d.date);
        const klineData = chartData.map(d => [d.open, d.close, d.low, d.high]);
        const volumes = chartData.map(d => d.volume);

        // Build series array
        const series = [];
        const legendData = ['K线'];
        const grids = [];
        const xAxes = [];
        const yAxes = [];

        // Determine grid layout based on active sub-indicators
        const hasRSI = activeIndicators.includes('RSI');
        const hasMACD = activeIndicators.includes('MACD');
        const subChartCount = 1 + (hasRSI ? 1 : 0) + (hasMACD ? 1 : 0); // 1 for volume

        // Calculate grid heights (percentage-based)
        const mainPct = subChartCount === 1 ? 55 : subChartCount === 2 ? 48 : 40;
        const volPct = subChartCount === 1 ? 18 : 14;
        const subPct = subChartCount <= 2 ? 16 : 13;

        let currentTop = 8; // percent

        // Grid 0: Main candlestick
        grids.push({
            left: '7%', right: '2%', top: `${currentTop}%`, height: `${mainPct}%`
        });
        currentTop += mainPct + 4;

        // Grid 1: Volume
        grids.push({
            left: '7%', right: '2%', top: `${currentTop}%`, height: `${volPct}%`
        });
        currentTop += volPct + 4;

        // Grid 2: RSI (optional)
        let rsiGridIdx = -1;
        if (hasRSI) {
            rsiGridIdx = grids.length;
            grids.push({
                left: '7%', right: '2%', top: `${currentTop}%`, height: `${subPct}%`
            });
            currentTop += subPct + 4;
        }

        // Grid 3: MACD (optional)
        let macdGridIdx = -1;
        if (hasMACD) {
            macdGridIdx = grids.length;
            grids.push({
                left: '7%', right: '2%', top: `${currentTop}%`, height: `${subPct}%`
            });
        }

        // X axes for each grid
        grids.forEach((_, i) => {
            xAxes.push({
                type: 'category',
                data: dates,
                gridIndex: i,
                axisLabel: { show: i === grids.length - 1, color: '#64748b', fontSize: 10 },
                axisLine: { lineStyle: { color: '#1e293b' } },
                axisTick: { show: false },
                splitLine: { show: false }
            });
        });

        // Y axes
        // Main
        yAxes.push({
            scale: true, gridIndex: 0,
            axisLabel: { color: '#64748b', fontSize: 10 },
            splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
        });
        // Volume
        yAxes.push({
            scale: true, gridIndex: 1,
            axisLabel: {
                color: '#64748b', fontSize: 10,
                formatter: v => v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v >= 1e4 ? (v / 1e4).toFixed(0) + '万' : v
            },
            splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
        });
        if (hasRSI) {
            yAxes.push({
                scale: true, gridIndex: rsiGridIdx,
                min: 0, max: 100,
                axisLabel: { color: '#64748b', fontSize: 10 },
                splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
            });
        }
        if (hasMACD) {
            yAxes.push({
                scale: true, gridIndex: macdGridIdx,
                axisLabel: { color: '#64748b', fontSize: 10 },
                splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
            });
        }

        // Trade markers
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
                        borderColor: '#fff', borderWidth: 1
                    }
                });
            });

        // Candlestick series
        series.push({
            name: 'K线', type: 'candlestick', data: klineData,
            xAxisIndex: 0, yAxisIndex: 0,
            itemStyle: {
                color: '#ef4444', color0: '#10b981',
                borderColor: '#ef4444', borderColor0: '#10b981'
            },
            markPoint: {
                data: markPointData,
                label: { formatter: '{c}', color: '#fff', fontSize: 10 },
                symbolSize: 35
            }
        });

        // Volume series
        const volumeColors = chartData.map(d => d.close >= d.open ? '#ef4444' : '#10b981');
        series.push({
            name: '成交量', type: 'bar', data: volumes,
            xAxisIndex: 1, yAxisIndex: 1,
            itemStyle: {
                color: (params) => volumeColors[params.dataIndex] + '80'
            },
            barMaxWidth: 8
        });
        legendData.push('成交量');

        // MA indicators on main chart
        if (activeIndicators.includes('MA')) {
            const ma5 = calculateSMA(chartData, 5);
            const ma10 = calculateSMA(chartData, 10);
            const ma20 = calculateSMA(chartData, 20);

            series.push({
                name: 'MA5', type: 'line', data: ma5, smooth: true,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1.2, color: '#eab308' }, symbol: 'none'
            });
            series.push({
                name: 'MA10', type: 'line', data: ma10, smooth: true,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1.2, color: '#3b82f6' }, symbol: 'none'
            });
            series.push({
                name: 'MA20', type: 'line', data: ma20, smooth: true,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1.2, color: '#a855f7' }, symbol: 'none'
            });
            legendData.push('MA5', 'MA10', 'MA20');
        }

        // Bollinger Bands on main chart
        if (activeIndicators.includes('BOLL')) {
            const boll = calculateBollingerBands(chartData);
            series.push({
                name: 'BOLL上轨', type: 'line', data: boll.upper,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1, color: '#f97316', type: 'dashed' }, symbol: 'none'
            });
            series.push({
                name: 'BOLL中轨', type: 'line', data: boll.middle,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1, color: '#f97316' }, symbol: 'none'
            });
            series.push({
                name: 'BOLL下轨', type: 'line', data: boll.lower,
                xAxisIndex: 0, yAxisIndex: 0,
                lineStyle: { width: 1, color: '#f97316', type: 'dashed' }, symbol: 'none'
            });
            legendData.push('BOLL上轨', 'BOLL中轨', 'BOLL下轨');
        }

        // RSI sub-chart
        if (hasRSI) {
            const rsi = calculateRSI(chartData, 14);
            const rsiYIdx = yAxes.findIndex((_, i) => i >= 2 && yAxes[i].gridIndex === rsiGridIdx);
            series.push({
                name: 'RSI(14)', type: 'line', data: rsi,
                xAxisIndex: rsiGridIdx, yAxisIndex: rsiYIdx,
                lineStyle: { width: 1.5, color: '#06b6d4' }, symbol: 'none',
                markLine: {
                    silent: true,
                    data: [
                        { yAxis: 70, lineStyle: { color: '#ef4444', type: 'dashed', width: 1 } },
                        { yAxis: 30, lineStyle: { color: '#10b981', type: 'dashed', width: 1 } }
                    ],
                    label: { show: true, fontSize: 9, color: '#64748b' }
                }
            });
            legendData.push('RSI(14)');
        }

        // MACD sub-chart
        if (hasMACD) {
            const macd = calculateMACD(chartData);
            const macdYIdx = yAxes.findIndex((_, i) => i >= 2 && yAxes[i].gridIndex === macdGridIdx);
            series.push({
                name: 'DIF', type: 'line', data: macd.dif,
                xAxisIndex: macdGridIdx, yAxisIndex: macdYIdx,
                lineStyle: { width: 1.2, color: '#3b82f6' }, symbol: 'none'
            });
            series.push({
                name: 'DEA', type: 'line', data: macd.dea,
                xAxisIndex: macdGridIdx, yAxisIndex: macdYIdx,
                lineStyle: { width: 1.2, color: '#f59e0b' }, symbol: 'none'
            });
            series.push({
                name: 'MACD柱', type: 'bar', data: macd.histogram,
                xAxisIndex: macdGridIdx, yAxisIndex: macdYIdx,
                barMaxWidth: 4,
                itemStyle: {
                    color: (params) => (macd.histogram[params.dataIndex] || 0) >= 0 ? '#ef4444' : '#10b981'
                }
            });
            legendData.push('DIF', 'DEA', 'MACD柱');
        }

        // DataZoom spans all grids
        const dataZoomXIndices = grids.map((_, i) => i);

        const option = {
            backgroundColor: 'transparent',
            animation: false,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { color: '#475569' } },
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                textStyle: { color: '#e2e8f0', fontSize: 11 }
            },
            legend: {
                data: legendData,
                textStyle: { color: '#94a3b8', fontSize: 10 },
                top: 4,
                itemWidth: 12,
                itemHeight: 8,
                itemGap: 8
            },
            grid: grids,
            xAxis: xAxes,
            yAxis: yAxes,
            dataZoom: [
                { type: 'inside', xAxisIndex: dataZoomXIndices, start: 60, end: 100 },
                {
                    show: true, type: 'slider',
                    xAxisIndex: dataZoomXIndices,
                    bottom: 4, height: 18,
                    borderColor: 'transparent',
                    fillerColor: 'rgba(59, 130, 246, 0.2)',
                    textStyle: { color: 'transparent' }
                }
            ],
            series
        };

        echartsInstance.current.setOption(option, true);

        const handleResize = () => echartsInstance.current?.resize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [chartData, backtestTrades, paperAccount.history, selectedStock, activeIndicators]);

    // Cleanup ECharts instance on unmount
    useEffect(() => {
        return () => {
            if (echartsInstance.current) {
                echartsInstance.current.dispose();
                echartsInstance.current = null;
            }
        };
    }, []);

    const timeframeLabel = { day: '日线', week: '周线', month: '月线' };

    return (
        <>
            <div className="flex justify-between items-end px-2 flex-wrap gap-2">
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
                        {selectedStock.code} · 前复权{timeframeLabel[timeframe]}
                    </span>
                </div>

                {/* Toolbar: Timeframe + Indicators */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Timeframe selector */}
                    <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
                        {['day', 'week', 'month'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-2.5 py-1 text-xs rounded-md transition ${
                                    timeframe === tf
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {timeframeLabel[tf]}
                            </button>
                        ))}
                    </div>

                    {/* Indicator toggles */}
                    <div className="flex gap-1">
                        {INDICATOR_OPTIONS.map(ind => (
                            <button
                                key={ind.key}
                                onClick={() => toggleIndicator(ind.key)}
                                className={`px-2 py-1 text-[11px] rounded-md border transition ${
                                    activeIndicators.includes(ind.key)
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {ind.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-[600px] bg-[#0f1423] rounded-2xl border border-slate-800 relative shadow-sm shrink-0">
                <div ref={chartRef} className="w-full h-full"></div>
            </div>
        </>
    );
};

export default StockChart;
