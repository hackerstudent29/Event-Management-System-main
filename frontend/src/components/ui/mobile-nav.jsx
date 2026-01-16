import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Ticket, MapPin, User, LogOut, Edit, Key, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showAccountSheet, setShowAccountSheet] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Bottom Navigation - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
                <div className="grid grid-cols-3 h-16">
                    <button
                        onClick={() => navigate('/')}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/') ? 'text-slate-900' : 'text-slate-400'
                            }`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Events</span>
                    </button>
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/my-bookings') ? 'text-slate-900' : 'text-slate-400'
                            }`}
                    >
                        <Ticket className="w-5 h-5" />
                        <span className="text-[10px] font-medium">My Bookings</span>
                    </button>
                    <button
                        onClick={() => setShowAccountSheet(true)}
                        className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Account</span>
                    </button>
                </div>
            </nav>

            {/* Account Bottom Sheet */}
            {showAccountSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50 md:hidden"
                        onClick={() => setShowAccountSheet(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden animate-slide-up">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-700" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{user?.name || 'Guest'}</p>
                                    <p className="text-sm text-slate-500">{user?.email || 'Not logged in'}</p>
                                </div>
                            </div>
                            {user ? (
                                <>
                                    {/* Admin Options */}
                                    {user.role === 'ADMIN' && (
                                        <button
                                            onClick={() => {
                                                setShowAccountSheet(false);
                                                navigate('/admin');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-blue-600"
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="font-medium">Admin Dashboard</span>
                                        </button>
                                    )}
                                    {user.email === 'ramzendrum@gmail.com' && (
                                        <button
                                            onClick={() => {
                                                setShowAccountSheet(false);
                                                navigate('/scanner');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-purple-600"
                                        >
                                            <Ticket className="w-5 h-5" />
                                            <span className="font-medium">Scan Tickets</span>
                                        </button>
                                    )}

                                    {/* Regular User Options */}
                                    <button
                                        onClick={() => {
                                            setShowAccountSheet(false);
                                            navigate('/profile');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <Edit className="w-5 h-5 text-slate-600" />
                                        <span className="font-medium text-slate-900">Edit Profile</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAccountSheet(false);
                                            navigate('/change-password');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <Key className="w-5 h-5 text-slate-600" />
                                        <span className="font-medium text-slate-900">Change Password</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowAccountSheet(false);
                                        navigate('/login');
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-medium text-slate-900">Sign In</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowAccountSheet(false)}
                                className="w-full p-3 text-sm text-slate-500 hover:text-slate-900"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export const MobileTopBar = ({ title, showBack = false, onBack }) => {
    const navigate = useNavigate();
    const [showAccountSheet, setShowAccountSheet] = useState(false);
    const { user } = useAuth();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                {showBack ? (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                ) : (
                    <h1 className="text-lg font-bold text-slate-900">{title}</h1>
                )}
                <button
                    onClick={() => setShowAccountSheet(true)}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden"
                    aria-label="Account"
                >
                    <User className="w-5 h-5 text-slate-700" />
                </button>
            </div>
        </header>
    );
};
