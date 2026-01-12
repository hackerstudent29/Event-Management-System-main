import React, { useState } from "react"
import { Trash2, AlertCircle } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const REASONS = [
    "Technical difficulties at the venue",
    "Unforeseen weather conditions",
    "Artist/Performer unavailability",
    "Security concerns",
    "Low ticket sales",
    "Other"
];

export function DeleteEventDialog({ onConfirm, onCancelEvent, trigger }) {
    const [step, setStep] = useState(1); // 1: Initial Choice, 2: Cancel Reason, 3: Confirm Hard Delete
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const handleCancelSubmit = () => {
        const finalReason = selectedReason === "Other" ? customReason : selectedReason;
        onCancelEvent(finalReason);
        reset();
    };

    const reset = () => {
        setStep(1);
        setSelectedReason("");
        setCustomReason("");
    }

    return (
        <AlertDialog onOpenChange={(open) => !open && reset()}>
            <AlertDialogTrigger asChild>
                {trigger || <Button variant="destructive">Delete</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        {step === 2 ? (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                            <Trash2 className="h-5 w-5 text-red-500" />
                        )}
                        <AlertDialogTitle>
                            {step === 1 ? "Manage Event" : step === 2 ? "Cancel Event" : "Delete Event Permanently"}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        {step === 1 ? (
                            "How would you like to proceed? Cancelling will keep the event in records and notify users about their refund. Deleting will remove everything permanently."
                        ) : step === 2 ? (
                            "Please provide a reason for cancelling this event. This message will be shown to all attendees."
                        ) : (
                            "This action CANNOT be undone. All event data and booking history will be permanently erased."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {step === 2 && (
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Select Reason</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm bg-white hover:bg-slate-50 transition-colors">
                                        <span>{selectedReason || "Choose a reason..."}</span>
                                        <Trash2 className="h-4 w-4 opacity-0" /> {/* Spacer */}
                                        <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                    {REASONS.map((r) => (
                                        <DropdownMenuItem key={r} onClick={() => setSelectedReason(r)}>
                                            {r}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {selectedReason === "Other" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <label className="text-sm font-medium text-slate-700">Custom Reason</label>
                                <textarea
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    placeholder="Enter the specific reason for cancellation..."
                                    rows={3}
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                <AlertDialogFooter className={cn(step === 1 && "sm:justify-between flex-col-reverse sm:flex-row gap-2")}>
                    {step === 1 ? (
                        <>
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                    onClick={() => setStep(2)}
                                >
                                    Cancel Event
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-bold"
                                    onClick={() => setStep(3)}
                                >
                                    Hard Delete
                                </Button>
                            </div>
                            <AlertDialogCancel className="mt-0">Back</AlertDialogCancel>
                        </>
                    ) : step === 2 ? (
                        <>
                            <AlertDialogCancel onClick={() => setStep(1)}>Back</AlertDialogCancel>
                            <Button
                                disabled={!selectedReason || (selectedReason === "Other" && !customReason.trim())}
                                onClick={handleCancelSubmit}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                Confirm Cancellation
                            </Button>
                        </>
                    ) : (
                        <>
                            <AlertDialogCancel onClick={() => setStep(1)}>Back</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onConfirm}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                                DELETE PERMANENTLY
                            </AlertDialogAction>
                        </>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
