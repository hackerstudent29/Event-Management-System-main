"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

/**
 * Single Date Picker with Year/Month Dropdowns
 * Can be used as a standalone card or inside a popover.
 */
function DropdownCalendar({ date, setDate }) {
    const today = new Date();
    const [month, setMonthState] = React.useState(date ? date.getMonth() : today.getMonth());
    const [year, setYearState] = React.useState(date ? date.getFullYear() : today.getFullYear());

    React.useEffect(() => {
        if (date) {
            setMonthState(date.getMonth());
            setYearState(date.getFullYear());
        }
    }, [date]);

    const handleMonthChange = (newMonth) => {
        setMonthState(newMonth);
    };

    const handleYearChange = (newYear) => {
        setYearState(newYear);
    };

    const handleSelect = (newDate) => {
        if (newDate) {
            setDate(newDate);
            setMonthState(newDate.getMonth());
            setYearState(newDate.getFullYear());
        } else {
            setDate(null);
        }
    };

    const displayMonth = new Date(year, month);

    return (
        <Card className="w-auto shadow-none border-none bg-background p-0">
            <CardContent className="flex flex-col gap-4 p-0">
                {/* Dropdowns */}
                <div className="flex gap-2">
                    {/* Year Select */}
                    <Select
                        value={year.toString()}
                        onValueChange={(val) => handleYearChange(Number(val))}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 1 + i).map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Month Select */}
                    <Select
                        value={month.toString()}
                        onValueChange={(val) => handleMonthChange(Number(val))}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                    {format(new Date(2000, i, 1), "MMMM")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Calendar */}
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    month={displayMonth}
                    onMonthChange={(date) => {
                        setMonthState(date.getMonth());
                        setYearState(date.getFullYear());
                    }}
                    className="rounded-md border mx-auto"
                />
            </CardContent>
        </Card>
    );
}

export { DropdownCalendar };
