/**
 * Custom Hook for localStorage persistence
 * Automatically syncs React state with localStorage
 */

import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'quantstar_';

export const useLocalStorage = (key, initialValue) => {
    const storageKey = STORAGE_PREFIX + key;

    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${storageKey}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${storageKey}":`, error);
        }
    }, [storageKey, storedValue]);

    return [storedValue, setValue];
};

/**
 * Direct localStorage read/write helpers for non-hook contexts
 */
export const storageGet = (key, fallback = null) => {
    try {
        const item = window.localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

export const storageSet = (key, value) => {
    try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
        console.warn('localStorage write failed:', error);
    }
};
