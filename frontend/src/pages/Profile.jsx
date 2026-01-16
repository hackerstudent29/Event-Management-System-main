import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, LogOut, Edit3, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import api from '../api/axios';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await api.put('/auth/profile', profileData);
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password changed successfully!');
        } catch (error) {
            alert('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete('/auth/delete-account');
            logout();
            navigate('/login');
        } catch (error) {
            alert('Failed to delete account');
            setLoading(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-slate-900">Profile</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-slate-600 hover:text-slate-900"
                    >
                        Back
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleUpdateProfile} disabled={loading} className="flex-1">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <p className="text-sm font-medium text-slate-900">{user.phone || 'Not set'}</p>
                                </div>
                            </div>
                            <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <Lock className="w-5 h-5 text-slate-600" />
                        <span className="font-medium text-slate-900">Change Password</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-red-50 transition-colors text-red-600"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-red-600"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-medium">Delete Account</span>
                    </button>
                </div>
            </main>

            {/* Password Modal */}
            {showPasswordModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowPasswordModal(false)} />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up md:max-w-md md:mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl">
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleChangePassword} disabled={loading} className="flex-1">
                                    {loading ? 'Changing...' : 'Change Password'}
                                </Button>
                                <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up md:max-w-md md:mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl">
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-bold text-red-600">Delete Account?</h3>
                            <p className="text-sm text-slate-600">This action cannot be undone. All your data will be permanently deleted.</p>
                            <div className="flex gap-2">
                                <Button onClick={handleDeleteAccount} disabled={loading} variant="destructive" className="flex-1">
                                    {loading ? 'Deleting...' : 'Delete Account'}
                                </Button>
                                <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
