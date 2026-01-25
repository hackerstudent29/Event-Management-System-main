"use client";

import * as React from "react";
import { Clock, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModernTimePicker({ value, onChange, minTime, disabled }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const parseTo12h = (timeStr) => {
        if (!timeStr) return { h: "10", m: "00", p: "AM" };
        const [h24, m24] = timeStr.split(":").map(Number);
        const p = h24 >= 12 ? "PM" : "AM";
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return {
            h: h12.toString().padStart(2, "0"),
            m: m24.toString().padStart(2, "0"),
            p: p
        };
    };

    const [selH, setSelH] = React.useState("10");
    const [selM, setSelM] = React.useState("00");
    const [selP, setSelP] = React.useState("AM");

    React.useEffect(() => {
        const { h, m, p } = parseTo12h(value);
        setSelH(h);
        setSelM(m);
        setSelP(p);
    }, [value, isOpen]);

    const [minH, minM] = React.useMemo(() => {
        if (!minTime || typeof minTime !== 'string') return [0, 0];
        const [h, m] = minTime.split(':').map(Number);
        return [h, m];
    }, [minTime]);

    React.useEffect(() => {
        const { h, m, p } = parseTo12h(value);
        setSelH(h);
        setSelM(m);
        setSelP(p);
    }, [value, isOpen]);

    const isHourDisabled = (hStr) => {
        if (!minTime) return false;
        let h24 = parseInt(hStr);
        if (selP === "PM" && h24 !== 12) h24 += 12;
        if (selP === "AM" && h24 === 12) h24 = 0;
        return h24 < minH;
    };

    const isPeriodDisabled = (pStr) => {
        if (!minTime) return false;
        // If minH is >= 12, then "AM" is fully disabled
        if (pStr === "AM" && minH >= 12) return true;
        return false;
    };

    const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const periods = ["AM", "PM"];

    const hRef = React.useRef(null);
    const mRef = React.useRef(null);
    const pRef = React.useRef(null);
    const isInternalScroll = React.useRef(false);

    const scrollTo = (ref, val, list) => {
        if (ref.current) {
            isInternalScroll.current = true;
            const idx = list.indexOf(val);
            ref.current.scrollTop = idx * 40;
            setTimeout(() => { isInternalScroll.current = false; }, 100);
        }
    };

    const handleScroll = (ref, list, setState) => {
        if (isInternalScroll.current) return;
        const scrollTop = ref.current.scrollTop;
        const idx = Math.round(scrollTop / 40);
        if (idx >= 0 && idx < list.length) {
            const newVal = list[idx];
            setState(newVal);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                scrollTo(hRef, selH, hoursList);
                scrollTo(mRef, selM, minutesList);
                scrollTo(pRef, selP, periods);
            }, 50);
        }
    }, [isOpen]);

    const onConfirm = () => {
        let h24 = parseInt(selH);
        if (selP === "PM" && h24 !== 12) h24 += 12;
        if (selP === "AM" && h24 === 12) h24 = 0;
        const time24 = `${h24.toString().padStart(2, "0")}:${selM}`;

        // Final validation before confirming
        if (minTime && typeof minTime === 'string') {
            const [currMinH] = minTime.split(':').map(Number);
            if (h24 < currMinH) return; // Prevent confirming invalid time
        }

        onChange(time24);
        setIsOpen(false);
    };

    const display = React.useMemo(() => {
        const { h, m, p } = parseTo12h(value);
        return `${h}:${m} ${p}`;
    }, [value]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full h-11 justify-between text-left font-normal bg-slate-50 border-slate-200 hover:bg-white hover:border-primary/30 transition-all px-4 rounded-lg group shadow-sm",
                        disabled && "opacity-50 cursor-not-allowed bg-slate-100"
                    )}
                >
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-slate-900 font-medium">{display}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">Time</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[280px] p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                <div className="bg-white p-3 border-b border-slate-100 flex justify-between items-center backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Select Time</span>
                        <span className="text-sm font-semibold text-slate-700">
                            {selH}:{selM} {selP}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/10 animate-pulse delay-75" />
                    </div>
                </div>

                <div className="flex h-44 relative bg-white">
                    {/* HOUR */}
                    <div
                        ref={hRef}
                        onScroll={() => handleScroll(hRef, hoursList, setSelH)}
                        className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-[68px] scroll-smooth snap-y snap-mandatory"
                    >
                        {hoursList.map(h => {
                            const disabled = isHourDisabled(h);
                            return (
                                <button
                                    key={h}
                                    onClick={() => !disabled && scrollTo(hRef, h, hoursList)}
                                    disabled={disabled}
                                    className={cn(
                                        "flex items-center justify-center w-full h-10 text-sm snap-center transition-all duration-200",
                                        selH === h ? "text-primary font-semibold scale-110" : "text-slate-300 hover:text-slate-400",
                                        disabled && "opacity-20 cursor-not-allowed pointer-events-none text-slate-200"
                                    )}
                                >
                                    {h}
                                </button>
                            )
                        })}
                    </div>

                    <div className="w-px bg-slate-50 my-6" />

                    {/* MINUTE */}
                    <div
                        ref={mRef}
                        onScroll={() => handleScroll(mRef, minutesList, setSelM)}
                        className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-[68px] scroll-smooth snap-y snap-mandatory"
                    >
                        {minutesList.map(m => (
                            <button
                                key={m}
                                onClick={() => scrollTo(mRef, m, minutesList)}
                                className={cn(
                                    "flex items-center justify-center w-full h-10 text-sm snap-center transition-all duration-200",
                                    selM === m ? "text-primary font-semibold scale-110" : "text-slate-300 hover:text-slate-400"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="w-px bg-slate-50 my-6" />

                    {/* PERIOD */}
                    <div
                        ref={pRef}
                        onScroll={() => handleScroll(pRef, periods, setSelP)}
                        className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-[68px] scroll-smooth snap-y snap-mandatory"
                    >
                        {periods.map(p => {
                            const disabled = isPeriodDisabled(p);
                            return (
                                <button
                                    key={p}
                                    onClick={() => !disabled && scrollTo(pRef, p, periods)}
                                    disabled={disabled}
                                    className={cn(
                                        "flex items-center justify-center w-full h-10 text-xs font-semibold snap-center transition-all duration-200",
                                        selP === p ? "text-primary scale-110" : "text-slate-300 hover:text-slate-400",
                                        disabled && "opacity-20 cursor-not-allowed pointer-events-none text-slate-200"
                                    )}
                                >
                                    {p}
                                </button>
                            )
                        })}
                    </div>

                    {/* Selection Highlight */}
                    <div className="absolute inset-x-3 h-10 top-1/2 -translate-y-1/2 pointer-events-none border-y border-slate-100 bg-slate-50/50 z-0" />
                </div>

                <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                    <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs h-10 rounded-xl text-slate-500 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" size="sm" className="flex-1 text-xs font-semibold h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>


            </PopoverContent>
        </Popover>
    );
}
