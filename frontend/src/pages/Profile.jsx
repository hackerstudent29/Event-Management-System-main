import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, ShieldCheck, Calendar, LogOut,
    Trash2, Edit3, Lock, HelpCircle, MapPin, Ticket,
    CreditCard, Bell, ChevronRight, Download, Send,
    CheckCircle2, XCircle, Clock, ExternalLink, Plus, FileText, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { LocationMap } from '@/components/ui/expand-map';
import AvatarUpload from '@/components/ui/avatar-upload';
import { Map, Marker } from '@/components/ui/map';
import { Search as MapSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const SectionTitle = ({ children, icon: Icon }) => (
    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
    </h3>
);

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
        <div className={cn("p-3 rounded-xl", colorClass)}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
    </div>
);


const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showMessage } = useMessage();

    // States
    const [fullUser, setFullUser] = useState(null);
    const [stats, setStats] = useState({ totalBookings: 0, totalSpent: 0, cancelledBookings: 0 });
    const [bookings, setBookings] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings'); // bookings, payments, locations, settings
    const [bookingFilter, setBookingFilter] = useState('all'); // all, confirmed, cancelled

    // Feature States
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);
    const [newLocationLabel, setNewLocationLabel] = useState('Home');
    const [newLocationAddress, setNewLocationAddress] = useState('');
    const [newLocationLat, setNewLocationLat] = useState(20.5937);
    const [newLocationLng, setNewLocationLng] = useState(78.9629);
    const [mapZoom, setMapZoom] = useState(13);

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editImage, setEditImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarChange = async (file) => {
        if (!file) {
            // Handle removal or clear
            setEditImage('');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `user-avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('event-images') // Using same bucket for now
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);

            setEditImage(data.publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showMessage('Failed to upload avatar', { type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };


    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [userRes, statsRes, bookingsRes, locationsRes] = await Promise.all([
                api.get(`/users/profile/${user.id}`),
                api.get(`/users/stats/${user.id}`),
                api.get('/bookings/my'),
                api.get(`/users/locations/${user.id}`)
            ]);
            setFullUser(userRes.data);
            setStats(statsRes.data);
            setBookings(bookingsRes.data);
            setLocations(locationsRes.data);

            // Pre-fill edit form
            setEditName(userRes.data.name || '');
            setEditPhone(userRes.data.phoneNumber || '');
            setEditImage(userRes.data.profileImage || '');

        } catch (err) {
            console.error("Failed to load profile data", err);
            showMessage("Failed to load profile data", { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user, showMessage]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, showMessage, fetchData]);

    const filteredBookings = useMemo(() => {
        let filtered = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status.toLowerCase() === bookingFilter.toLowerCase());
        // Sort by booking time - newest first
        return filtered.sort((a, b) => new Date(b.bookingTime || 0) - new Date(a.bookingTime || 0));
    }, [bookings, bookingFilter]);

    const handleUpdateProfile = async () => {
        try {
            await api.put(`/users/profile/${user.id}`, {
                name: editName,
                phoneNumber: editPhone,
                profileImage: editImage
            });
            showMessage("Profile updated successfully", { type: 'success' });
            setShowEditProfileModal(false);
            fetchData();
        } catch (err) {
            showMessage("Failed to update profile", { type: 'error' });
        }
    };

    const handleRequestOtp = async () => {
        try {
            await api.post(`/users/profile/${user.id}/password/otp`);
            setOtpSent(true);
            showMessage("OTP sent to your email", { type: 'success' });
        } catch (err) {
            showMessage("Failed to send OTP", { type: 'error' });
        }
    };

    const handleChangePassword = async () => {
        try {
            await api.put(`/users/profile/${user.id}/password`, {
                otp,
                newPassword
            });
            showMessage("Password changed successfully", { type: 'success' });
            setShowChangePasswordModal(false);
            setOtpSent(false);
            setOtp('');
            setNewPassword('');
        } catch (err) {
            showMessage("Invalid OTP or failed to update", { type: 'error' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closePasswordModal = () => {
        setShowChangePasswordModal(false);
        setOtpSent(false);
        setOtp('');
        setNewPassword('');
    }

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action is permanent.")) return;
        try {
            await api.delete(`/users/${user.id}`);
            showMessage("Account deleted successfully", { type: 'success' });
            logout();
            navigate('/register');
        } catch (err) {
            showMessage("Failed to delete account", { type: 'error' });
        }
    };

    const handleAddLocation = async () => {
        if (!newLocationAddress.trim()) return showMessage("Address is required", { type: 'error' });
        try {
            await api.post(`/users/locations/${user.id}`, {
                label: newLocationLabel,
                address: newLocationAddress,
                latitude: newLocationLat,
                longitude: newLocationLng
            });
            showMessage("Location saved", { type: 'success' });
            setShowAddLocationModal(false);
            setNewLocationAddress('');
            setNewLocationLat(20.5937);
            setNewLocationLng(78.9629);
            fetchData();
        } catch (err) {
            showMessage("Failed to save location", { type: 'error' });
        }
    };

    const handleLocationSelect = (coords) => {
        setNewLocationLat(coords.latitude);
        setNewLocationLng(coords.longitude);
    };

    const handleDeleteLocation = async (id) => {
        try {
            await api.delete(`/users/locations/${id}`);
            showMessage("Location deleted", { type: 'success' });
            fetchData();
        } catch (err) {
            showMessage("Failed to delete location", { type: 'error' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Modals */}
                <AnimatePresence>
                    {showEditProfileModal && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
                                <div className="space-y-4">
                                    {/* Image Upload */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-auto">
                                            <AvatarUpload
                                                value={editImage}
                                                onFileChange={handleAvatarChange}
                                                className="w-full"
                                            />
                                            {isUploading && <p className="text-xs text-center text-slate-500 mt-2">Uploading...</p>}
                                        </div>
                                    </div>
                                    <div><label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">Full Name</label><input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" /></div>
                                    <div><label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">Phone Number</label><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" /></div>
                                    <div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={() => setShowEditProfileModal(false)}>Cancel</Button><Button className="flex-1" onClick={handleUpdateProfile}>Save Changes</Button></div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {showChangePasswordModal && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closePasswordModal} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password via OTP</h3>
                                {!otpSent ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500">To secure your account, we need to verify your identity. Click below to receive a One-Time Password (OTP) on your registered email.</p>
                                        <div className="flex gap-3 pt-2">
                                            <Button variant="outline" className="flex-1" onClick={closePasswordModal}>Cancel</Button>
                                            <Button className="flex-1" onClick={handleRequestOtp}>Send OTP</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">Enter OTP</label><input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono tracking-widest text-center" placeholder="000000" /></div>
                                        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" /></div>
                                        <div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={closePasswordModal}>Cancel</Button><Button className="flex-1" onClick={handleChangePassword}>Verify & Update</Button></div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Add Location Modal (Existing) */}
                <AnimatePresence>
                    {showAddLocationModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAddLocationModal(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-200"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Location</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">Label</label>
                                        <Select value={newLocationLabel} onValueChange={setNewLocationLabel}>
                                            <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm h-10 focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select Label" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Home">Home</SelectItem>
                                                <SelectItem value="Work">Work</SelectItem>
                                                <SelectItem value="Hostel">Hostel</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">Address</label>
                                        <div className="relative mb-2">
                                            <MapSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white outline-none"
                                                placeholder="Search places..."
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const q = e.target.value;
                                                        if (!q) return;
                                                        try {
                                                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
                                                            const data = await res.json();
                                                            if (data && data.length > 0) {
                                                                const { lat, lon, display_name } = data[0];
                                                                setNewLocationLat(Number(lat));
                                                                setNewLocationLng(Number(lon));
                                                                setNewLocationAddress(display_name);
                                                                setMapZoom(15);
                                                            }
                                                        } catch (err) {
                                                            console.error("Search failed", err);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Enter full address..."
                                            value={newLocationAddress}
                                            onChange={(e) => setNewLocationAddress(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                                        />
                                    </div>

                                    {/* Interactive Map Picker */}
                                    <div className="h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                                        <Map
                                            initialViewState={{
                                                latitude: newLocationLat,
                                                longitude: newLocationLng,
                                                zoom: mapZoom
                                            }}
                                            onClick={handleLocationSelect}
                                        >
                                            <Marker
                                                latitude={newLocationLat}
                                                longitude={newLocationLng}
                                                draggable
                                                onDragEnd={handleLocationSelect}
                                            />
                                        </Map>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setShowAddLocationModal(false)}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleAddLocation}>Save Location</Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* LH Sidebar: Profile Overview */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 overflow-hidden">
                                {fullUser?.profileImage ? (
                                    <img
                                        src={fullUser.profileImage}
                                        alt={fullUser.name}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <User className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{fullUser?.name}</h1>
                                <p className="text-sm text-slate-500 font-medium">Member since {new Date(fullUser?.createdAt).getFullYear()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 truncate">{fullUser?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">{fullUser?.phoneNumber || 'No phone added'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className={cn("w-4 h-4", fullUser?.emailVerified ? "text-emerald-500" : "text-amber-500")} />
                                <span className={cn("font-medium", fullUser?.emailVerified ? "text-emerald-600" : "text-amber-600 uppercase text-[10px]")}>
                                    {fullUser?.emailVerified ? 'Verified Account' : 'Action Required: Verify Email'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-2">
                            <Button variant="outline" className="w-full justify-start gap-2 text-slate-700" onClick={() => setShowEditProfileModal(true)}>
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 text-slate-700" onClick={() => setShowChangePasswordModal(true)}>
                                <Lock className="w-4 h-4" /> Change Password
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 mt-2" onClick={handleLogout}>
                                <LogOut className="w-4 h-4" /> Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Stats Badges */}
                    <div className="grid grid-cols-1 gap-4">
                        <StatCard label="Total Bookings" value={stats.totalBookings} icon={Ticket} colorClass="bg-blue-50 text-blue-600" />
                        <StatCard label="Total Spent" value={`₹${Math.round(stats.totalSpent).toLocaleString()}`} icon={CreditCard} colorClass="bg-emerald-50 text-emerald-600" />
                        <StatCard label="Cancelled" value={stats.cancelledBookings} icon={XCircle} colorClass="bg-red-50 text-red-600" />
                    </div>


                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
                        {[
                            { id: 'bookings', label: 'My Bookings', icon: Ticket },
                            { id: 'payments', label: 'Payments', icon: CreditCard },
                            { id: 'locations', label: 'Locations', icon: MapPin },
                            { id: 'settings', label: 'Settings', icon: Bell },
                            { id: 'support', label: 'Support & Help', icon: HelpCircle }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-lg transform scale-[1.02]"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="flex-1 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'bookings' && (
                                <motion.div
                                    key="bookings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex gap-2">
                                            {['all', 'confirmed', 'cancelled'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setBookingFilter(f)}
                                                    className={cn(
                                                        "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                                                        bookingFilter === f ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredBookings.length === 0 ? (
                                            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 text-center">
                                                <Ticket className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">No bookings found in this category.</p>
                                            </div>
                                        ) : (
                                            filteredBookings.map(booking => (
                                                <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    {booking.eventCategory?.event?.eventDate ? new Date(booking.eventCategory.event.eventDate).toLocaleString('default', { month: 'short' }) : '---'}
                                                                </span>
                                                                <span className="text-lg font-bold text-slate-900 leading-none">
                                                                    {booking.eventCategory?.event?.eventDate ? new Date(booking.eventCategory.event.eventDate).getDate() : '--'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{booking.eventCategory?.event?.name}</h4>
                                                                <p className="text-xs text-slate-500 font-medium">
                                                                    {booking.seatsBooked} × {booking.eventCategory?.categoryName} • ID: {booking.id.toString().slice(0, 8).toUpperCase()}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                                                                        booking.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                                    )}>
                                                                        {booking.status}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-900">
                                                                        ₹{((booking.seatsBooked * booking.eventCategory?.price) + 35.40).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Actions & Map */}
                                                        <div className="flex items-center gap-4 mt-auto md:mt-0">
                                                            {(booking.eventCategory?.event?.locationName || booking.eventCategory?.event?.latitude) && (
                                                                <LocationMap
                                                                    location={booking.eventCategory?.event?.locationName || booking.eventCategory?.event?.eventType}
                                                                    latitude={booking.eventCategory?.event?.latitude}
                                                                    longitude={booking.eventCategory?.event?.longitude}
                                                                    address={booking.eventCategory?.event?.locationAddress}
                                                                />
                                                            )}
                                                            {booking.status === 'CONFIRMED' && (
                                                                <div className="flex items-center gap-2">
                                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100" title="View Invoice" onClick={() => navigate(`/ticket/${booking.id}?view=invoice`)}>
                                                                        <FileText className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100" title="View Ticket" onClick={() => navigate(`/ticket/${booking.id}`)}>
                                                                        <Ticket className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'payments' && (
                                <motion.div
                                    key="payments"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <SectionTitle icon={CreditCard}>Invoices & Transactions</SectionTitle>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {bookings.map(booking => (
                                                    <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                            {booking.bookingTime ? new Date(booking.bookingTime).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-mono text-slate-400">
                                                            #{booking.id.toString().slice(0, 8).toUpperCase()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                            ₹{((booking.seatsBooked * booking.eventCategory?.price) + 35.40).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                {booking.status === 'CONFIRMED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                                                <span className={cn("text-[10px] font-bold uppercase", booking.status === 'CONFIRMED' ? "text-emerald-600" : "text-red-600")}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary gap-1" onClick={() => navigate(`/ticket/${booking.id}?view=invoice`)}>
                                                                <Download className="w-3.5 h-3.5" /> PDF
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'locations' && (
                                <motion.div
                                    key="locations"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <SectionTitle icon={MapPin}>Saved Locations</SectionTitle>
                                                <p className="text-xs text-slate-500 font-medium -mt-3">Save locations for faster route calculation.</p>
                                            </div>
                                            <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg" onClick={() => setShowAddLocationModal(true)}>
                                                <Plus className="w-4 h-4" /> Add Location
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {locations.length === 0 ? (
                                                <div className="md:col-span-2 py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-slate-500 text-sm font-medium">No saved locations yet.</p>
                                                </div>
                                            ) : (
                                                locations.map(loc => (
                                                    <div key={loc.id} className="relative group overflow-hidden bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                                <MapPin className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{loc.label}</h4>
                                                                <p className="text-xs text-slate-500 truncate leading-relaxed">{loc.address}</p>
                                                            </div>
                                                            <button
                                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                onClick={() => handleDeleteLocation(loc.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {/* Live Preview Map */}
                                                        <div className="mt-4 h-24 bg-slate-100 rounded-lg border border-slate-100 overflow-hidden relative group-hover:shadow-inner transition-all">
                                                            <Map
                                                                initialViewState={{
                                                                    latitude: loc.latitude || 20.5937,
                                                                    longitude: loc.longitude || 78.9629,
                                                                    zoom: 14
                                                                }}
                                                                interactive={false}
                                                                className="w-full h-full"
                                                            >
                                                                <Marker
                                                                    latitude={loc.latitude || 20.5937}
                                                                    longitude={loc.longitude || 78.9629}
                                                                />
                                                            </Map>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Communication Preferences */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <SectionTitle icon={Bell}>Communication Preferences</SectionTitle>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'conf', title: 'Booking Confirmations', desc: 'Get SMS & Email when you book an event' },
                                                { id: 'rem', title: 'Event Reminders', desc: 'Receive alerts 24h before your event starts' },
                                                { id: 'canc', title: 'Cancellation Updates', desc: 'Immediate alerts if an event is postponed or cancelled' },
                                                { id: 'promo', title: 'Promotional Emails', desc: 'New events, discounts and curated recommendations' }
                                            ].map(pref => (
                                                <div key={pref.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">{pref.title}</h4>
                                                        <p className="text-xs text-slate-500">{pref.desc}</p>
                                                    </div>
                                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary h-5 w-5" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Security & Danger Zone */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <SectionTitle icon={ShieldCheck}>Security & account control</SectionTitle>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">Sessions Control</h4>
                                                    <p className="text-xs text-slate-500">Log out from all other active browser sessions</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold text-slate-700 bg-white shadow-sm">Force Log Out All</Button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-100">
                                                <div>
                                                    <h4 className="text-sm font-bold text-red-900">Permanently Delete Account</h4>
                                                    <p className="text-xs text-red-600/70">Warning: All your bookings and data will be erased forever</p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-200" onClick={handleDeleteAccount}>
                                                    Delete Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'help-center' && (
                                <motion.div key="help-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
                                    <button onClick={() => setActiveTab('support')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors mb-4">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Support Menu
                                    </button>
                                    <SectionTitle icon={HelpCircle}>Help Center</SectionTitle>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2"><Ticket className="w-4 h-4 text-slate-400" /> Booking & Tickets</h4>
                                            <div className="space-y-4">
                                                <div><p className="font-semibold text-sm text-slate-800">Q: Where can I find my ticket after booking?</p><p className="text-sm text-slate-500 mt-1">A: Go to <strong>My Bookings → Open Ticket</strong>. You can also download or email your ticket.</p></div>
                                                <div><p className="font-semibold text-sm text-slate-800">Q: Can I book multiple tickets in one booking?</p><p className="text-sm text-slate-500 mt-1">A: Yes, you can book multiple seats in a single booking, subject to availability.</p></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /> Payments & Fees</h4>
                                            <div className="space-y-4">
                                                <div><p className="font-semibold text-sm text-slate-800">Q: Is GST applied on ticket price?</p><p className="text-sm text-slate-500 mt-1">A: No. GST is applied only on the convenience fee as per Indian tax rules.</p></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-slate-400" /> Cancellations & Refunds</h4>
                                            <div className="space-y-4">
                                                <div><p className="font-semibold text-sm text-slate-800">Q: What happens if an event is cancelled?</p><p className="text-sm text-slate-500 mt-1">A: You will receive a cancellation email and an automatic refund to your original payment method.</p></div>
                                                <div><p className="font-semibold text-sm text-slate-800">Q: How long does a refund take?</p><p className="text-sm text-slate-500 mt-1">A: Refunds are usually processed within <strong>5–7 business days</strong>.</p></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'support' && (
                                <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                        <SectionTitle icon={HelpCircle}>Support & Help</SectionTitle>
                                        <p className="text-slate-600 mb-6">Choose from the options below to get help with your account, bookings, or technical issues.</p>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'help-center', label: 'Help Center', desc: 'Browse FAQs and common questions', icon: HelpCircle },
                                                { id: 'contact', label: 'Contact Support', desc: 'Get in touch with our support team', icon: Mail },
                                                { id: 'terms', label: 'Terms & Privacy', desc: 'View our policies and terms', icon: ShieldCheck },
                                                { id: 'report', label: 'Report a Problem', desc: 'Report technical issues or bugs', icon: AlertCircle }
                                            ].map(option => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setActiveTab(option.id)}
                                                    className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                            <option.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">{option.label}</h3>
                                                            <p className="text-sm text-slate-500">{option.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'contact' && (
                                <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                    <button onClick={() => setActiveTab('support')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors mb-4">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Support Menu
                                    </button>
                                    <SectionTitle icon={HelpCircle}>Contact Support</SectionTitle>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">We’re here to help</h2>
                                    <p className="text-slate-600 mb-6">If you’re facing issues with bookings, payments, tickets, or account access, our support team is ready to assist you.</p>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Available support:</h4>
                                            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                                                <li>Booking & ticket issues</li>
                                                <li>Payment or refund queries</li>
                                                <li>Event cancellations</li>
                                                <li>Account & login problems</li>
                                                <li>Technical errors</li>
                                            </ul>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                            <div className="flex items-center gap-3 text-sm"><Mail className="w-5 h-5 text-primary" /><span className="font-medium text-slate-900">eventbooking.otp@gmail.com</span></div>
                                            <div className="flex items-center gap-3 text-sm"><Clock className="w-5 h-5 text-slate-400" /><span className="text-slate-600">9:00 AM – 7:00 PM (IST)</span></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'terms' && (
                                <motion.div key="terms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                    <button onClick={() => setActiveTab('support')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors mb-4">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Support Menu
                                    </button>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <SectionTitle icon={ShieldCheck}>Terms of Service</SectionTitle>
                                            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside mt-4">
                                                <li>Follow event rules set by organizers</li>
                                                <li>Provide accurate booking details</li>
                                                <li>Use tickets responsibly</li>
                                                <li>Not misuse or resell tickets</li>
                                            </ul>
                                            <p className="text-xs text-slate-400 mt-4 italic">Tickets are subject to availability and organizer policies.</p>
                                        </div>
                                        <div>
                                            <SectionTitle icon={Lock}>Privacy Policy</SectionTitle>
                                            <p className="text-sm text-slate-600 mt-4 mb-2">We respect your privacy. We collect name, email, phone number, and booking details.</p>
                                            <p className="text-sm text-slate-600">We do <strong>NOT</strong> sell or share your personal data with third parties, except where required for payment processing or legal compliance.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'report' && (
                                <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-slate-900 rounded-2xl p-8 shadow-lg text-white">
                                    <button onClick={() => setActiveTab('support')} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-4">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Support Menu
                                    </button>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><span className="bg-white/20 p-1.5 rounded-lg"><CheckCircle2 className="w-5 h-5" /></span>Report a Problem</h3>
                                            <p className="text-slate-300 text-sm mb-6 max-w-lg">Facing an issue? Let us know about booking failures, payment issues, or technical bugs.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Email</label><p className="font-mono text-sm">eventbooking.otp@gmail.com</p></div>
                                            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Response Time</label><p className="text-sm">Within 24 hours</p></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
