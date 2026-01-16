"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export function ModernDatePicker({ date, setDate, placeholder = "Pick a date", ...props }) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Internal state for month/year navigation
    const today = new Date();
    const [month, setMonth] = React.useState(date || today);

    const handleSelect = (newDate) => {
        setDate(newDate);
        if (newDate) {
            setIsOpen(false); // Close on select
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full h-11 justify-between text-left font-normal bg-slate-50 border-slate-200 hover:bg-white hover:border-primary/30 transition-all px-4 rounded-lg group shadow-sm",
                        !date && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-slate-900 font-medium">
                            {date ? format(date, "PPP") : placeholder}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">Date</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                <div className="bg-white px-3 py-2 border-b border-slate-100 flex justify-between items-center backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-tight">Event Date</span>
                        <span className="text-xs font-semibold text-slate-700 leading-tight">
                            {date ? format(date, "MMMM yyyy") : format(month, "MMMM yyyy")}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={month.getFullYear().toString()}
                            onValueChange={(year) => {
                                const newDate = new Date(month);
                                newDate.setFullYear(parseInt(year));
                                setMonth(newDate);
                            }}
                        >
                            <SelectTrigger className="h-6 w-[75px] text-[10px] font-bold border-slate-100 bg-slate-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => today.getFullYear() + i).map((y) => (
                                    <SelectItem key={y} value={y.toString()} className="text-xs">
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    month={month}
                    onMonthChange={setMonth}
                    initialFocus
                    className="p-2"
                    classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                    }}
                    {...props}
                />

                <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-semibold h-7 rounded-lg text-slate-500 hover:bg-slate-200/50 px-2"
                        onClick={() => {
                            setDate(today);
                            setMonth(today);
                        }}
                    >
                        Today
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
