import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Layers } from 'lucide-react';

/**
 * Row Selection Overlay (Redesigned)
 * Sleek, modern overlay for selecting rows
 */
export const RowSelectionOverlay = ({ totalRows = 14, assignedRows = [], onRowsSelected, onCancel }) => {
    const [selectedRows, setSelectedRows] = useState([]);

    const getRowLabel = (rowNum) => String.fromCharCode(64 + rowNum);

    const toggleRow = (rowNum) => {
        if (selectedRows.includes(rowNum)) {
            setSelectedRows(selectedRows.filter(r => r !== rowNum));
        } else {
            setSelectedRows([...selectedRows, rowNum].sort((a, b) => a - b));
        }
    };

    const handleConfirm = () => {
        if (selectedRows.length > 0) {
            onRowsSelected(selectedRows);
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none p-6">
            {/* Main Control Card - Floating at Bottom */}
            <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 pointer-events-auto w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white leading-tight">Select Rows</h3>
                            <p className="text-xs text-slate-400">
                                {selectedRows.length > 0
                                    ? <span className="text-blue-400 font-medium">{selectedRows.length} rows selected</span>
                                    : 'Tap row labels below'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            onClick={onCancel}
                            className="h-8 text-xs text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedRows.length === 0}
                            className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20"
                        >
                            Confirm Selection
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-6 bg-slate-50/50">
                    <div className="flex flex-wrap justify-center gap-2">
                        {Array.from({ length: totalRows }, (_, i) => i + 1).map(rowNum => {
                            const isSelected = selectedRows.includes(rowNum);
                            const isAssigned = assignedRows.includes(rowNum);
                            return (
                                <button
                                    type="button"
                                    key={rowNum}
                                    disabled={isAssigned}
                                    onClick={() => toggleRow(rowNum)}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center 
                                        text-sm font-bold transition-all duration-200
                                        ${isAssigned
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                                            : isSelected
                                                ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-blue-600 ring-offset-2'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'}
                                    `}
                                >
                                    {getRowLabel(rowNum)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Select Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedRows(Array.from({ length: totalRows }, (_, i) => i + 1))}
                            className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRows([])}
                            className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg pointer-events-none">
                Active Selection Mode
            </div>
        </div>
    );
};
