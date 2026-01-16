import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNav } from './mobile-nav';
import Navbar from '../Navbar';

// Pages that should NOT show bottom nav (auth pages, etc.)
const NO_NAV_PAGES = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-signup-otp'
];

export const AppLayout = () => {
    const location = useLocation();

    // Check if current page should hide nav
    const hideNav = NO_NAV_PAGES.some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Navbar - Hidden on Mobile */}
            {!hideNav && (
                <div className="hidden md:block">
                    <Navbar />
                </div>
            )}

            {/* Main content */}
            <main className={hideNav ? '' : 'pb-20 md:pb-0 md:pt-28'}>
                <Outlet />
            </main>

            {/* Bottom nav - only on user pages */}
            {!hideNav && <MobileBottomNav />}
        </div>
    );
};
