/**
 * Custom Hook for Stock Data Management
 * Handles fetching and caching of stock market data
 */

import { useState, useEffect } from 'react';
import { fetchTencentData, fetchBatchPrices } from '../api/stockApi';

export const useStockData = (selectedStock) => {
    const [marketData, setMarketData] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dataError, setDataError] = useState(null);
    const [portfolioPrices, setPortfolioPrices] = useState({});

    // Fetch historical data when stock changes
    useEffect(() => {
        let isMounted = true;
        setIsLoadingData(true);
        setDataError(null);

        fetchTencentData(selectedStock.code, 300)
            .then(data => {
                if (isMounted) {
                    setMarketData(data);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setDataError(err.message);
                    setMarketData([]);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingData(false);
            });

        return () => { isMounted = false; };
    }, [selectedStock]);

    // Keep current selected stock price updated
    useEffect(() => {
        if (marketData.length > 0) {
            const latestPrice = marketData[marketData.length - 1].close;
            setPortfolioPrices(prev => ({ ...prev, [selectedStock.code]: latestPrice }));
        }
    }, [marketData, selectedStock.code]);

    // Fetch batch prices for portfolio
    const updatePortfolioPrices = async (positions) => {
        const codes = Object.keys(positions);
        if (codes.length > 0) {
            const prices = await fetchBatchPrices(codes);
            setPortfolioPrices(prev => ({ ...prev, ...prices }));
        }
    };

    return {
        marketData,
        isLoadingData,
        dataError,
        portfolioPrices,
        updatePortfolioPrices
    };
};
