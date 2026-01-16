import React from 'react';
import { X, Check, Crown, Users, Wallet, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useExtendedAlert, ExtendedAlert } from '@/components/ui/extended-alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ZoneConfigDialog = ({ isOpen, onClose, zoneName, onSave, initialData = {}, availableCategories = [] }) => {
    const { alert, showAlert } = useExtendedAlert();
    const [formData, setFormData] = React.useState({
        categoryName: initialData.categoryName || '',
        seats: initialData.seats || '',
        price: initialData.price || '',
        color: initialData.color || '#3B82F6'
    });

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                categoryName: initialData.categoryName || '',
                seats: initialData.seats || '',
                price: initialData.price || '',
                color: initialData.color || '#3B82F6'
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        if (!formData.categoryName || !formData.seats || !formData.price) {
            showAlert('Missing Information', 'Please fill all fields', 'warning');
            return;
        }
        onSave(formData);
        onClose();
    };

    const handleCategoryChange = (categoryName) => {
        const selectedCategory = availableCategories.find(cat => cat.name === categoryName);
        setFormData({
            ...formData,
            categoryName,
            color: selectedCategory?.color || formData.color
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-lg overflow-hidden relative border border-slate-200"
                    >
                        {/* Interactive Header */}
                        <div className="relative pt-8 px-8 pb-6 bg-gradient-to-b from-slate-50/50 to-transparent">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                    <Palette className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configure Zone</h2>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mt-0.5">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase tracking-wider text-slate-600 font-bold border border-slate-200">Zone ID</span>
                                        {zoneName}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="px-8 pb-8 space-y-6">
                            {/* Category Selection */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown className="w-4 h-4 text-blue-500" />
                                    <label className="text-sm font-semibold text-slate-800 tracking-wide">TICKET CATEGORY</label>
                                </div>

                                {availableCategories.length > 0 && formData.categoryName && initialData.categoryName ? (
                                    <div className="group relative">
                                        <div className="w-full px-4 py-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 text-blue-900 font-bold flex items-center justify-between transition-all">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-sm shadow-black/20"
                                                    style={{ backgroundColor: formData.color }}
                                                />
                                                <span>{formData.categoryName}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                <Check className="w-3 h-3" />
                                                Active
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5 px-1">
                                            📍 {availableCategories.find(cat => cat.name === formData.categoryName)?.description}
                                        </p>
                                    </div>
                                ) : availableCategories.length > 0 ? (
                                    <Select
                                        value={formData.categoryName}
                                        onValueChange={handleCategoryChange}
                                    >
                                        <SelectTrigger className="h-14 rounded-xl border-slate-200 text-base font-medium focus:ring-blue-500/20 shadow-sm">
                                            <SelectValue placeholder="Choose a seating category..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat.name} value={cat.name} className="py-3 rounded-lg focus:bg-blue-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                                        <span className="font-semibold">{cat.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={formData.categoryName}
                                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                        placeholder="e.g., Diamond VIP"
                                        className="h-14 rounded-xl border-slate-200 text-base font-medium focus:ring-blue-500/20"
                                    />
                                )}
                            </div>

                            {/* Two-Column Grid for Seats and Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">CAPACITY</label>
                                    </div>
                                    <Input
                                        type="number"
                                        value={formData.seats}
                                        onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                        placeholder="500"
                                        className="h-12 rounded-xl border-slate-200 font-bold focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wallet className="w-4 h-4 text-slate-400" />
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">PRICE (₹)</label>
                                    </div>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="1500"
                                        className="h-12 rounded-xl border-slate-200 font-bold focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {/* Color Selection (if not auto-assigned) */}
                            {availableCategories.length === 0 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">ZONE COLOR</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0F172A'].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center p-0 hover:scale-110",
                                                    formData.color === color ? "border-slate-900 shadow-md ring-2 ring-slate-100" : "border-slate-100"
                                                )}
                                                style={{ backgroundColor: color }}
                                            >
                                                {formData.color === color && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary / Confirmation area */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Estimated Revenue</span>
                                    <span className="font-bold text-emerald-600">
                                        ₹{((formData.seats || 0) * (formData.price || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2">
                                <ExtendedAlert state={alert} />
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex gap-2"
                                    >
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

