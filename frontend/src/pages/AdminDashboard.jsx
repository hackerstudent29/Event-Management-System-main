import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useExtendedAlert, ExtendedAlert } from '@/components/ui/extended-alert';
import { useMessage } from '../context/MessageContext';
import { DropdownCalendar } from '@/components/ui/dropdown-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Search, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrbitalClock } from '@/components/ui/orbital-clock';
import { ModernTimePicker } from '@/components/ui/modern-time-picker';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { DeleteEventDialog } from '@/components/ui/delete-event-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Map, Marker } from '@/components/ui/map';
import { VenueVisuals } from '@/components/ui/venue-svgs';
import { ZoneConfigDialog } from '@/components/ui/zone-config-dialog';
import { RowSelectionOverlay } from '@/components/ui/row-selection-overlay';
import { RowSelectionDialog } from '@/components/ui/row-selection-dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { useFileInput } from '@/hooks/use-file-input';
import { supabase } from '@/lib/supabase';
import { EVENT_TYPES, EVENT_SUBTYPES, LAYOUT_VARIANTS, getLayoutsForSubtype } from '@/lib/venue-config';
import { getCategoriesForSport } from '@/lib/stadium-categories';
import { autoPopulateZoneConfigs, getConfiguredZonesCount, getTotalZonesCount } from '@/lib/stadium-zone-mapping';

// Legacy categories for non-stadium events (Theatre, Concert, etc.)
const LEGACY_SEAT_CATEGORIES = [
    { name: "General Admission", color: "#22C55E" },
    { name: "Standard", color: "#3B82F6" },
    { name: "Silver", color: "#9CA3AF" },
    { name: "Gold", color: "#FACC15" },
    { name: "Platinum", color: "#A855F7" },
    { name: "Premium", color: "#6366F1" },
    { name: "Elite", color: "#EF4444" },
    { name: "VIP", color: "#F97316" },
    { name: "Front Row", color: "#14B8A6" },
    { name: "Balcony", color: "#64748B" },
];

const ASPECT_RATIOS = [
    { id: 'poster', label: 'Poster', ratio: '2/3', className: 'aspect-[2/3]' },
    { id: 'square', label: 'Square', ratio: '1/1', className: 'aspect-square' },
    { id: 'landscape', label: 'Landscape', ratio: '16/9', className: 'aspect-video' },
];

import { CropImageDialog } from '@/components/ui/crop-image-modal';

