/**
 * Custom Hook for Stock Search Functionality
 * Handles search state and debounced API calls with fallback
 */

import { useState, useEffect } from 'react';
import { searchStocksAPI } from '../api/stockApi';

export const useSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                setSearchError(null);

                try {
                    const results = await searchStocksAPI(searchQuery);

                    if (results.length > 0) {
                        setSearchResults(results);
                        setShowDropdown(true);
                    } else {
                        // No results found - check if it's a valid stock code
                        const code = searchQuery.trim();
                        if (/^\d{6}$/.test(code)) {
                            // It's a 6-digit code, allow direct selection
                            setSearchResults([{
                                code: code,
                                name: `股票 ${code}`,
                                pinyin: code,
                                isDirectCode: true
                            }]);
                            setShowDropdown(true);
                        } else {
                            setSearchResults([]);
                            setSearchError('未找到匹配结果，请检查输入或尝试股票代码');
                        }
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                    setSearchError('搜索失败，请检查网络连接');

                    // Fallback: allow direct code entry
                    const code = searchQuery.trim();
                    if (/^\d{6}$/.test(code)) {
                        setSearchResults([{
                            code: code,
                            name: `股票 ${code}`,
                            pinyin: code,
                            isDirectCode: true
                        }]);
                        setShowDropdown(true);
                        setSearchError(null);
                    }
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
                setSearchError(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectSearchedStock = (stock, onSelect) => {
        onSelect({ code: stock.code, name: stock.name });
        setShowDropdown(false);
        setSearchQuery('');
        setSearchError(null);
    };

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        showDropdown,
        setShowDropdown,
        searchError,
        handleSelectSearchedStock
    };
};
