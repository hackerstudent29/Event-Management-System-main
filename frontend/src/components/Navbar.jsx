import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExpandableTabs } from './ui/expandable-tabs';
import { Home, LayoutDashboard, Calendar, LogIn, UserPlus, LogOut, User as UserIcon, Ticket, Scan } from 'lucide-react';
import { ZendrumLogo } from './ui/invoice';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [logoExpanded, setLogoExpanded] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define tabs based on user state
    let tabs = [
        { title: "Events", icon: Home, route: "/" },
    ];

    if (user) {
        if (user.role === 'ADMIN') {
            tabs.push({ title: "Admin Dashboard", icon: LayoutDashboard, route: "/admin" });
        }

        // Specific Scanner access for Authorized User
        if (user.email === 'ramzendrum@gmail.com') {
            tabs.push({ title: "QR Scanner", icon: Scan, route: "/scanner" });
        }
        tabs.push({ title: "My Tickets", icon: Ticket, route: "/my-bookings" });
        tabs.push({ title: "Account Profile", icon: UserIcon, route: "/profile" });
        tabs.push({ type: "separator" });
        tabs.push({ title: "Logout", icon: LogOut, action: handleLogout });
    } else {
        tabs.push({ type: "separator" });
        tabs.push({ title: "Login", icon: LogIn, route: "/login" });
        tabs.push({ title: "Register", icon: UserPlus, route: "/register" });
    }

    const handleTabChange = (index) => {
        if (index === null) return;

        const tab = tabs[index];
        if (!tab) return; // For separator

        if (tab.action) {
            tab.action();
        } else if (tab.route) {
            navigate(tab.route);
        }
    };

    const outsideClickRef = React.useRef(null);
    useOnClickOutside(outsideClickRef, () => {
        setLogoExpanded(false);
    });

    const location = useLocation();

    return (
        <nav
            ref={outsideClickRef}
            className={cn(
                "fixed left-1/2 transform -translate-x-1/2 z-[100] flex items-center bg-background/80 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl p-1 h-14 transition-all duration-500 top-4"
            )}
        >
            {/* Unified Dock Container */}
            <div className="flex items-center h-full">
                {/* Logo Section - Expandable ONLY on Click */}
                <motion.div
                    onClick={() => {
                        if (!logoExpanded) {
                            setLogoExpanded(true);
                        } else {
                            navigate('/zendrum-booking');
                        }
                    }}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-xl transition-all duration-300 group"
                >
                    <ZendrumLogo size={24} className="text-primary group-hover:scale-110 transition-transform" />
                    <AnimatePresence>
                        {logoExpanded && (
                            <motion.span
                                key="full-logo"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                className="text-lg tracking-tight whitespace-nowrap overflow-hidden"
                                style={{ fontFamily: 'Righteous, sans-serif' }}
                            >
                                ZENDRUMBOOKING
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Vertical Separator */}
                <div className="mx-1 h-6 w-[1.5px] bg-border/60" />

                {/* Navigation Tabs */}
                <ExpandableTabs
                    tabs={tabs}
                    onChange={handleTabChange}
                    activeColor="text-primary"
                    className="border-none bg-transparent shadow-none p-0"
                />
            </div>
        </nav>
    );
};

export default Navbar;
