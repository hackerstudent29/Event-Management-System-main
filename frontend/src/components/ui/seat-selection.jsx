
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- Sub-components ---

// Renders the curved screen at the top
const Screen = () => (
    <div className="relative w-full flex justify-center items-center mb-12">
        <motion.div
            className="h-12 w-full max-w-2xl border-b-4 border-foreground"
            style={{
                borderBottomLeftRadius: '50%',
                borderBottomRightRadius: '50%',
                boxShadow: '0px 15px 30px -5px hsl(var(--foreground) / 0.5)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.span
            className="absolute -bottom-2 text-sm font-medium tracking-widest text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            SCREEN
        </motion.span>
    </div>
);

// Renders an individual seat
const Seat = memo(({ seat, status, onSelect }) => {
    // Render a spacer div if the seat is a spacer
    if (seat.isSpacer) {
        return <div className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />;
    }

    return (
        <motion.div
            role="button"
            tabIndex={status === 'occupied' ? -1 : 0}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (status !== 'occupied') onSelect(seat.id);
            }}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && status !== 'occupied') {
                    e.preventDefault();
                    onSelect(seat.id);
                }
            }}
            aria-disabled={status === 'occupied'}
            aria-label={`Seat ${seat.number}, ${status}`}
            aria-pressed={status === 'selected'}
            className={
                cn(
                    'w-8 h-8 md:w-10 md:h-10 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    {
                        'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30 hover:text-white cursor-pointer': status === 'available',
                        'bg-blue-600 text-white border-blue-400 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110 z-10': status === 'selected',
                        'bg-slate-800/50 text-slate-600 border-transparent cursor-not-allowed opacity-40': status === 'occupied',
                    }
                )}
            // Animation props for visual feedback
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: status === 'occupied' ? 1 : 1.15 }}
            whileTap={{ scale: status === 'occupied' ? 1 : 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {seat.number}
        </motion.div>
    );
});
Seat.displayName = 'Seat';

// --- Main Component ---

export const SeatSelection = ({
    layout,
    selectedSeats,
    occupiedSeats,
    onSeatSelect,
    className,
}) => {
    // Framer Motion variants for staggered animations
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
    };

    const rowVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.02 } },
    };

    return (
        <div className={cn('w-full flex flex-col items-center gap-10 bg-transparent', className)}>
            <Screen />
            <motion.div
                className="w-full flex flex-col gap-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {layout.map((category) => (
                    <div key={category.categoryName} className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                {category.categoryName}
                            </h3>
                            <p className="text-[10px] font-medium text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(category.price)} + GST
                            </p>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            {category.rows.map((row) => (
                                <motion.div
                                    key={row.rowId}
                                    className="flex items-center justify-center gap-4"
                                    variants={rowVariants}
                                >
                                    <div className="w-6 text-[10px] font-black text-slate-700 select-none text-right">{row.rowId}</div>
                                    <div className="flex justify-center items-center gap-2 flex-wrap max-w-2xl px-4">
                                        {row.seats.map((seat, index) => (
                                            <Seat
                                                key={seat.id || `${row.rowId}-${index}`}
                                                seat={seat}
                                                onSelect={onSeatSelect}
                                                status={
                                                    occupiedSeats.includes(seat.id)
                                                        ? 'occupied'
                                                        : selectedSeats.includes(seat.id)
                                                            ? 'selected'
                                                            : 'available'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <div className="w-6 text-[10px] font-black text-slate-700 select-none text-left">{row.rowId}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
