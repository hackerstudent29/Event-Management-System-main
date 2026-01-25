import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MapPin, Navigation } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LOCATION_DATA } from '../lib/location-data';

const LocationModal = () => {
    const { user, updateUser } = useAuth();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState('select'); // 'select' or 'manual'
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        // Show modal if user is logged in but hasn't set up location AND hasn't skipped it
        if (user && !user.latitude && !sessionStorage.getItem('locationSkipped')) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [user]);

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            // If closing and still no location set, mark as skipped
            if (!user.latitude) {
                sessionStorage.setItem('locationSkipped', 'true');
            }
        }
        setOpen(isOpen);
    };

    const handleDetectLocation = () => {
        setDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                // Reverse Geocoding (Optional - usually requires API, here we just save lat/long)
                // For now, we'll just save lat/long and mark state as 'Detected'
                try {
                    await updateUserLocation(latitude, longitude, "Tamil Nadu", "Chennai"); // Default
                    toast.success("Location detected successfully!");
                    setOpen(false);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to save location.");
                } finally {
                    setDetecting(false);
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                toast.error("Location access denied. Please select manually.");
                setDetecting(false);
                setMode('manual');
            });
        } else {
            toast.error("Geolocation not supported. Please select manually.");
            setDetecting(false);
            setMode('manual');
        }
    };

    const handleManualSubmit = async () => {
        if (!selectedState || !selectedDistrict) {
            toast.error("Please select both State and District");
            return;
        }

        if (LOCATION_DATA[selectedState] && LOCATION_DATA[selectedState][selectedDistrict]) {
            const coords = LOCATION_DATA[selectedState][selectedDistrict];
            await updateUserLocation(coords.lat, coords.lng, selectedState, selectedDistrict);
            setOpen(false);
        } else {
            toast.error("Invalid location selected");
        }
    };

    const updateUserLocation = async (lat, lng, state, district) => {
        try {
            const res = await api.put(`/users/profile/${user.id}`, {
                latitude: lat,
                longitude: lng,
                state: state,
                district: district
            });

            // Update user in context immediately (no reload needed)
            updateUser({
                latitude: lat,
                longitude: lng,
                state: state,
                district: district
            });

        } catch (error) {
            console.error("Update failed", error);
            throw error;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Your Location</DialogTitle>
                    <DialogDescription>
                        To show you events happening nearby (within 100km).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {mode === 'select' ? (
                        <>
                            <Button
                                onClick={handleDetectLocation}
                                disabled={detecting}
                                className="h-12 text-lg gap-2"
                            >
                                {detecting ? (
                                    "Detecting..."
                                ) : (
                                    <>
                                        <Navigation className="w-5 h-5" />
                                        Detect My Location
                                    </>
                                )}
                            </Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setMode('manual')}>
                                Select Manually
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">State</label>
                                <Select onValueChange={setSelectedState} value={selectedState}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(LOCATION_DATA).map(state => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedState && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">District</label>
                                    <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(LOCATION_DATA[selectedState]).map(dist => (
                                                <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setMode('select')}>Back</Button>
                                <Button className="flex-1" onClick={handleManualSubmit}>Save Location</Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocationModal;
