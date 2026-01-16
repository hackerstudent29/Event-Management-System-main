"use client"

import React, { useState, useCallback } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription, // Added for accessibility
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import Cropper from 'react-easy-crop' // Switched to robust library
import { Crop, ZoomIn, ZoomOut, RotateCcw, Check, X, RefreshCcw } from "lucide-react"

export function CropImageDialog({ open, onOpenChange, imageUrl, aspectRatio, onCropComplete, onAspectRatioChange }) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 }); // Required for easy-crop
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false); // Track if image is ready
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate aspect ratio value
    const getAspectValue = (ratioStr) => {
        if (!ratioStr) return 2 / 3; // Default Poster
        const [w, h] = ratioStr.split('/').map(Number);
        return w / h;
    };

    const aspectValue = getAspectValue(aspectRatio);

    // Define ratios for the UI
    const RATIO_OPTIONS = [
        { id: 'poster', label: '2:3', value: '2/3' },
        { id: 'square', label: '1:1', value: '1/1' },
        { id: 'landscape', label: '16:9', value: '16/9' }
    ];

    const onCropCompleteEvent = useCallback((croppedArea, currentCroppedAreaPixels) => {
        setCroppedAreaPixels(currentCroppedAreaPixels);
        // If this fires, image is definitely loaded/ready
        // No need for the imageLoaded check here, onMediaLoaded handles it
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
        if (!pixelCrop) throw new Error("Crop region not determined.");

        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // set each dimensions to double largest dimension to allow for a safe area for the
        // image to rotate in without being clipped by canvas context
        canvas.width = safeArea;
        canvas.height = safeArea;

        // translate canvas context to a central location on image to allow rotating around the center.
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // draw rotated image and store data.
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        // set canvas width to final desired crop size - this will clear existing context
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // paste generated rotate image with correct offsets for x,y crop values.
        ctx.putImageData(
            data,
            0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
            0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
        );

        // As Blob
        return new Promise((resolve) => {
            canvas.toBlob((file) => {
                resolve(file);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleSave = async () => {
        if (!imageLoaded || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
            onCropComplete(croppedImageBlob);
            onOpenChange(false);
        } catch (e) {
            console.error("Crop failed:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 bg-neutral-950 border-neutral-800 text-neutral-50 overflow-hidden sm:rounded-xl shadow-2xl">

                {/* HEADER */}
                <AlertDialogHeader className="px-6 py-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0 bg-neutral-950 z-10 shrink-0">
                    <div>
                        <AlertDialogTitle className="text-lg font-semibold text-white tracking-tight">
                            Edit Poster
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-white/60 mt-0.5">
                            Adjust height/width to fit event card.
                        </AlertDialogDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-white/10">
                        {RATIO_OPTIONS.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => onAspectRatioChange && onAspectRatioChange(r.value)}
                                className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${aspectRatio === r.value
                                    ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                                    : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </AlertDialogHeader>

                {/* BODY (Crop Area) */}
                <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-8 group">
                    {imageUrl && (
                        <div className="absolute inset-0 w-full h-full">
                            <Cropper
                                image={imageUrl}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspectValue}
                                onCropChange={setCrop}
                                onCropComplete={onCropCompleteEvent}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onMediaLoaded={() => setImageLoaded(true)}
                                classes={{
                                    containerClassName: "relative w-full h-full bg-black",
                                    mediaClassName: "max-w-full max-h-full",
                                }}
                                showGrid={true}
                            />
                        </div>
                    )}

                    {/* Loading State Overlay */}
                    {(!imageUrl || !imageLoaded) && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950 text-white/50">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                <div className="animate-pulse text-xs uppercase tracking-widest">Loading...</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTROLS (Bottom Bar) */}
                <div className="px-6 py-3 shrink-0 flex items-center gap-4 border-t border-white/10 bg-neutral-900/50 backdrop-blur-sm z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2"
                        title="Reset View"
                    >
                        <RefreshCcw className="w-4 h-4 mr-1.5" />
                        <span className="text-xs">Reset</span>
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-2"></div>

                    <div className="flex-1 flex items-center gap-3">
                        <ZoomOut className="w-4 h-4 text-white/40" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.05}
                            onValueChange={(v) => setZoom(v[0])}
                            className="w-full max-w-[200px]"
                        />
                        <ZoomIn className="w-4 h-4 text-white/80" />
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block"></div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRotation(r => r - 90)}
                        className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 hidden sm:flex"
                        title="Rotate"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                {/* FOOTER (Actions) */}
                <AlertDialogFooter className="p-4 bg-neutral-950 flex flex-row justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!imageLoaded || isProcessing}
                        className="bg-white text-black hover:bg-white/90 font-medium px-6 min-w-[100px]"
                    >
                        {isProcessing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            "Apply"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
