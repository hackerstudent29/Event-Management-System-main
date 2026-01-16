import React, { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VenueVisuals } from './venue-svgs';
import { ZONE_LABELS, EVENT_TYPES } from '@/lib/venue-config';
import { motion } from 'framer-motion';

// --- THEATRE GRID COMPONENTS (Preserved Highest Quality) ---
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

const TheatreSeat = ({ seat, status, onSelect }) => {
    if (seat.isSpacer) return <div className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />;
    return (
        <motion.button
            whileHover={{ scale: status === 'occupied' ? 1 : 1.15 }}
            whileTap={{ scale: status === 'occupied' ? 1 : 0.9 }}
            onClick={() => status !== 'occupied' && onSelect(seat.id)}
            disabled={status === 'occupied'}
            className={cn(
                'w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-md border flex items-center justify-center text-[10px] font-bold transition-all relative',
                status === 'available' && 'bg-white/5 border-white/20 text-slate-400 hover:bg-white/10 hover:border-white/40 hover:text-white',
                status === 'selected' && 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] z-10',
                status === 'occupied' && 'bg-slate-900 border-slate-800 text-slate-700 opacity-30 cursor-not-allowed'
            )}
        >
            <span className="z-10">{seat.number}</span>
        </motion.button>
    );
};

const TheatreGridLayout = ({ layout, selectedSeats, occupiedSeats, onSeatSelect }) => (
    <div className="w-full flex flex-col items-center gap-10">
        <Screen />
        <div className="flex flex-col gap-12 w-full max-w-4xl">
            {layout.map((category) => (
                <div key={category.categoryName} className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{category.categoryName}</h3>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {category.rows.map((row) => (
                            <div key={row.rowId} className="flex items-center gap-4">
                                <span className="w-6 text-[10px] font-bold text-slate-600 text-right">{row.rowId}</span>
                                <div className="flex gap-2">
                                    {row.seats.map((seat, i) => (
                                        <TheatreSeat
                                            key={seat.id || i}
                                            seat={seat}
                                            status={
                                                occupiedSeats.includes(seat.id) || seat.status === 'occupied'
                                                    ? 'occupied'
                                                    : selectedSeats.includes(seat.id)
                                                        ? 'selected'
                                                        : 'available'
                                            }
                                            onSelect={onSeatSelect}
                                        />
                                    ))}
                                </div>
                                <span className="w-6 text-[10px] font-bold text-slate-600 text-left">{row.rowId}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const SeatSelection = ({
    layout,
    selectedSeats, // Array of IDs
    occupiedSeats,
    onSeatSelect,
    className,
    eventType = 'Theatre',
    eventSubType = '',
    layoutVariant = ''
}) => {
    // 1. Resolve Labels based on SubType
    const zoneLabels = useMemo(() => {
        return ZONE_LABELS[eventSubType] || {};
    }, [eventSubType]);

    // 2. SMART MAPPING: Category -> Zone IDs
    const zoneMap = useMemo(() => {
        if (!layout || layout.length === 0) return {};
        const map = {};
        const slots = [
            // Tier 1 / Premium
            ['west_center', 'east_center', 'block_c', 'block_d', 'block_e', 'standing', 'courtside_north', 'courtside_south', 'west_baseline', 'east_baseline', 'stand_a_lower', 'stand_g_lower', 'west_lower', 'north_lower', 'south_lower', 'courtside_west', 'courtside_east', 'pit', 'pit_a', 'pit_b', 'c1', 'c2', 'floor_ga', 'floor_c', 'floor_section_a', 'floor_section_b', 'tier_100_c'],
            // Tier 2 / Regular
            ['north_stand', 'south_stand', 'west_left', 'west_right', 'east_lower', 'east_stand', 'block_b', 'block_f', 'block_l', 'block_m', 'stand_h_lower', 'stand_f_lower', 'stand_a_upper', 'stand_g_upper', 'c3', 'lower_100', 'lower_bowl_100s', 'lower_side_l', 'lower_side_r', 'floor_d', 'ga_rear', 'tier_100_l', 'tier_100_r', 'floor_section_c', 'floor_section_d'],
            // Tier 3 / Economy
            ['north_upper', 'south_upper', 'west_upper', 'east_upper', 'corner_nw', 'corner_ne', 'corner_sw', 'corner_se', 'block_a', 'block_g', 'block_h', 'block_j', 'block_k', 'block_n', 'block_p', 'stand_e_lower', 'stand_c_lower', 'stand_d_lower', 'stand_b_lower', 'stand_e_upper', 'stand_c_upper', 'stand_d_upper', 'stand_b_upper', 'stand_f_upper', 'stand_h_upper', 'c4', 'lower_200', 'upper_400', 'lower_bowl_200s', 'lower_bowl_200s_west', 'upper_bowl_300s', 'upper_bowl_300s_r', 'tier_200_l', 'tier_200_r', 'tier_200_c', 'l1', 'l2', 'l3', 'l4', 'r1', 'r2', 'r3', 'r4']
        ];

        const unassignedZones = new Set(slots.flat());
        // const sortedCats = [...layout].sort((a, b) => Number(b.price) - Number(a.price));

        // Pass 1: Explicit Admin Assignments
        let hasManualAssignments = false;
        layout.forEach(cat => {
            if (cat.arenaPosition && (cat.arenaPosition.includes('_') || cat.arenaPosition.length > 2)) {
                hasManualAssignments = true;
                const zones = cat.arenaPosition.includes(',') ? cat.arenaPosition.split(',') : [cat.arenaPosition];
                zones.forEach(z => {
                    const zoneId = z.trim();
                    if (zoneId && unassignedZones.has(zoneId)) {
                        map[zoneId] = cat;
                        unassignedZones.delete(zoneId);
                    }
                });
            }
        });

        // Pass 2: Remaining category distribution
        // ONLY perform if NO manual assignments were made at all (first time setup)
        if (!hasManualAssignments) {
            const sortedCats = [...layout].sort((a, b) => Number(b.price) - Number(a.price));
            const catsToDistribute = sortedCats;
            if (catsToDistribute.length > 0) {
                let catIndex = 0;
                const remainingPool = Array.from(unassignedZones);
                remainingPool.forEach((zoneId, idx) => {
                    map[zoneId] = catsToDistribute[catIndex % catsToDistribute.length];
                    if (idx % Math.ceil(remainingPool.length / catsToDistribute.length) === 0 && idx !== 0) {
                        catIndex = (catIndex + 1) % catsToDistribute.length;
                    }
                });
            }
        }

        return map;
    }, [layout]);

    const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
    const [focusedCategoryId, setFocusedCategoryId] = useState(null);
    const [activeZoneId, setActiveZoneId] = useState(null); // Tracking hover over map specifically

    // 3. Resolve Selected Zones (For highlighting on the SVG map)
    const activeZones = useMemo(() => {
        // PRECEDENCE 1: Hovered zone on map
        if (activeZoneId) return [activeZoneId];

        const selectedIds = selectedSeats || [];

        return Object.entries(zoneMap)
            .filter(([zoneId, cat]) => {
                const safeLower = (val) => String(val || '').toLowerCase();
                const safeId = (val) => String(val || '');

                // 1. Check for specific zone selection (catId::zone::zoneId)
                if (selectedIds.length > 0) {
                    const hasMatch = selectedIds.some(sel => {
                        if (!sel) return false;
                        const parts = sel.split('::');
                        if (parts.length >= 3 && parts[1] === 'zone') {
                            // This is a specific zone selection
                            return parts[2] === zoneId;
                        }
                        // Default category-based match for other seat types
                        const prefix = parts[0];
                        return prefix && (safeId(prefix) === safeId(cat.id) || safeLower(prefix) === safeLower(cat.categoryName));
                    });
                    if (hasMatch) return true;
                }

                // 2. Sidebar Focus / Hover (Broad category highlight)
                // We keep this to show where Categories are located when clicking sidebar
                const isSelectedBySearch = focusedCategoryId && (
                    safeId(cat.id) === safeId(focusedCategoryId) ||
                    safeLower(cat.categoryName) === safeLower(focusedCategoryId) ||
                    safeLower(cat.categoryName).split(' - ')[0].trim() === safeLower(focusedCategoryId)
                );
                const isHoveredByMouse = hoveredCategoryId && (
                    safeId(cat.id) === safeId(hoveredCategoryId) ||
                    safeLower(cat.categoryName) === safeLower(hoveredCategoryId) ||
                    safeLower(cat.categoryName).split(' - ')[0].trim() === safeLower(hoveredCategoryId)
                );

                return isSelectedBySearch || isHoveredByMouse;
            })
            .map(([zoneId]) => zoneId);
    }, [selectedSeats, zoneMap, hoveredCategoryId, focusedCategoryId, activeZoneId]);

    // Force focus when selection changes
    useEffect(() => {
        if (selectedSeats && selectedSeats.length > 0) {
            const firstId = selectedSeats[0].split('::')[0];
            if (firstId) setFocusedCategoryId(firstId);
        }
    }, [selectedSeats]);

    // 4. Calculate Row Assignments for SVGs
    const rowAssignments = useMemo(() => {
        if (!layout) return [];
        return layout.map(cat => ({
            id: cat.id, // Pass Category ID
            categoryName: cat.categoryName,
            color: cat.color,
            rows: cat.rows.map(r => {
                // Safety: Handle missing rowId
                const rid = r.rowId !== undefined && r.rowId !== null ? r.rowId : '1';

                // Try to parse rowId (e.g. "1", "A") to 1-based index
                if (typeof rid === 'number') return rid;
                if (!isNaN(rid) && rid !== '') return parseInt(rid);

                // Map A->1, B->2
                const code = String(rid).toUpperCase().charCodeAt(0) - 64;
                if (code >= 1 && code <= 50) return code;
                return 1; // Fallback
            }).filter(id => id > 0),
            seatsPerRow: cat.rows[0]?.seats?.length || 20
        }));
    }, [layout]);

    // 5. Handle SVG Click
    const handleZoneClick = (zoneId) => {
        const cat = zoneMap[zoneId];
        if (cat) {
            setFocusedCategoryId(cat.id);
            // Use a specific zone proxy ID: catId::zone::zoneId
            const proxyId = `${cat.id}::zone::${zoneId}`;
            onSeatSelect(proxyId, 'single-zone');
        }
    };

    // Determine if we should use Visuals or Grid
    // Use Visuals if layoutVariant is present and NOT 'Simple' or 'Grid'
    const useVisuals = layoutVariant && !['Simple', 'Grid', 'Default'].includes(layoutVariant);
    const isTheatreGrid = eventType === EVENT_TYPES.THEATRE && !useVisuals;

    return (
        <div className={cn('w-full flex justify-center', className)}>
            {isTheatreGrid ? (
                <TheatreGridLayout
                    layout={layout}
                    selectedSeats={selectedSeats}
                    occupiedSeats={occupiedSeats}
                    onSeatSelect={onSeatSelect}
                />
            ) : (
                // OTHERS (Stadium/Concert) OR Visual Theatre - Two Column Layout
                <div className="w-full flex flex-col lg:flex-row gap-4 h-[500px] lg:h-[450px]">

                    {/* LEFT PANEL: Categories & Pricing */}
                    <div className="w-full lg:w-72 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Select Category</h3>
                            <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 border border-slate-200 rounded text-center">Best Available</span>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                            {(() => {
                                // Group layout by categoryName to avoid bloating the sidebar with many zones
                                const grouped = [];
                                layout.forEach(cat => {
                                    // Strip suffix like " - NORTH" if added by backend for uniqueness
                                    const baseName = cat.categoryName.split(' - ')[0].trim();

                                    const existing = grouped.find(g => g.categoryName === baseName && g.price === cat.price);
                                    if (existing) {
                                        existing.availableSeats += cat.availableSeats;
                                        existing.ids.push(cat.id);
                                        existing.categories.push(cat);
                                    } else {
                                        grouped.push({
                                            categoryName: baseName,
                                            price: cat.price,
                                            availableSeats: cat.availableSeats,
                                            ids: [cat.id],
                                            categories: [cat],
                                            color: cat.color
                                        });
                                    }
                                });

                                // Filter to only show categories that actually have been assigned to zones on the map
                                const mappedGrouped = grouped.filter(group => {
                                    return group.ids.some(id => Object.values(zoneMap).some(cat => cat.id === id));
                                });

                                return mappedGrouped.map((group) => {
                                    const isSelected = selectedSeats.some(id => group.ids.includes(id.split('::')[0]));
                                    const isSoldOut = group.availableSeats <= 0;
                                    const isTheatre = eventType === EVENT_TYPES.THEATRE;
                                    const isFocused = focusedCategoryId && group.ids.includes(focusedCategoryId);

                                    return (
                                        <button
                                            key={group.categoryName + group.price}
                                            onMouseEnter={() => {
                                                // Highlight all zones in this group on hover
                                                setHoveredCategoryId(group.categoryName);
                                            }}
                                            onMouseLeave={() => setHoveredCategoryId(null)}
                                            onClick={() => {
                                                if (isSoldOut) {
                                                    const event = new CustomEvent('show-toast', {
                                                        detail: { message: `${group.categoryName} is sold out!`, type: 'error' }
                                                    });
                                                    window.dispatchEvent(event);
                                                    return;
                                                }

                                                // Find first category in group with available seats
                                                const targetCat = group.categories.find(c => c.availableSeats > 0) || group.categories[0];
                                                setFocusedCategoryId(targetCat.id);

                                                if (isTheatre) return;

                                                const proxyId = targetCat.rows?.[0]?.seats?.[0]?.id || `${targetCat.id}::zone`;
                                                onSeatSelect(proxyId, 'single-zone');
                                            }}
                                            disabled={isSoldOut}
                                            className={cn(
                                                "w-full text-left p-3 border-b border-slate-50 transition-all flex justify-between items-center group relative",
                                                isSoldOut ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-slate-50",
                                                (isSelected || isFocused) && !isSoldOut && "bg-blue-50/50",
                                                (isSelected || isFocused) && "border-l-4 border-l-blue-600 shadow-sm z-10"
                                            )}
                                        >
                                            {(isSelected || isFocused) && (
                                                <div className="absolute inset-0 bg-blue-600/5 animate-pulse pointer-events-none" />
                                            )}

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className={cn("font-semibold text-xs truncate", isSelected ? "text-blue-800" : "text-slate-700")}>
                                                    {group.categoryName}
                                                </div>
                                                <div className={cn("text-[10px] mt-0.5", isSoldOut ? "text-red-500 font-medium" : "text-slate-400")}>
                                                    {isSoldOut ? "Sold Out" : `${group.availableSeats} seats available`}
                                                </div>
                                            </div>
                                            <div className={cn("font-bold text-xs tabular-nums", isSelected ? "text-blue-700" : "text-slate-900")}>
                                                ₹{group.price}
                                            </div>
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Map SVG */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col">
                        <VenueVisuals
                            type={eventType}
                            subType={eventSubType}
                            variant={layoutVariant}
                            labels={zoneLabels}
                            zoneMap={zoneMap}
                            activeZones={activeZones}
                            rowAssignments={rowAssignments}
                            selectedSeats={selectedSeats}
                            occupiedSeats={occupiedSeats} // Pass occupied seats
                            onZoneSelect={handleZoneClick}
                            onZoneHover={setActiveZoneId}
                            onSeatClick={onSeatSelect}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
