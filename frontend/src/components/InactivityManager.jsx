import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMessage } from '../context/MessageContext';

const InactivityManager = ({ children }) => {
    const { user, logout } = useAuth();
    const { showMessage } = useMessage();
    const location = useLocation();
    const navigate = useNavigate();

    // Timeouts in milliseconds
    const GLOBAL_INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const ORDER_SUMMARY_TIMEOUT = 5 * 60 * 1000; // 5 minutes for payment page
    const WARNING_BEFORE = 60 * 1000; // Warning 1 minute before expiry

    const timerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const [isWarningActive, setIsWarningActive] = useState(false);

    const handleLogout = useCallback(() => {
        if (user) {
            logout();
            showMessage('You have been logged out due to inactivity for safety.', { type: 'info' });
            navigate('/login');
        }
    }, [user, logout, showMessage, navigate]);

    const handleOrderSummaryTimeout = useCallback(() => {
        if (location.pathname === '/order-summary') {
            showMessage('Session expired. Your seat hold has been released.', { type: 'error' });
            navigate('/');
        }
    }, [location.pathname, showMessage, navigate]);

    const resetTimer = useCallback(() => {
        // Clear existing timers
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

        setIsWarningActive(false);

        if (!user) return;

        const isOrderSummary = location.pathname === '/order-summary';
        const timeoutDuration = isOrderSummary ? ORDER_SUMMARY_TIMEOUT : GLOBAL_INACTIVITY_TIMEOUT;
        const warningTime = timeoutDuration - WARNING_BEFORE;

        // Set warning timer
        warningTimerRef.current = setTimeout(() => {
            setIsWarningActive(true);
            const minutesLeft = Math.floor(WARNING_BEFORE / 60000);
            showMessage(`Inactivity Warning: You will be ${isOrderSummary ? 'redirected' : 'logged out'} in ${minutesLeft} minute for security.`, { type: 'warning' });
        }, warningTime);

        // Set final timeout timer
        timerRef.current = setTimeout(() => {
            if (isOrderSummary) {
                handleOrderSummaryTimeout();
            } else {
                handleLogout();
            }
        }, timeoutDuration);

    }, [user, location.pathname, handleLogout, handleOrderSummaryTimeout, showMessage]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const handler = () => {
            if (!isWarningActive) {
                resetTimer();
            }
        };

        events.forEach(event => window.addEventListener(event, handler));
        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handler));
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, [resetTimer, isWarningActive]);

    return <>{children}</>;
};

export default InactivityManager;
