import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNav } from './mobile-nav';

// Pages that should NOT show bottom nav (auth pages, admin, etc.)
const NO_NAV_PAGES = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-signup-otp',
    '/admin'
];

export const AppLayout = () => {
    const location = useLocation();

    // Check if current page should hide nav
    const hideNav = NO_NAV_PAGES.some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Main content */}
            <main className={hideNav ? '' : 'pb-20 md:pb-0'}>
                <Outlet />
            </main>

            {/* Bottom nav - only on user pages */}
            {!hideNav && <MobileBottomNav />}
        </div>
    );
};