const EventImageUpload = ({ value, onChange, aspectRatio = '2/3', onAspectRatioChange, onError, onUploadStart, onUploadEnd }) => {
    const {
        fileName,
        error,
        fileInputRef,
        handleFileSelect,
        fileSize,
        clearFile,
        file
    } = useFileInput({
        accept: "image/*",
        maxSize: 5
    });

    const [previewUrl, setPreviewUrl] = React.useState(value);
    const [cropOpen, setCropOpen] = React.useState(false);
    const [cropImage, setCropImage] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);

    // Update preview when value changes
    React.useEffect(() => {
        if (!file) {
            setPreviewUrl(value);
        }
    }, [value, file]);

    // Handle file selection - open cropper
    React.useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setCropImage(objectUrl);
            setCropOpen(true);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    const handleCropComplete = async (croppedBlob) => {
        if (!croppedBlob) return;
        setUploading(true);
        if (onUploadStart) onUploadStart();
        try {
            console.log("Starting upload for cropped file");
            const fileExt = "jpg"; // Cropper output is jpeg
            const fileName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
            const filePath = `images/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('event-images')
                .upload(filePath, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true,
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error("Supabase upload error:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);

            console.log("Public URL generated:", data.publicUrl);
            onChange(data.publicUrl);
            setPreviewUrl(data.publicUrl); // Show new image immediately

            clearFile();

        } catch (error) {
            console.error('Error uploading event poster:', error);
            if (onError) {
                onError(error.message || "Failed to upload image");
            } else {
                alert("Failed to upload image. Please try again. Error: " + error.message);
            }
            clearFile();
        } finally {
            setUploading(false);
            if (onUploadEnd) onUploadEnd();
            setCropOpen(false);
        }
    };

    const handleCropCancel = () => {
        setCropOpen(false);
        setCropImage(null);
        clearFile();
    };

    const handleClear = () => {
        clearFile();
        onChange('');
        setPreviewUrl('');
    };

    return (
        <div className="space-y-4">
            <CropImageDialog
                open={cropOpen}
                onOpenChange={(open) => {
                    if (!open) handleCropCancel();
                }}
                imageUrl={cropImage}
                aspectRatio={aspectRatio}
                onAspectRatioChange={onAspectRatioChange}
                onCropComplete={handleCropComplete}
            />

            <div className="flex gap-4 items-center">
                <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Select Image'}
                </Button>
                {(fileName || previewUrl) && (
                    <Button
                        type="button"
                        onClick={handleClear}
                        variant="ghost"
                        size="sm"
                    >
                        Clear
                    </Button>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
            />

            {(fileName || previewUrl) && (
                <div className="space-y-4">
                    {previewUrl && (
                        <div className={cn(
                            "relative w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm transition-all duration-300 ease-in-out mx-auto",
                            aspectRatio === '2/3' && "aspect-[2/3] max-w-sm",
                            aspectRatio === '1/1' && "aspect-square max-w-sm",
                            aspectRatio === '16/9' && "aspect-video w-full"
                        )}>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        </div>
                    )}



                    <div className="space-y-1">
                        {fileName && <p className="text-sm text-muted-foreground">
                            Original: {fileName}
                        </p>}
                        {fileSize > 0 && <p className="text-sm text-muted-foreground">
                            Size: {(fileSize / (1024 * 1024)).toFixed(2)}MB
                        </p>}
                    </div>
                </div>
            )}
            {previewUrl && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">Ready</span>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                        Verify URL <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                </div>
            )}
            {error && (
                <p className="text-sm text-red-500">
                    Error: {error}
                </p>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        eventDate: '',
        eventType: '',
        locationName: '',
        locationAddress: '',
        imageUrl: '',
        imageAspectRatio: '2/3',
        latitude: 20.5937,
        longitude: 78.9629,
        zoom: 5,
        eventSubType: '',
        seatingLayoutVariant: ''
    });
    const [stats, setStats] = useState({ totalEvents: 0, totalBookings: 0, totalRevenue: 0 }); // Changed totalSeatsSold to totalRevenue
    const { alert, showAlert } = useExtendedAlert();
    const { showMessage } = useMessage();
    const isEditingRef = React.useRef(null); // Ref to track edit mode for zone merging

    // Zone Dialog State (NEW APPROACH)
    const [zoneDialog, setZoneDialog] = useState({ isOpen: false, zoneId: null, zoneName: '' });
    const [zoneConfigs, setZoneConfigs] = useState({}); // { 'stand_a_lower': { categoryName, seats, price, color } }

    // Row Selection State (NEW)
    const [rowSelectionMode, setRowSelectionMode] = useState(false);

    // Bulk Delete State
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Get sport-specific categories based on selected event subtype
    const availableCategories = React.useMemo(() => {
        // For Stadium events, use sport-specific categories
        if (newEvent.eventType === EVENT_TYPES.STADIUM && newEvent.eventSubType) {
            const sportCategories = getCategoriesForSport(newEvent.eventSubType);
            if (sportCategories && sportCategories.length > 0) {
                return sportCategories;
            }
        }
        // For other event types, use legacy categories
        return LEGACY_SEAT_CATEGORIES;
    }, [newEvent.eventType, newEvent.eventSubType]);
    const [rowAssignments, setRowAssignments] = useState([]);
    const [selectedRowsForDialog, setSelectedRowsForDialog] = useState(null);
    const [editingRowIndex, setEditingRowIndex] = useState(null);

    // Helper state for Date Picker
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("10:00");
    const [bookingOpenDate, setBookingOpenDate] = useState(null);
    const [bookingOpenTime, setBookingOpenTime] = useState("10:00");
    const [clockDate, setClockDate] = useState(new Date());

    // Auto-generate zone map for display
    const adminZoneMap = React.useMemo(() => {
        const map = {};
        Object.entries(zoneConfigs).forEach(([zoneId, config]) => {
            map[zoneId] = {
                categoryName: config.categoryName,
                price: config.price,
                color: config.color
            };
        });
        return map;
    }, [zoneConfigs]);

    // Get active zones (configured zones + currently editing zone)
    const activeZones = React.useMemo(() => [
        ...Object.keys(zoneConfigs),
        ...(zoneDialog.isOpen ? [zoneDialog.zoneId] : [])
    ], [zoneConfigs, zoneDialog.isOpen, zoneDialog.zoneId]);

    // Sync clock with selected time
    useEffect(() => {
        if (selectedDate) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours);
            d.setMinutes(minutes);
            setClockDate(d);
        } else {
            setClockDate(new Date());
        }
    }, [selectedDate, selectedTime]);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            // Sort events by date - newest first
            const sortedEvents = (res.data || []).sort((a, b) =>
                new Date(b.eventDate || 0) - new Date(a.eventDate || 0)
            );
            setEvents(sortedEvents);
        } catch (error) {
            console.error("Failed to fetch events");
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/bookings/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats");
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchStats();
    }, []);

    // Effect to start with existing date if editing
    useEffect(() => {
        if (newEvent.id && newEvent.eventDate) {
            const d = new Date(newEvent.eventDate);
            if (!isNaN(d.getTime())) {
                setSelectedDate(d);
                const hours = d.getHours().toString().padStart(2, '0');
                const minutes = d.getMinutes().toString().padStart(2, '0');
                setSelectedTime(`${hours}:${minutes}`);
            }

            if (event.bookingOpenDate) {
                const bod = new Date(event.bookingOpenDate);
                if (!isNaN(bod.getTime())) {
                    setBookingOpenDate(bod);
                    const hours = bod.getHours().toString().padStart(2, '0');
                    const minutes = bod.getMinutes().toString().padStart(2, '0');
                    setBookingOpenTime(`${hours}:${minutes}`);
                }
            } else {
                setBookingOpenDate(null);
                setBookingOpenTime("10:00");
            }
        } else if (!newEvent.id && !newEvent.eventDate) {
            // Only reset to defaults if we are explicitly clearing/resetting the whole form
            setSelectedDate(null);
            setSelectedTime("10:00");
            setBookingOpenDate(null);
            setBookingOpenTime("10:00");
        }
    }, [newEvent.id]);

    // Effect to reset layout when subtype changes
    useEffect(() => {
        if (newEvent.eventSubType && newEvent.eventType) {
            const availableLayouts = getLayoutsForSubtype(newEvent.eventType, newEvent.eventSubType);
            // If current layout is not valid for new subtype, reset to first available layout
            if (!availableLayouts.includes(newEvent.seatingLayoutVariant)) {
                setNewEvent(prev => ({ ...prev, seatingLayoutVariant: availableLayouts[0] || '' }));
            }
        }
    }, [newEvent.eventSubType, newEvent.eventType]);

    // Effect to auto-populate zones when Stadium sport is selected
    useEffect(() => {
        // Only auto-populate for Stadium events
        if (newEvent.eventType === EVENT_TYPES.STADIUM && newEvent.eventSubType) {
            const sportCategories = getCategoriesForSport(newEvent.eventSubType);

            if (sportCategories && sportCategories.length > 0) {
                // Auto-populate all zones with pre-defined categories
                const autoConfigs = autoPopulateZoneConfigs(newEvent.eventSubType, sportCategories);

                // If editing an event, merge defaults with existing to ensure new zones (e.g. Corners) appear
                if (newEvent.id && isEditingRef.current === newEvent.id) {
                    setZoneConfigs(prev => ({ ...autoConfigs, ...prev }));
                    isEditingRef.current = null; // Clear ref after merge
                } else {
                    setZoneConfigs(autoConfigs);
                }

                console.log(`✅ Auto-populated ${Object.keys(autoConfigs).length} zones for ${newEvent.eventSubType}`);
            }
        } else {
            // Clear zone configs for non-stadium events or when no subtype selected
            if (Object.keys(zoneConfigs).length > 0) {
                setZoneConfigs({});
            }
        }
    }, [newEvent.eventType, newEvent.eventSubType]);

    const handleEventTypeChange = (type) => {
        const subTypes = EVENT_SUBTYPES[type] || [];
        const defaultSubType = subTypes[0] || '';
        const availableLayouts = getLayoutsForSubtype(type, defaultSubType);
        const defaultLayout = availableLayouts[0] || 'Default';

        setNewEvent(prev => ({
            ...prev,
            eventType: type,
            eventSubType: defaultSubType,
            seatingLayoutVariant: defaultLayout
        }));
    };

    const handleChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    // Special handler for Date/Time updates
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const combined = new Date(selectedDate);
            combined.setHours(hours);
            combined.setMinutes(minutes);

            const year = combined.getFullYear();
            const month = (combined.getMonth() + 1).toString().padStart(2, '0');
            const day = combined.getDate().toString().padStart(2, '0');
            const localIso = `${year}-${month}-${day}T${selectedTime}:00`;

            setNewEvent(prev => ({ ...prev, eventDate: localIso }));
        }
    }, [selectedDate, selectedTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Basic Validation
            if (!newEvent.name || !newEvent.eventType) {
                showAlert('Missing Information', 'Please fill in Event Name and Type.', 'warning');
                return;
            }

            if (!selectedDate || !selectedTime) {
                showAlert('Missing Date/Time', 'Please select both Date and Start Time.', 'warning');
                return;
            }

            // 2. Construct precise ISO Date
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const dateObj = new Date(selectedDate);
            dateObj.setHours(hours);
            dateObj.setMinutes(minutes);

            // Format manually to YYYY-MM-DDTHH:mm:00 (LocalDateTime standard)
            const pad = (n) => n.toString().padStart(2, '0');
            const localIso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(hours)}:${pad(minutes)}:00`;

            // 3. Categories from Zone Configurations
            // 3. Categories from Zone Configurations
            let enabledCategories = [];

            // A. Theatre Row Assignments (Priority if present)
            if (rowAssignments && rowAssignments.length > 0) {
                enabledCategories = rowAssignments.map((assignment) => ({
                    categoryName: assignment.categoryName,
                    price: parseFloat(assignment.price) || 0,
                    totalSeats: assignment.rows.length * (parseInt(assignment.seatsPerRow) || 20),
                    availableSeats: assignment.rows.length * (parseInt(assignment.seatsPerRow) || 20),
                    // Serialize config into arenaPosition: "rows:A,C,E;cols:20"
                    arenaPosition: `rows:${(assignment.rows || []).join(',')};cols:${assignment.seatsPerRow || 20}`,
                    color: assignment.color
                }));
            }
            // B. Visual Zone Configs (Stadium/Concert/Default)
            else {
                enabledCategories = Object.entries(zoneConfigs).map(([zoneId, config]) => ({
                    categoryName: config.categoryName,
                    price: parseFloat(config.price) || 0,
                    totalSeats: parseInt(config.seats) || 0,
                    availableSeats: parseInt(config.seats) || 0,
                    arenaPosition: zoneId,
                    color: config.color
                }));
            }

            if (enabledCategories.length === 0 && [EVENT_TYPES.STADIUM, EVENT_TYPES.CONCERT].includes(newEvent.eventType)) {
                showAlert('No Zones Configured', 'Please configure at least one zone for Stadium/Concert events.', 'warning');
                return;
            }

            // 4. Final Payload
            const payload = {
                name: newEvent.name,
                description: newEvent.description,
                eventDate: localIso,
                eventType: newEvent.eventType,
                categories: enabledCategories,
                locationName: newEvent.locationName,
                locationAddress: newEvent.locationAddress,
                imageUrl: newEvent.imageUrl,
                latitude: newEvent.latitude,
                longitude: newEvent.longitude,
                eventSubType: newEvent.eventSubType,
                seatingLayoutVariant: newEvent.seatingLayoutVariant,
                bookingOpenDate: bookingOpenDate ? (() => {
                    const pad = (n) => n.toString().padStart(2, '0');
                    const bod = new Date(bookingOpenDate);
                    const [bh, bm] = bookingOpenTime.split(':').map(Number);
                    return `${bod.getFullYear()}-${pad(bod.getMonth() + 1)}-${pad(bod.getDate())}T${pad(bh)}:${pad(bm)}:00`;
                })() : null
            };

            console.log("Submitting Event Payload:", payload);

            if (newEvent.id) {
                // UPDATE
                await api.put(`/events/${newEvent.id}`, payload);
                showMessage('Event updated successfully!', { type: 'success' });
            } else {
                // CREATE
                await api.post('/events', payload);
                showMessage('Event created successfully!', { type: 'success' });
            }

            fetchEvents();
            fetchStats();

            // 5. Reset form
            setNewEvent({ name: '', description: '', eventDate: '', eventType: '', eventSubType: '', seatingLayoutVariant: '' });
            setSelectedDate(null);
            setSelectedTime("10:00");
            setBookingOpenDate(null);
            setBookingOpenTime("10:00");
            setZoneConfigs({}); // Reset zone configurations
            setRowAssignments([]); // Reset row assignments
        } catch (error) {
            console.error("Event Creation/Update Error Full:", error);
            let errorMessage = error.response?.data?.message || error.message || 'Failed to process event.';
            showAlert('Operation Failed', errorMessage, 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedEvents.length === 0) return;

        try {
            await Promise.all(selectedEvents.map(id => api.delete(`/events/${id}`)));
            showMessage(`Successfully deleted ${selectedEvents.length} event(s)!`, { type: 'success' });
            setSelectedEvents([]);
            setShowBulkDeleteDialog(false);
            fetchEvents();
            fetchStats();
        } catch (error) {
            showAlert('Bulk Delete Failed', 'Failed to delete some events', 'error');
            setShowBulkDeleteDialog(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/events/${id}`);
            showMessage('Event deleted successfully!', { type: 'success' }); // Toast for success
            fetchEvents();
            fetchStats();
        } catch (error) {
            showAlert('Delete Failed', 'Failed to delete event', 'error');
        }
    };

    const handleCancelEvent = async (id, reason) => {
        try {
            await api.post(`/events/${id}/cancel`, { reason });
            showMessage('Event cancelled successfully!', { type: 'success' }); // Toast for success
            fetchEvents();
            fetchStats();
        } catch (error) {
            showAlert('Cancellation Failed', 'Failed to cancel event', 'error');
        }
    };

    const handleEdit = (event) => {
        isEditingRef.current = event.id; // Set ref to trigger merge logic in useEffect
        setNewEvent({
            id: event.id,
            name: event.name,
            description: event.description,
            eventDate: event.eventDate,
            eventType: event.eventType,
            locationName: event.locationName || '',
            locationAddress: event.locationAddress || '',
            imageUrl: event.imageUrl || '',
            imageAspectRatio: event.imageAspectRatio || '2/3',
            latitude: Number(event.latitude) || 20.5937,
            longitude: Number(event.longitude) || 78.9629,
            eventSubType: event.eventSubType || '',
            seatingLayoutVariant: event.seatingLayoutVariant || ''
        });

        // Sync categories to Zone Configs
        // Sync categories to Zone Configs or Row Assignments
        const existingZones = {};
        const existingAssignments = [];

        if (event.categories && Array.isArray(event.categories)) {
            event.categories.forEach(cat => {
                // Check if it's a serialized Row Assignment
                if (cat.arenaPosition && typeof cat.arenaPosition === 'string' && cat.arenaPosition.startsWith('rows:')) {
                    try {
                        const parts = cat.arenaPosition.split(';');
                        const rowsPart = parts.find(p => p.startsWith('rows:'));
                        const colsPart = parts.find(p => p.startsWith('cols:'));
                        const rowsVal = rowsPart ? rowsPart.split(':')[1].split(',') : [];
                        const colsVal = colsPart ? parseInt(colsPart.split(':')[1]) : 20;

                        existingAssignments.push({
                            categoryName: cat.categoryName,
                            price: cat.price,
                            color: cat.color || '#3B82F6',
                            rows: rowsVal,
                            seatsPerRow: colsVal
                        });
                    } catch (e) { console.warn("Parse error", e); }
                }
                // Else regular Zone Config
                else if (cat.arenaPosition) {
                    existingZones[cat.arenaPosition] = {
                        categoryName: cat.categoryName,
                        seats: cat.totalSeats,
                        price: cat.price,
                        color: cat.color || '#3B82F6' // Default fallback
                    };
                }
            });
        }
        setZoneConfigs(existingZones);
        setRowAssignments(existingAssignments);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLocationSelect = async (pos) => {
        // 1. Update coordinates immediately for UI responsiveness
        setNewEvent(prev => ({ ...prev, ...pos }));

        // 2. Fetch address
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.latitude}&lon=${pos.longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
                setNewEvent(prev => ({
                    ...prev,
                    locationAddress: data.display_name
                }));
            }
        } catch (err) {
            console.error("Failed to fetch address", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-2">Manage your events and settings.</p>
                    </div>
                    <div className="hidden md:block transform scale-75 origin-bottom-right">
                        <OrbitalClock date={clockDate} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Events</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalEvents}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Bookings</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Seats Sold</h3>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalSeatsSold}</p>
                    </div>
                </div>

                {/* Main Form Island */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] divide-x divide-slate-100">
                        {/* LEFT: Create Event */}
                        <div>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h2 className="text-xl font-bold text-slate-900">Create Event</h2>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Event Name</label>
                                    <input
                                        name="name"
                                        placeholder="e.g. Summer Music Festival"
                                        value={newEvent.name}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Event Type</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none flex items-center justify-between text-left"
                                            >
                                                <span className={cn(!newEvent.eventType && "text-slate-400")}>
                                                    {newEvent.eventType || "Select Type"}
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                            <DropdownMenuItem onClick={() => handleEventTypeChange(EVENT_TYPES.CONCERT)}>
                                                Concert
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEventTypeChange(EVENT_TYPES.THEATRE)}>
                                                Theatre
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEventTypeChange(EVENT_TYPES.STADIUM)}>
                                                Stadium
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Event Sub-Type & Layout Variant */}
                                {newEvent.eventType && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Sub-Type</label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button type="button" className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-all text-left flex justify-between items-center text-sm">
                                                        <span>{newEvent.eventSubType || "Select"}</span>
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {(EVENT_SUBTYPES[newEvent.eventType] || []).map(sub => (
                                                        <DropdownMenuItem key={sub} onClick={() => setNewEvent({ ...newEvent, eventSubType: sub })}>
                                                            {sub}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        {newEvent.eventType !== 'Stadium' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Layout</label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button type="button" className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-all text-left flex justify-between items-center text-sm">
                                                            <span>{newEvent.seatingLayoutVariant || "Default"}</span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {getLayoutsForSubtype(newEvent.eventType, newEvent.eventSubType).map(v => (
                                                            <DropdownMenuItem key={v} onClick={() => setNewEvent({ ...newEvent, seatingLayoutVariant: v })}>
                                                                {v}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Event Poster</label>
                                    <EventImageUpload
                                        value={newEvent.imageUrl}
                                        onChange={(url) => setNewEvent(prev => ({ ...prev, imageUrl: url }))}
                                        aspectRatio={newEvent.imageAspectRatio}
                                        onAspectRatioChange={(ratio) => setNewEvent(prev => ({ ...prev, imageAspectRatio: ratio }))}
                                        onError={(msg) => showAlert('Upload Failed', msg, 'error')}
                                        onUploadStart={() => setIsUploadingImage(true)}
                                        onUploadEnd={() => setIsUploadingImage(false)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Detail what this event is about..."
                                        rows="4"
                                        value={newEvent.description}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                    />
                                </div>

                                {/* Event Location Map */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-700">Event Location</label>
                                        <span className="text-xs text-slate-500">Tap map or search to set location</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                className="w-full h-10 pl-9 pr-20 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white outline-none"
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
                                                                setNewEvent(prev => ({
                                                                    ...prev,
                                                                    latitude: Number(lat),
                                                                    longitude: Number(lon),
                                                                    locationAddress: display_name,
                                                                    zoom: 15
                                                                }));
                                                            }
                                                        } catch (err) {
                                                            console.error("Search failed", err);
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">ENTER</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            name="locationName"
                                            placeholder="Venue Name (e.g. JLN Stadium)"
                                            value={newEvent.locationName || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white transition-all outline-none"
                                        />
                                        <input
                                            name="locationAddress"
                                            placeholder="Full Address"
                                            value={newEvent.locationAddress || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="h-[300px] w-full rounded-lg border border-slate-200 overflow-hidden relative z-0">
                                        <Map
                                            initialViewState={{
                                                longitude: Number(newEvent.longitude) || 78.9629,
                                                latitude: Number(newEvent.latitude) || 20.5937,
                                                zoom: newEvent.zoom || 5
                                            }}
                                            className="w-full h-full"
                                            onClick={handleLocationSelect}
                                        >
                                            <Marker
                                                longitude={Number(newEvent.longitude) || 78.9629}
                                                latitude={Number(newEvent.latitude) || 20.5937}
                                                draggable={true}
                                                onDragEnd={handleLocationSelect}
                                            />
                                        </Map>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Event Date</label>
                                        <ModernDatePicker
                                            date={selectedDate}
                                            setDate={setSelectedDate}
                                            disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Event Start Time</label>
                                        <ModernTimePicker
                                            value={selectedTime}
                                            onChange={setSelectedTime}
                                            disabled={!selectedDate}
                                            minTime={(() => {
                                                if (!selectedDate) return null;
                                                const now = new Date();
                                                const sel = new Date(selectedDate);
                                                if (sel.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) return null;

                                                const future = new Date();
                                                // future.setHours(future.getHours() + 3);

                                                if (future.getDate() !== new Date().getDate()) return "24:00";

                                                return `${future.getHours().toString().padStart(2, '0')}:${future.getMinutes().toString().padStart(2, '0')}`;
                                            })()}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pb-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            Booking Open Date
                                        </label>
                                        <ModernDatePicker
                                            date={bookingOpenDate}
                                            setDate={setBookingOpenDate}
                                            disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                                        />
                                        <p className="text-[10px] text-slate-400">Leave empty to open booking immediately.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Booking Open Time</label>
                                        <ModernTimePicker
                                            value={bookingOpenTime}
                                            onChange={setBookingOpenTime}
                                            disabled={!bookingOpenDate}
                                            minTime={(() => {
                                                if (!bookingOpenDate) return null;
                                                const now = new Date();
                                                const sel = new Date(bookingOpenDate);
                                                if (sel.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) return null;

                                                const future = new Date();
                                                // future.setHours(future.getHours() + 3);

                                                if (future.getDate() !== new Date().getDate()) return "24:00";

                                                return `${future.getHours().toString().padStart(2, '0')}:${future.getMinutes().toString().padStart(2, '0')}`;
                                            })()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Seat Categories */}
                        <div>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h2 className="text-xl font-bold text-slate-900">Seat Categories</h2>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-4">Click on any zone in the stadium to configure it.</p>

                                {/* Visual Zone Assigner */}
                                {['Stadium', 'Concert', 'Theatre'].includes(newEvent.eventType) && (
                                    <div className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50 text-center">
                                        <h3 className="font-bold text-slate-700 text-sm mb-2">{newEvent.eventType} Layout</h3>
                                        <p className="text-xs text-slate-500 mb-3">Click any zone to configure category, seats, and pricing</p>
                                        <div className="relative overflow-hidden rounded-lg bg-white border border-slate-200 shadow-inner h-[500px] flex items-center justify-center">
                                            <VenueVisuals
                                                key={`${newEvent.eventType}-${newEvent.seatingLayoutVariant}`}
                                                type={newEvent.eventType}
                                                subType={newEvent.eventSubType}
                                                variant={newEvent.seatingLayoutVariant}
                                                zoneMap={adminZoneMap}
                                                activeZones={activeZones}
                                                rowAssignments={rowAssignments}
                                                adminMode={true}
                                                zoneConfigs={zoneConfigs}
                                                onZoneSelect={(zoneId) => {
                                                    // Format zone name for display
                                                    const zoneName = zoneId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                    setZoneDialog({
                                                        isOpen: true,
                                                        zoneId,
                                                        zoneName,
                                                        initialData: zoneConfigs[zoneId] || {}
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* NEW: Configure Rows Button (for Theatre only) */}
                                {newEvent.eventType === 'Theatre' && (
                                    <div className="mt-4">
                                        <Button
                                            type="button"
                                            onClick={() => setRowSelectionMode(true)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            📝 Configure Rows
                                        </Button>
                                    </div>
                                )}

                                {/* Configured Zones List */}
                                {Object.keys(zoneConfigs).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-slate-700 mb-3">Configured Zones ({Object.keys(zoneConfigs).length})</h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {Object.entries(zoneConfigs).map(([zoneId, config]) => (
                                                <div key={zoneId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: config.color }}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">{config.categoryName}</div>
                                                            <div className="text-xs text-slate-500">
                                                                {zoneId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {config.seats} seats • ₹{config.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoneDialog({
                                                                isOpen: true,
                                                                zoneId,
                                                                zoneName: zoneId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                                                initialData: config
                                                            })}
                                                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newConfigs = { ...zoneConfigs };
                                                                delete newConfigs[zoneId];
                                                                setZoneConfigs(newConfigs);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Configured Row Assignments */}
                                {rowAssignments.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-bold text-slate-700 mb-3">Configured Row Assignments ({rowAssignments.length})</h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {rowAssignments.map((assignment, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: assignment.color }}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">{assignment.categoryName}</div>
                                                            <div className="text-xs text-slate-500">
                                                                Rows {assignment.rows.join(', ')} • {assignment.seatsPerRow} seats/row • ₹{assignment.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedRowsForDialog(assignment.rows);
                                                                setEditingRowIndex(index);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRowAssignments(rowAssignments.filter((_, i) => i !== index));
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Zone Configuration Dialog */}
                            <ZoneConfigDialog
                                isOpen={zoneDialog.isOpen}
                                zoneName={zoneDialog.zoneName}
                                initialData={zoneDialog.initialData}
                                availableCategories={availableCategories}
                                onClose={() => setZoneDialog({ isOpen: false, zoneId: null, zoneName: '' })}
                                onSave={(config) => {
                                    setZoneConfigs({
                                        ...zoneConfigs,
                                        [zoneDialog.zoneId]: config
                                    });
                                }}
                            />

                            {/* NEW: Row Selection Overlay */}
                            {rowSelectionMode && (
                                <RowSelectionOverlay
                                    totalRows={(() => {
                                        // Dynamic row count based on theatre subtype
                                        const rowLimits = {
                                            'IMAX': 6,
                                            'Large Format IMAX': 6,
                                            'Laser IMAX': 6,
                                            'Digital IMAX': 6,
                                            'Standard Cinema': 6,
                                            'Single Screen': 6,
                                            'Dolby Atmos': 6,
                                            '4DX': 6,
                                            '4DX Standard': 6,
                                            'Motion Seats': 6,
                                            'ScreenX': 6,
                                            'Standard ScreenX': 6,
                                            'Side-Wall Immersion': 6,
                                            'Drive-In': 6,
                                            'Car Grid': 6,
                                            'Arena Parking': 6,
                                            'Premium Lounge': 6,
                                            'Luxury Recliners': 6,
                                            'VIP Pods': 6,
                                            'Outdoor Cinema': 6,
                                            'Open Air': 6
                                        };
                                        return rowLimits[newEvent.eventSubType] || rowLimits[newEvent.seatingLayoutVariant] || 6;
                                    })()}
                                    assignedRows={rowAssignments.flatMap(a => a.rows)}
                                    onRowsSelected={(rows) => {
                                        setSelectedRowsForDialog(rows);
                                        setRowSelectionMode(false);
                                    }}
                                    onCancel={() => setRowSelectionMode(false)}
                                />
                            )}

                            {/* NEW: Row Selection Dialog */}
                            <RowSelectionDialog
                                isOpen={selectedRowsForDialog !== null}
                                onClose={() => {
                                    setSelectedRowsForDialog(null);
                                    setEditingRowIndex(null);
                                }}
                                selectedRows={selectedRowsForDialog}
                                initialData={editingRowIndex !== null ? rowAssignments[editingRowIndex] : null}
                                subtype={newEvent.eventSubType}
                                onSave={(assignment) => {
                                    if (editingRowIndex !== null) {
                                        const newAssignments = [...rowAssignments];
                                        newAssignments[editingRowIndex] = assignment;
                                        setRowAssignments(newAssignments);
                                    } else {
                                        setRowAssignments([...rowAssignments, assignment]);
                                    }
                                    setSelectedRowsForDialog(null);
                                    setEditingRowIndex(null);
                                    console.log('Row assignment saved:', assignment);
                                }}
                            />
                        </div>
                    </div>

                    {/* Integrated Full-width Submit Section */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                        <button
                            type="submit"
                            disabled={isUploadingImage}
                            className={`flex-1 font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 ${isUploadingImage ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                        >
                            {isUploadingImage ? 'Uploading Image...' : (newEvent.id ? 'Update Event Details' : 'Create New Event')}
                        </button>

                        {newEvent.id && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewEvent({ name: '', description: '', eventDate: '', eventType: '', eventSubType: '', seatingLayoutVariant: '' });
                                    setSelectedDate(null);
                                    setSelectedTime("10:00");
                                    setZoneConfigs({});
                                }}
                                className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {/* Manage Events Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Manage Events</h2>
                        {selectedEvents.length > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600">
                                    {selectedEvents.length} selected
                                </span>
                                <Button
                                    onClick={() => setShowBulkDeleteDialog(true)}
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete Selected ({selectedEvents.length})
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="p-0">
                        {events.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No events created yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-xs font-semibold text-slate-500">
                                        <tr>
                                            <th className="px-4 py-4 w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEvents.length === events.length && events.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedEvents(events.map(ev => ev.id));
                                                        } else {
                                                            setSelectedEvents([]);
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {events.map(event => (
                                            <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEvents.includes(event.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedEvents([...selectedEvents, event.id]);
                                                            } else {
                                                                setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{event.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{new Date(event.eventDate).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 inline-block w-fit">{event.eventType}</span>
                                                        {event.cancelled && (
                                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">Cancelled</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {!event.cancelled && (
                                                            <button type="button" className="text-primary hover:text-primary/80 font-medium text-xs px-3 py-1 bg-primary/10 rounded" onClick={() => handleEdit(event)}>Edit</button>
                                                        )}
                                                        <DeleteEventDialog
                                                            onConfirm={() => handleDelete(event.id)}
                                                            onCancelEvent={(reason) => handleCancelEvent(event.id, reason)}
                                                            trigger={
                                                                <button type="button" className="text-red-500 hover:text-red-600 font-medium text-xs px-3 py-1 bg-red-50 rounded">Delete</button>
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">
                            Delete Multiple Events?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                            You are about to permanently delete <span className="font-bold text-red-600">{selectedEvents.length} event(s)</span>.
                            This action cannot be undone. All associated bookings and data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ExtendedAlert state={alert} />
        </div>
    );
};

export default AdminDashboard;
