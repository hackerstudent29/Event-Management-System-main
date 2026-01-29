import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Plus } from 'lucide-react';

/**
 * Row Selection Dialog
 * Allows admin to click rows on the seat map and assign categories
 */
export const RowSelectionDialog = ({ isOpen, onClose, selectedRows, subtype, onSave, initialData }) => {
    // Dynamic seat limits based on theatre subtype
    const getDefaultSeats = (subtype) => {
        const driveInTypes = ['Drive-In', 'Car Grid', 'Arena Parking'];
        return driveInTypes.includes(subtype) ? '10' : '20';
    };

    const getMaxSeats = (subtype) => {
        const driveInTypes = ['Drive-In', 'Car Grid', 'Arena Parking'];
        return driveInTypes.includes(subtype) ? 10 : 20;
    };

    const [categoryName, setCategoryName] = useState(initialData?.categoryName || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [seatsPerRow, setSeatsPerRow] = useState(initialData?.seatsPerRow || getDefaultSeats(subtype));
    const [color, setColor] = useState(initialData?.color || '#3B82F6');

    React.useEffect(() => {
        if (isOpen && initialData) {
            setCategoryName(initialData.categoryName || '');
            setPrice(initialData.price || '');
            setSeatsPerRow(initialData.seatsPerRow || getDefaultSeats(subtype));
            setColor(initialData.color || '#3B82F6');
        } else if (isOpen) {
            setCategoryName('');
            setPrice('');
            setSeatsPerRow(getDefaultSeats(subtype));
            setColor('#3B82F6');
        }
    }, [isOpen, initialData, subtype]);

    // Category suggestions based on subtype
    const categoryOptions = {
        'IMAX': ['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony'],
        'Large Format': ['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony'],
        'Laser IMAX': ['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony'],
        'Digital IMAX': ['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony'],
        'Standard Cinema': ['Platinum', 'Gold', 'Silver', 'Front Row', 'Balcony'],
        'Single Screen': ['Platinum', 'Gold', 'Silver', 'Front Row', 'Balcony'],
        'Dolby Atmos': ['Premium', 'Gold', 'Silver', 'Front Row', 'Recliner'],
        '4DX': ['Motion Premium', 'Motion Standard', 'Rear Safe Zone'],
        'ScreenX': ['Immersion Center', 'Side Immersion', 'Standard', 'Rear'],
        'Drive-In': ['Front Parking', 'Middle Parking', 'Rear Parking', 'SUV'],
        'Premium Lounge': ['Recliner Premium', 'Recliner Standard'],
        'VIP Pods': ['VIP Pod'],
        'Outdoor Cinema': ['Premium Chairs', 'Standard Chairs', 'Back Lawn']
    };

    const categories = categoryOptions[subtype] || ['Standard', 'Premium', 'VIP'];

    if (!isOpen || !selectedRows || selectedRows.length === 0) return null;

    const getRowLabel = (rowNum) => String.fromCharCode(64 + rowNum);
    const rowLabels = selectedRows.map(r => getRowLabel(r)).join(', ');

    const handleSave = () => {
        if (!categoryName || !price) {
            alert('Please fill all fields');
            return;
        }

        onSave({
            rows: selectedRows,
            categoryName,
            price: parseFloat(price),
            seatsPerRow: parseInt(seatsPerRow) || 20,
            color
        });

        // Reset
        setCategoryName('');
        setPrice('');
        setSeatsPerRow('20');
        setColor('#3B82F6');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">Assign Category to Rows</h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Selected Rows: {rowLabels}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Category Name */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Category Name
                        </Label>
                        <Select value={categoryName} onValueChange={setCategoryName}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Price (₹)
                        </Label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g., 200"
                            min="0"
                            step="10"
                            className="w-full"
                        />
                    </div>

                    {/* NEW: Seats per Row */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Seats in this Row
                        </Label>
                        <Input
                            type="number"
                            value={seatsPerRow}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const maxSeats = getMaxSeats(subtype);
                                if (val > maxSeats) setSeatsPerRow(maxSeats.toString());
                                else setSeatsPerRow(e.target.value);
                            }}
                            placeholder={`Default: ${getDefaultSeats(subtype)}`}
                            min="1"
                            max={getMaxSeats(subtype)}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum {getMaxSeats(subtype)} seats for {subtype || 'this theatre type'}
                        </p>
                    </div>

                    {/* Color */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Color
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="#3B82F6"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Preview:</div>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded"
                                style={{ backgroundColor: color }}
                            />
                            <div>
                                <div className="font-semibold text-gray-900">
                                    {categoryName || 'Category Name'}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Rows {rowLabels} • {seatsPerRow || 20} seats • ₹{price || '0'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Assignment
                    </Button>
                </div>
            </div>
        </div>
    );
};
