import React from 'react';
import { SvgWrapper, Zone } from './venue-primitives';
import { cn } from '@/lib/utils';

// ============================================================================
// EXTENDED VENUE LAYOUTS (Theatres, Concerts, Specific Stadiums)
// ============================================================================

// --- HELPER FOR PROPS ---
const useZoneProps = (zoneMap, activeZones, onZoneClick, adminMode, onZoneHover) => {
    return (id, labelText) => {
        const cat = zoneMap[id];
        const label = cat ? cat.categoryName : (adminMode ? labelText : "");
        return {
            id,
            label,
            selected: activeZones.includes(id),
            occupied: adminMode ? false : !cat,
            onClick: () => onZoneClick(id),
            onMouseEnter: onZoneHover ? () => onZoneHover(id) : null,
            onMouseLeave: onZoneHover ? () => onZoneHover(null) : null,
            className: adminMode || cat ? "hover:brightness-110" : "opacity-20",
            color: cat?.color
        };
    };
};

/* -------------------------------------------------------------------------- */
/*                                   THEATRE                                  */
/* -------------------------------------------------------------------------- */

// 1. IMAX - Large Format / Laser / Digital (Shared Base Layout with Individual Seats)
// 1. IMAX - Large Format / Laser / Digital (Shared Base Layout with Individual Seats)
const ImaxBaseSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], screenLabel = "IMAX SCREEN", onSeatClick, selectedSeats = [], occupiedSeats = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // IMAX - Dynamic Capacity
    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 20;
        const allRows = rowAssignments.flatMap(a => a.rows);
        const max = Math.max(...allRows);
        return max > 0 ? max : 20;
    }, [rowAssignments]);

    const cols = 20;
    const seatSize = 20;
    const seatGap = 6;
    const startY = 120;
    const centerX = 400;

    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];

    // Straight Grid Layout - No Curve

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const assignment = getRowAssignment(row);
        const isAssigned = !!assignment;
        if (!adminMode && !isAssigned) continue;

        const currentZone = isAssigned ? assignment.categoryName : 'Unassigned';
        // const zoneProps = isAssigned ? getProps(currentZone, '') : ... 
        const forcedColor = assignment ? assignment.color : null;

        // Use Category ID if available
        const catId = assignment?.id;

        const baseCols = assignment ? (assignment.seatsPerRow || cols) : cols;
        const rowWidth = baseCols * (seatSize + seatGap);
        const rowY = startY + (row - 1) * (seatSize + seatGap);

        // Render Row Labels
        if (adminMode || isAssigned) {
            const labelY = rowY - 65; // Fixed alignment for straight grid
            seats.push(
                <text key={`label-L-${row}`} x={centerX - rowWidth / 2 - 30} y={labelY + 80}
                    className={cn("text-xs font-bold fill-slate-400", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
            seats.push(
                <text key={`label-R-${row}`} x={centerX + rowWidth / 2 + 30} y={labelY + 80}
                    className={cn("text-xs font-bold fill-slate-400", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
        }

        for (let col = 1; col <= baseCols; col++) {
            const xOffset = (col - 1) * (seatSize + seatGap);
            const x = (centerX - rowWidth / 2) + xOffset;

            const seatNumber = `${rowLabel}${col}`;
            const fullSeatId = catId ? `${catId}::${seatNumber}` : seatNumber;
            const isSelected = selectedSeats && selectedSeats.includes(fullSeatId);
            const isSold = occupiedSeats && occupiedSeats.includes(fullSeatId);

            seats.push(
                <g key={seatNumber}>
                    <rect x={x} y={rowY} width={seatSize} height={seatSize} rx="4"
                        className={cn("seat transition-all",
                            !isAssigned && "opacity-40 hover:opacity-100",
                            isSold && "opacity-60",
                            isAssigned && !isSold && !isSelected && "hover:brightness-110"
                        )}
                        style={{
                            fill: isSold ? '#e5e7eb' : (isSelected ? (forcedColor || '#818cf8') : '#ffffff'),
                            stroke: isSold ? '#9ca3af' : (forcedColor || '#818cf8'),
                            strokeWidth: isSelected ? '3' : '2',
                            pointerEvents: isSold ? 'none' : 'auto',
                            cursor: isSold ? 'not-allowed' : 'pointer'
                        }}
                        data-seat={fullSeatId} data-category={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAssigned && !isSold) {
                                if (onSeatClick) onSeatClick(fullSeatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={rowY + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[7px] font-bold"
                        style={{
                            fill: isSold ? '#6b7280' : (isSelected ? '#ffffff' : (forcedColor || '#818cf8'))
                        }}>
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            {/* Curved Screen - Widened */}
            <path
                d="M 50 60 Q 400 15 750 60"
                stroke="#e2e8f0"
                strokeWidth="6"
                fill="none"
                className="drop-shadow-lg"
            />
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-sm font-bold tracking-[0.3em] uppercase">
                {screenLabel}
            </text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">{screenLabel}</text>

            {/* Individual Seats */}
            <g id="seats">{seats}</g>

            <style>{`
                .seat:hover:not(.opacity-60) { filter: brightness(1.05); }
            `}</style>
        </SvgWrapper>
    );
};

export const ImaxLargeFormatSvg = (props) => <ImaxBaseSvg {...props} screenLabel="IMAX LARGE FORMAT" />;
export const ImaxLaserSvg = (props) => <ImaxBaseSvg {...props} screenLabel="IMAX LASER" />;
export const ImaxDigitalSvg = (props) => <ImaxBaseSvg {...props} screenLabel="IMAX DIGITAL" />;


// 2. STANDARD CINEMA - Single Screen (MIDPOINT GAPS per spec)
export const StandardCinemaSingleScreenSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick, selectedSeats = [], occupiedSeats = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // STANDARD CINEMA - Dynamic Capacity
    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 16;
        const allRows = rowAssignments.flatMap(a => a.rows);
        const max = Math.max(...allRows);
        return max > 0 ? max : 16;
    }, [rowAssignments]);

    const cols = 20;
    const seatSize = 22;
    const seatGap = 7;
    const startY = 120;
    const centerX = 400;

    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap) + (seatGap * 2);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const assignment = getRowAssignment(row);
        const isAssigned = !!assignment;

        if (!adminMode && !isAssigned) continue;

        const currentZone = isAssigned ? assignment.categoryName : 'Unassigned';
        // const zoneProps = isAssigned ? getProps(currentZone, '') : ... 
        const forcedColor = assignment ? assignment.color : null;
        const catId = assignment?.id;

        const baseCols = assignment ? (assignment.seatsPerRow || cols) : cols;
        const currentRowCols = (row === rows) ? baseCols + 1 : baseCols;
        const hasGap = currentRowCols > 10 && row !== rows;
        const gapSize = hasGap ? 20 : 0;
        const gapCol = Math.ceil(currentRowCols / 2);

        const rowWidth = currentRowCols * (seatSize + seatGap) + gapSize;
        const rowStartX = centerX - rowWidth / 2;

        if (adminMode || isAssigned) {
            seats.push(
                <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-400", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
            seats.push(
                <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-400", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
        }

        for (let col = 1; col <= currentRowCols; col++) {
            let xOffset = (col - 1) * (seatSize + seatGap);
            if (hasGap && col > gapCol) xOffset += gapSize;

            const x = rowStartX + xOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatNumber = `${rowLabel}${col}`;
            const fullSeatId = catId ? `${catId}::${seatNumber}` : seatNumber;
            const isSelected = selectedSeats && selectedSeats.includes(fullSeatId);
            const isSold = occupiedSeats && occupiedSeats.includes(fullSeatId);

            seats.push(
                <g key={seatNumber}>
                    <rect x={x} y={y} width={seatSize} height={seatSize} rx="3"
                        className={cn("seat transition-all",
                            !isAssigned && "fill-slate-50 opacity-50 hover:opacity-100 border-dashed",
                            isSold && "opacity-30 fill-slate-700",
                            isAssigned && !isSold && !isSelected && "hover:brightness-110",
                            isSelected && "fill-blue-600"
                        )}
                        style={{
                            fill: isSelected ? '#2563eb' : (isAssigned && !isSold ? forcedColor || '#e2e8f0' : undefined),
                            pointerEvents: isSold ? 'none' : 'auto',
                            cursor: isSold ? 'not-allowed' : 'pointer'
                        }}
                        strokeWidth="1" data-seat={fullSeatId} data-category={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAssigned && !isSold) {
                                if (onSeatClick) onSeatClick(fullSeatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 60 Q 400 30 650 60" stroke="#e2e8f0" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-sm font-bold tracking-[0.3em] uppercase">SCREEN</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">STANDARD CINEMA</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 3. DOLBY ATMOS (MIDPOINT GAPS per spec)
export const DolbyAtmosSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick, selectedSeats = [], occupiedSeats = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // DOLBY ATMOS - Dynamic Rows
    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 13;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 13;
    }, [rowAssignments]);

    const cols = 20;
    const seatSize = 24;
    const seatGap = 8;
    const startY = 120;
    const centerX = 400;
    // MIDPOINT GAP: 9|GAP|9 for 18 seats
    const gapPosition = Math.floor(cols / 2);

    // Helper to get assigned category/color from rowAssignments
    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap) + (seatGap * 2);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const assignment = getRowAssignment(row);

        // Assignment Status
        const isAssigned = !!assignment;

        // VISIBILITY RULE: Public Users cannot see unassigned rows
        if (!adminMode && !isAssigned) continue;

        const currentZone = isAssigned ? assignment.categoryName : 'Unassigned';
        const zoneProps = isAssigned ? getProps(currentZone, '') : { occupied: false, selected: false, color: null };
        const forcedColor = assignment ? assignment.color : null;
        const catId = assignment?.id;

        // Dynamic layout & Gaps
        const baseCols = assignment ? (assignment.seatsPerRow || cols) : cols;
        const currentRowCols = (row === rows) ? baseCols + 1 : baseCols;
        const hasGap = currentRowCols > 10 && row !== rows;
        const gapSize = hasGap ? 20 : 0;
        const gapCol = Math.ceil(currentRowCols / 2);

        const rowWidth = currentRowCols * (seatSize + seatGap) + gapSize;
        const rowStartX = centerX - rowWidth / 2;

        // Render Row Labels (Left & Right)
        if (adminMode || isAssigned) {
            seats.push(
                <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-300", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
            seats.push(
                <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-300", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
        }

        for (let col = 1; col <= currentRowCols; col++) {
            // Gap Layout
            let xOffset = (col - 1) * (seatSize + seatGap);
            if (hasGap && col > gapCol) xOffset += gapSize;

            const x = rowStartX + xOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatNumber = `${rowLabel}${col}`;
            const fullSeatId = catId ? `${catId}::${seatNumber}` : seatNumber;
            const isSelected = selectedSeats && selectedSeats.includes(fullSeatId);

            seats.push(
                <g key={seatNumber}>
                    <rect key={seatNumber} x={x} y={y} width={seatSize} height={seatSize} rx="4"
                        className={cn("seat transition-all cursor-pointer stroke-slate-300",
                            !isAssigned && "fill-slate-50 stroke-slate-300 opacity-50 hover:opacity-100",
                            isAssigned && zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            isAssigned && !zoneProps.occupied && !isSelected && "hover:fill-blue-300",
                            isSelected && "fill-blue-600")}
                        style={{ fill: isSelected ? '#2563eb' : (isAssigned && !zoneProps.occupied ? forcedColor || '#e2e8f0' : undefined) }}
                        strokeWidth="1" data-seat={fullSeatId} data-category={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAssigned && !zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(fullSeatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }


    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 60 Q 400 25 650 60" stroke="#818cf8" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="90" textAnchor="middle" className="fill-indigo-300 text-sm font-bold tracking-[0.3em] uppercase">DOLBY ATMOS</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-indigo-400 text-xs font-bold tracking-[0.2em] uppercase">DOLBY ATMOS</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 4. 4DX Standard (GAPS EVERY 4 SEATS - STRICT per spec)
// 4. 4DX Standard (GAPS EVERY 4 SEATS - STRICT per spec)
export const FourDXStandardSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick, selectedSeats = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 10;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 10;
    }, [rowAssignments]);
    const cols = 16, seatSize = 26, seatGap = 10, startY = 120, centerX = 400;
    // STRICT 4DX: Only 4, 8, 12, 16 seats allowed. Gaps every 4 seats: 4|GAP|4|GAP|4|GAP|4
    const gapPositions = [4, 8, 12]; // Gaps after seats 4, 8, 12

    // Helper to get assigned category/color from rowAssignments
    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap) + (gapPositions.length * seatGap * 2);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const assignment = getRowAssignment(row);
        const isAssigned = !!assignment;

        if (!adminMode && !isAssigned) continue;

        const currentZone = isAssigned ? assignment.categoryName : 'Unassigned';
        const zoneProps = isAssigned ? getProps(currentZone, '') : { occupied: false, selected: false, color: null };
        const forcedColor = assignment ? assignment.color : null;
        const catId = assignment?.id;

        // Dynamic Centering for 4DX Standard
        const offsetPx = (row === rows) ? 0 : (gapPositions.length * seatGap * 2);
        const baseCols = assignment ? (assignment.seatsPerRow || cols) : cols;
        const currentRowCols = Math.min(baseCols, cols); // Cap at 16

        const rowWidth = currentRowCols * (seatSize + seatGap) - seatGap + offsetPx;
        const rowStartX = centerX - rowWidth / 2;

        // Render Row Labels
        if (adminMode || isAssigned) {
            seats.push(
                <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-300", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
            seats.push(
                <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                    className={cn("text-xs font-bold fill-slate-300", !isAssigned && "opacity-40")} textAnchor="middle">{rowLabel}</text>
            );
        }

        for (let col = 1; col <= currentRowCols; col++) {
            // Calculate gaps before this column
            const gapsBefore = row === rows ? 0 : gapPositions.filter(g => g < col).length;
            const aisleOffset = gapsBefore * (seatGap * 2);
            const x = rowStartX + (col - 1) * (seatSize + seatGap) + aisleOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatNumber = `${rowLabel}${col}`;
            const fullSeatId = catId ? `${catId}::${seatNumber}` : seatNumber;
            const isSelected = selectedSeats && selectedSeats.includes(fullSeatId);

            seats.push(
                <g key={seatNumber}>
                    <rect key={seatNumber} x={x} y={y} width={seatSize} height={seatSize} rx="4"
                        className={cn("seat transition-all cursor-pointer stroke-slate-300",
                            !isAssigned && "fill-slate-50 stroke-slate-300 opacity-50 hover:opacity-100",
                            isAssigned && zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            isAssigned && !zoneProps.occupied && !isSelected && "hover:fill-red-300",
                            isSelected && "fill-blue-600")}
                        style={{ fill: isSelected ? '#2563eb' : (isAssigned && !zoneProps.occupied ? forcedColor || '#f87171' : undefined) }}
                        strokeWidth="1" data-seat={fullSeatId} data-category={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAssigned && !zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(fullSeatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            {/* Main Screen */}
            <path d="M 150 60 Q 400 30 650 60" stroke="#f87171" strokeWidth="6" fill="none" className="drop-shadow-lg" />

            <text x="400" y="90" textAnchor="middle" className="fill-red-300 text-sm font-bold tracking-[0.3em] uppercase">4DX STANDARD</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-red-400 text-xs font-bold tracking-[0.2em] uppercase">STANDARD</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

export const FourDXMotionSeatsSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // 4DX STRICT: Change to 12 seats (allowed value: 4, 8, 12, 16)
    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 8;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 8;
    }, [rowAssignments]);
    const cols = 12, seatSize = 28, seatGap = 12, startY = 120, centerX = 400;
    // Gaps every 4 seats: 4|GAP|4|GAP|4
    const gapPositions = [4, 8];

    // Category names per spec
    const zoneMapping = {
        'Motion Premium': [1, 2, 3, 4],
        'Motion Standard': [5, 6, 7, 8]
    };
    const getZoneForRow = (row) => Object.entries(zoneMapping).find(([_, rows]) => rows.includes(row))?.[0] || 'Motion Standard';

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap) + (gapPositions.length * seatGap * 2);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);

        // Dynamic Centering for 4DX Motion
        const offsetPx = (row === rows) ? 0 : (gapPositions.length * seatGap * 2);
        const rowWidth = cols * (seatSize + seatGap) - seatGap + offsetPx;
        const rowStartX = centerX - rowWidth / 2;

        const currentZone = getZoneForRow(row);
        const zoneProps = getProps(currentZone, '');

        // Render Row Labels
        seats.push(
            <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        seats.push(
            <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= cols; col++) {
            const gapsBefore = row === rows ? 0 : gapPositions.filter(g => g < col).length;
            const aisleOffset = gapsBefore * (seatGap * 2);
            const x = rowStartX + (col - 1) * (seatSize + seatGap) + aisleOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatId = `${rowLabel}${col}`;

            seats.push(
                <g key={seatId}>
                    <rect key={seatId} x={x} y={y} width={seatSize} height={seatSize} rx="5"
                        className={cn("seat transition-all cursor-pointer stroke-slate-300",
                            zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            !zoneProps.occupied && !zoneProps.selected && "fill-slate-200 hover:fill-red-300",
                            zoneProps.selected && "fill-red-600",
                            zoneProps.color && !zoneProps.selected && `fill-[${zoneProps.color}]`)}
                        strokeWidth="1" data-seat={seatId} data-category={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(seatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 60 Q 400 30 650 60" stroke="#f87171" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="90" textAnchor="middle" className="fill-red-300 text-sm font-bold tracking-[0.3em] uppercase">4DX MOTION SEATS</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-red-400 text-xs font-bold tracking-[0.2em] uppercase">MOTION SEATS</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 5. SCREENX Standard
// 5. SCREENX Standard
export const ScreenXStandardSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // SCREENX - FIXED LAYOUT (Per Master Prompt)
    // Row 1: 8, Row 2: 10, Row 3: 12, Row 4: 14, Row 5: 16, Row 6: 18, Row 7-10: 20, Row 11: 22
    const fixedLayout = {
        1: 8, 2: 10, 3: 12, 4: 14, 5: 16, 6: 18,
        7: 20, 8: 20, 9: 20, 10: 20, 11: 23
    };
    const rows = 11;
    const maxCols = 23; // Row 11 has 23
    const seatSize = 22;
    const seatGap = 6;
    const startY = 120;
    const centerX = 400;

    // Helper to get assigned category/color from rowAssignments
    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];
    const totalWidth = maxCols * (seatSize + seatGap);

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const count = fixedLayout[row];

        // Add Center Aisle (Except last row)
        const gapSize = row === rows ? 0 : 15;
        const gapCol = Math.ceil(count / 2);

        const rowWidth = count * (seatSize + seatGap) + gapSize;
        const rowStartX = centerX - rowWidth / 2;

        const assignment = getRowAssignment(row);
        const isAssigned = !!assignment;
        const currentZone = isAssigned ? assignment.categoryName : (row <= 2 ? 'Front' : row >= 8 ? 'Back' : 'Standard');

        // VISIBILITY: Show all rows as it is fixed layout, or show ghost if not assigned category?
        // Prompt says "Admin cannot change seats", but "Admin can assign category".
        // Use standard visibility rule:
        if (!adminMode && !isAssigned) continue;

        const zoneProps = isAssigned ? getProps(assignment.categoryName, '') : { occupied: false, selected: false, color: null };
        const forcedColor = assignment ? assignment.color : null;

        // Render Row Labels
        seats.push(
            <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        seats.push(
            <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= count; col++) {
            let xOffset = (col - 1) * (seatSize + seatGap);
            if (col > gapCol) xOffset += gapSize;

            const x = rowStartX + xOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatId = `${rowLabel}${col}`;

            seats.push(
                <g key={seatId}>
                    <rect key={seatId} x={x} y={y} width={seatSize} height={seatSize} rx="3"
                        className={cn("seat transition-all cursor-pointer stroke-slate-400",
                            !isAssigned && "fill-slate-50 stroke-slate-300 opacity-50 hover:opacity-100 border-dashed",
                            isAssigned && zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            isAssigned && !zoneProps.occupied && !zoneProps.selected && "fill-slate-200 hover:fill-slate-400",
                            isAssigned && zoneProps.selected && "fill-slate-700",
                            isAssigned && !zoneProps.selected && !zoneProps.occupied && `fill-[${forcedColor}]` // Fix color application
                        )}
                        style={{ fill: isAssigned && !zoneProps.selected && !zoneProps.occupied ? forcedColor : undefined }}
                        strokeWidth="1" data-seat={seatId}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAssigned && !zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(seatId);
                                else if (onZoneClick) onZoneClick(assignment.categoryName);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            {/* ScreenX Immersive Wrap-Around Screens */}
            {/* Center Screen - Slightly Curved */}
            <path
                d="M 200 50 Q 400 20 600 50"
                stroke="#fafafa"
                strokeWidth="6"
                fill="none"
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />

            {/* Left Wall Screen - Angles out to surround audience */}
            <path
                d="M 200 50 L 40 250"
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="none"
                className="opacity-80 drop-shadow-md"
            />

            {/* Right Wall Screen - Angles out to surround audience */}
            <path
                d="M 600 50 L 760 250"
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="none"
                className="opacity-80 drop-shadow-md"
            />

            {/* ScreenX Logo / Branding */}
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-lg font-black tracking-[0.5em] uppercase drop-shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                SCREEN<tspan className="fill-blue-500">X</tspan>
            </text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">SCREENX</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 6. SCREENX - Side Wall Immersion (Same Fixed Layout)
export const ScreenXSideWallSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [] }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // SCREENX - FIXED LAYOUT (Same as Standard)
    const fixedLayout = {
        1: 8, 2: 10, 3: 12, 4: 14, 5: 16, 6: 18,
        7: 20, 8: 20, 9: 20, 10: 20, 11: 23
    };
    const rows = 11;
    const maxCols = 23;
    const seatSize = 22; // Match Standard
    const seatGap = 6;
    const startY = 120;
    const centerX = 400;

    // Helper to get assigned category/color from rowAssignments
    const getRowAssignment = (row) => rowAssignments.find(a => a.rows.includes(row));

    const seats = [];
    const totalWidth = maxCols * (seatSize + seatGap);

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const count = fixedLayout[row];

        // Add Center Aisle (Except last row)
        const gapSize = row === rows ? 0 : 15;
        const gapCol = Math.ceil(count / 2);

        const rowWidth = count * (seatSize + seatGap) + gapSize;
        const rowStartX = centerX - rowWidth / 2;

        const assignment = getRowAssignment(row);
        const isAssigned = !!assignment;
        const currentZone = isAssigned ? assignment.categoryName : (row <= 2 ? 'Front' : row >= 8 ? 'Back' : 'Standard');

        // VISIBILITY: Show all rows as it is fixed layout, or show ghost if not assigned category?
        // Prompt says "Admin cannot change seats", but "Admin can assign category".
        if (!adminMode && !isAssigned) continue;

        const zoneProps = isAssigned ? getProps(assignment.categoryName, '') : { occupied: false, selected: false, color: null };
        const forcedColor = assignment ? assignment.color : null;

        // Render Row Labels
        seats.push(
            <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        seats.push(
            <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= count; col++) {
            let xOffset = (col - 1) * (seatSize + seatGap);
            if (col > gapCol) xOffset += gapSize;

            const x = rowStartX + xOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatId = `${rowLabel}${col}`;

            seats.push(
                <g key={seatId}>
                    <rect key={seatId} x={x} y={y} width={seatSize} height={seatSize} rx="3"
                        className={cn("seat transition-all cursor-pointer stroke-slate-400",
                            !isAssigned && "fill-slate-50 stroke-slate-300 opacity-50 hover:opacity-100 border-dashed",
                            isAssigned && zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            isAssigned && !zoneProps.occupied && !zoneProps.selected && "fill-slate-200 hover:fill-slate-400",
                            isAssigned && zoneProps.selected && "fill-slate-700",
                            isAssigned && !zoneProps.selected && !zoneProps.occupied && `fill-[${forcedColor}]`
                        )}
                        style={{ fill: isAssigned && !zoneProps.selected && !zoneProps.occupied ? forcedColor : undefined }}
                        strokeWidth="1" data-seat={seatId}
                        onClick={(e) => { e.stopPropagation(); if (isAssigned && !zoneProps.occupied && onZoneClick) onZoneClick(assignment.categoryName); }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            {/* ScreenX Immersive Wrap-Around Screens */}
            {/* Center Screen - Slightly Curved */}
            <path
                d="M 200 50 Q 400 20 600 50"
                stroke="#fafafa"
                strokeWidth="6"
                fill="none"
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />

            {/* Left Wall Screen - Angles out to surround audience */}
            <path
                d="M 200 50 L 40 250"
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="none"
                className="opacity-80 drop-shadow-md"
            />

            {/* Right Wall Screen - Angles out to surround audience */}
            <path
                d="M 600 50 L 760 250"
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="none"
                className="opacity-80 drop-shadow-md"
            />

            {/* ScreenX Logo / Branding */}
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-lg font-black tracking-[0.5em] uppercase drop-shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                SCREEN<tspan className="fill-blue-500">X</tspan>
            </text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">SCREENX IMMERSION</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #cbd5e1; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 6. DRIVE-IN Car Grid (Parking Spots)
export const DriveInCarGridSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const rows = 6, cols = 10, spotWidth = 35, spotHeight = 25, spotGap = 8, startY = 80, centerX = 400;
    const zoneMapping = { zone_parking_front: [1, 2], zone_parking_middle: [3, 4], zone_parking_rear: [5, 6] };
    const getZoneForRow = (row) => Object.entries(zoneMapping).find(([_, rows]) => rows.includes(row))?.[0] || 'zone_parking_general';

    const spots = [];
    const totalWidth = cols * (spotWidth + spotGap);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);
        const currentZone = getZoneForRow(row);
        const zoneProps = getProps(currentZone, '');

        // Render Row Labels
        spots.push(
            <text key={`label-L-${row}`} x={gridStartX - 30} y={startY + (row - 1) * (spotHeight + spotGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        spots.push(
            <text key={`label-R-${row}`} x={gridStartX + totalWidth + 30} y={startY + (row - 1) * (spotHeight + spotGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= cols; col++) {
            const x = gridStartX + (col - 1) * (spotWidth + spotGap);
            const y = startY + (row - 1) * (spotHeight + spotGap);
            const spotId = `${rowLabel}${col}`;

            spots.push(
                <rect key={spotId} x={x} y={y} width={spotWidth} height={spotHeight} rx="2"
                    className={cn("parking-spot transition-all cursor-pointer stroke-slate-600",
                        zoneProps.occupied && "opacity-30 cursor-not-allowed",
                        !zoneProps.occupied && !zoneProps.selected && "fill-slate-700 hover:fill-slate-500",
                        zoneProps.selected && "fill-emerald-600",
                        zoneProps.color && !zoneProps.selected && `fill-[${zoneProps.color}]`)}
                    strokeWidth="2" strokeDasharray="3,3" data-spot={spotId} data-zone={currentZone}
                    onClick={(e) => { e.stopPropagation(); if (!zoneProps.occupied && onZoneClick) onZoneClick(currentZone); }} />
            );
        }
    }

    const viewBoxHeight = startY + rows * (spotHeight + spotGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <rect x="250" y="10" width="300" height="40" fill="#f8fafc" rx="4" />
            <text x="400" y="38" textAnchor="middle" className="fill-slate-900 text-base font-bold tracking-wider">DRIVE-IN SCREEN</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">DRIVE-IN</text>
            <g id="parking-spots">{spots}</g>
            <style>{`.parking-spot { stroke: #475569; } .parking-spot:hover:not(.opacity-30) { filter: brightness(1.2); }`}</style>
        </SvgWrapper>
    );
};

export const DriveInArenaParkingSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // Circular parking layout
    const centerX = 400, centerY = 250;
    const innerRadius = 80, outerRadius = 160;
    const innerSpots = 16, outerSpots = 24;

    const spots = [];
    const innerZoneProps = getProps('zone_parking_front', '');
    const outerZoneProps = getProps('zone_parking_rear', '');

    // Inner ring
    for (let i = 0; i < innerSpots; i++) {
        const angle = (i / innerSpots) * 2 * Math.PI;
        const x = centerX + innerRadius * Math.cos(angle) - 15;
        const y = centerY + innerRadius * Math.sin(angle) - 10;
        const rotation = (angle * 180 / Math.PI) + 90;

        spots.push(
            <rect key={`inner-${i}`} x={x} y={y} width="30" height="20" rx="2"
                transform={`rotate(${rotation} ${x + 15} ${y + 10})`}
                className={cn("parking-spot transition-all cursor-pointer",
                    innerZoneProps.occupied && "opacity-30 cursor-not-allowed",
                    !innerZoneProps.occupied && !innerZoneProps.selected && "fill-slate-700 hover:fill-slate-500",
                    innerZoneProps.selected && "fill-emerald-600",
                    innerZoneProps.color && !innerZoneProps.selected && `fill-[${innerZoneProps.color}]`)}
                stroke="#475569" strokeWidth="2" strokeDasharray="3,3"
                data-spot={`I${i + 1}`} data-zone="zone_parking_front"
                onClick={(e) => { e.stopPropagation(); if (!innerZoneProps.occupied && onZoneClick) onZoneClick('zone_parking_front'); }} />
        );
    }

    // Outer ring
    for (let i = 0; i < outerSpots; i++) {
        const angle = (i / outerSpots) * 2 * Math.PI;
        const x = centerX + outerRadius * Math.cos(angle) - 15;
        const y = centerY + outerRadius * Math.sin(angle) - 10;
        const rotation = (angle * 180 / Math.PI) + 90;

        spots.push(
            <rect key={`outer-${i}`} x={x} y={y} width="30" height="20" rx="2"
                transform={`rotate(${rotation} ${x + 15} ${y + 10})`}
                className={cn("parking-spot transition-all cursor-pointer",
                    outerZoneProps.occupied && "opacity-30 cursor-not-allowed",
                    !outerZoneProps.occupied && !outerZoneProps.selected && "fill-slate-700 hover:fill-slate-500",
                    outerZoneProps.selected && "fill-emerald-600",
                    outerZoneProps.color && !outerZoneProps.selected && `fill-[${outerZoneProps.color}]`)}
                stroke="#475569" strokeWidth="2" strokeDasharray="3,3"
                data-spot={`O${i + 1}`} data-zone="zone_parking_rear"
                onClick={(e) => { e.stopPropagation(); if (!outerZoneProps.occupied && onZoneClick) onZoneClick('zone_parking_rear'); }} />
        );
    }

    return (
        <SvgWrapper viewBox="0 0 800 500" className="bg-slate-900">
            <rect x="300" y="10" width="200" height="40" fill="#f8fafc" rx="4" />
            <text x="400" y="38" textAnchor="middle" className="fill-slate-900 text-base font-bold tracking-wider">ARENA SCREEN</text>
            <g id="parking-spots">{spots}</g>
            <style>{`.parking-spot { stroke: #475569; } .parking-spot:hover:not(.opacity-30) { filter: brightness(1.2); }`}</style>
        </SvgWrapper>
    );
};

// 7. PREMIUM LOUNGE - Luxury Recliners
export const PremiumLoungeLuxuryReclinersSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 8;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 8;
    }, [rowAssignments]);
    const cols = 12, seatSize = 32, seatGap = 16, startY = 120, centerX = 400, aisleAfterCol = 6;
    const zoneMapping = { zone_recliner_premium: [1, 2, 3, 4], zone_recliner_standard: [5, 6, 7, 8] };
    const getZoneForRow = (row) => Object.entries(zoneMapping).find(([_, rows]) => rows.includes(row))?.[0] || 'zone_general';

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);

        // Dynamic Centering & Capacity (Add 1 seat to last row to fill gap)
        const currentRowCols = row === rows ? cols + 1 : cols;
        const offsetTotal = (row !== rows) ? seatGap * 3 : 0; // Gap is seatGap*3
        const rowWidth = currentRowCols * (seatSize + seatGap) - seatGap + offsetTotal;
        const rowStartX = centerX - rowWidth / 2;

        const currentZone = getZoneForRow(row);
        const zoneProps = getProps(currentZone, '');

        // Render Row Labels
        seats.push(
            <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        seats.push(
            <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= currentRowCols; col++) {
            const aisleOffset = (col > aisleAfterCol && row !== rows) ? seatGap * 3 : 0;
            const x = rowStartX + (col - 1) * (seatSize + seatGap) + aisleOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatId = `${rowLabel}${col}`;

            seats.push(
                <g key={seatId}>
                    <rect key={seatId} x={x} y={y} width={seatSize} height={seatSize} rx="8"
                        className={cn("seat transition-all cursor-pointer stroke-amber-700",
                            zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            !zoneProps.occupied && !zoneProps.selected && "fill-amber-100 hover:fill-amber-300",
                            zoneProps.selected && "fill-amber-600",
                            zoneProps.color && !zoneProps.selected && `fill-[${zoneProps.color}]`)}
                        strokeWidth="2" data-seat={seatId} data-zone={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(seatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 60 Q 400 30 650 60" stroke="#e2e8f0" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-sm font-bold tracking-[0.3em] uppercase">LUXURY LOUNGE</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">PREMIUM LOUNGE</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #b45309; stroke-width: 2; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

export const PremiumLoungeVipPodsSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 4;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 4;
    }, [rowAssignments]);
    const cols = 6, podSize = 60, podGap = 30, startY = 120, centerX = 400, aisleAfterCol = 3;
    const zoneProps = getProps('zone_vip_pod', '');

    const pods = [];
    const totalWidth = cols * (podSize + podGap);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);

        // Render Row Labels
        pods.push(
            <text key={`label-L-${row}`} x={gridStartX - 30} y={startY + (row - 1) * (podSize + podGap) + 30}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        pods.push(
            <text key={`label-R-${row}`} x={gridStartX + totalWidth + 30} y={startY + (row - 1) * (podSize + podGap) + 30}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= cols; col++) {
            const aisleOffset = col > aisleAfterCol ? podGap * 2 : 0;
            const x = gridStartX + (col - 1) * (podSize + podGap) + aisleOffset;
            const y = startY + (row - 1) * (podSize + podGap);
            const podId = `${rowLabel}${col}`;

            pods.push(
                <g key={podId}>
                    <rect x={x} y={y} width={podSize} height={podSize} rx="12"
                        className={cn("vip-pod transition-all cursor-pointer stroke-purple-700",
                            zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            !zoneProps.occupied && !zoneProps.selected && "fill-purple-100 hover:fill-purple-300",
                            zoneProps.selected && "fill-purple-600",
                            zoneProps.color && !zoneProps.selected && `fill-[${zoneProps.color}]`)}
                        strokeWidth="3" data-pod={podId} data-zone="zone_vip_pod"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(podId);
                                else if (onZoneClick) onZoneClick('zone_vip_pod');
                            }
                        }} />
                    <text x={x + podSize / 2} y={y + podSize / 2} textAnchor="middle" dominantBaseline="middle"
                        className="fill-purple-900 text-xs font-bold pointer-events-none">{podId}</text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (podSize + podGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 60 Q 400 30 650 60" stroke="#e2e8f0" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="90" textAnchor="middle" className="fill-slate-200 text-sm font-bold tracking-[0.3em] uppercase">VIP PODS</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">VIP PODS</text>
            <g id="pods">{pods}</g>
            <style>{`.vip-pod { stroke: #6b21a8; stroke-width: 3; } .vip-pod:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );
};

// 8. OUTDOOR CINEMA - Open Air
export const OutdoorCinemaOpenAirSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false, rowAssignments = [], onSeatClick }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const rows = React.useMemo(() => {
        if (!rowAssignments || rowAssignments.length === 0) return 10;
        const max = Math.max(...rowAssignments.flatMap(a => a.rows));
        return max > 0 ? max : 10;
    }, [rowAssignments]);
    const cols = 16, seatSize = 24, seatGap = 10, startY = 120, centerX = 400, aisleAfterCol = 8;
    const zoneMapping = { zone_premium: [1, 2, 3], zone_general: [4, 5, 6, 7], zone_back: [8, 9, 10] };
    const getZoneForRow = (row) => Object.entries(zoneMapping).find(([_, rows]) => rows.includes(row))?.[0] || 'zone_general';

    const seats = [];
    const totalWidth = cols * (seatSize + seatGap);
    const gridStartX = centerX - totalWidth / 2;

    for (let row = 1; row <= rows; row++) {
        const rowLabel = String.fromCharCode(64 + row);

        // Dynamic Centering for Outdoor
        const currentRowCols = row === rows ? cols + 1 : cols;
        const offsetTotal = (row !== rows) ? seatGap * 2 : 0; // Outdoor has 1 gap
        const rowWidth = currentRowCols * (seatSize + seatGap) - seatGap + offsetTotal;
        const rowStartX = centerX - rowWidth / 2;

        const currentZone = getZoneForRow(row);
        const zoneProps = getProps(currentZone, '');

        // Render Row Labels
        seats.push(
            <text key={`label-L-${row}`} x={rowStartX - 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );
        seats.push(
            <text key={`label-R-${row}`} x={rowStartX + rowWidth + 30} y={startY + (row - 1) * (seatSize + seatGap) + 15}
                className="text-xs font-bold fill-slate-300 opacity-60" textAnchor="middle">{rowLabel}</text>
        );

        for (let col = 1; col <= currentRowCols; col++) {
            const aisleOffset = (col > aisleAfterCol && row !== rows) ? seatGap * 2 : 0;
            const x = rowStartX + (col - 1) * (seatSize + seatGap) + aisleOffset;
            const y = startY + (row - 1) * (seatSize + seatGap);
            const seatId = `${rowLabel}${col}`;

            seats.push(
                <g key={seatId}>
                    <rect key={seatId} x={x} y={y} width={seatSize} height={seatSize} rx="4"
                        className={cn("seat transition-all cursor-pointer stroke-emerald-700",
                            zoneProps.occupied && "opacity-30 cursor-not-allowed",
                            !zoneProps.occupied && !zoneProps.selected && "fill-emerald-100 hover:fill-emerald-300",
                            zoneProps.selected && "fill-emerald-600",
                            zoneProps.color && !zoneProps.selected && `fill-[${zoneProps.color}]`)}
                        strokeWidth="1" data-seat={seatId} data-zone={currentZone}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!zoneProps.occupied) {
                                if (onSeatClick) onSeatClick(seatId);
                                else if (onZoneClick) onZoneClick(currentZone);
                            }
                        }} />
                    <text x={x + seatSize / 2} y={y + seatSize / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        className="pointer-events-none text-[8px] font-bold fill-slate-900 opacity-80">
                        {col}
                    </text>
                </g>
            );
        }
    }

    const viewBoxHeight = startY + rows * (seatSize + seatGap) + 100;

    return (
        <SvgWrapper viewBox={`0 0 800 ${viewBoxHeight}`} className="bg-slate-900">
            <path d="M 150 30 Q 400 0 650 30" stroke="#34d399" strokeWidth="6" fill="none" className="drop-shadow-lg" />
            <text x="400" y="60" textAnchor="middle" className="fill-emerald-400 text-sm font-bold tracking-[0.3em] uppercase">OPEN AIR SCREEN</text>
            <text x="400" y={viewBoxHeight - 30} textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.2em] uppercase">OUTDOOR CINEMA</text>
            <g id="seats">{seats}</g>
            <style>{`.seat { stroke: #10b981; stroke-width: 1; } .seat:hover:not(.opacity-30) { filter: brightness(1.1); }`}</style>
        </SvgWrapper>
    );

};

/* -------------------------------------------------------------------------- */
/*                                  CONCERT                                   */
/* -------------------------------------------------------------------------- */

// 3. THRUST STAGE
export const ThrustStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-neutral-900">
            {/* Stage Runway */}
            <path d="M 350 50 L 450 50 L 450 350 L 350 350 Z" fill="#262626" stroke="#525252" strokeWidth="2" />
            <rect x="250" y="20" width="300" height="80" fill="#262626" />
            <text x="400" y="60" textAnchor="middle" className="fill-white font-bold tracking-widest">STAGE</text>

            {/* Audience wrap around */}
            <Zone {...getProps('zone_left', 'Left Wing')} x={50} y={150} width={250} height={200} />
            <Zone {...getProps('zone_right', 'Right Wing')} x={500} y={150} width={250} height={200} />
            <Zone {...getProps('zone_center', 'The Pit')} x={350} y={370} width={100} height={150} />
            <Zone {...getProps('zone_rear', 'Rear Stall')} x={150} y={450} width={500} height={100} />
        </SvgWrapper>
    );
};

// 4. CLUB / STANDING ONLY
export const ClubStandingSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-black">
            {/* DJ Booth */}
            <rect x="300" y="20" width="200" height="80" fill="#db2777" />
            <text x="400" y="60" textAnchor="middle" className="fill-white font-bold">DJ / ARTIST</text>

            {/* Main Floor */}
            <Zone {...getProps('main_floor', 'Main Floor (GA)')} x={100} y={150} width={600} height={300} />

            {/* VIP Decks */}
            <Zone {...getProps('vip_deck_left', 'VIP Left')} x={20} y={200} width={60} height={200} />
            <Zone {...getProps('vip_deck_right', 'VIP Right')} x={720} y={200} width={60} height={200} />

            {/* Bar */}
            <rect x="200" y="500" width="400" height="50" fill="#3f3f46" />
            <text x="400" y="530" textAnchor="middle" className="fill-white text-xs tracking-widest">BAR AREA</text>
        </SvgWrapper>
    );
};

// 4b. CONCERT - END STAGE (Traditional Arena)
export const ConcertEndStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper>
            <rect x="250" y="20" width="300" height="80" fill="#1E293B" rx="4" />
            <text x="400" y="60" textAnchor="middle" className="fill-white font-bold text-xl tracking-[0.5em]">STAGE</text>
            <Zone {...getProps('pit', 'Golden Pit')} x={300} y={110} width={200} height={80} />
            <Zone {...getProps('floor_ga', 'Floor GA')} x={200} y={200} width={400} height={120} />
            <Zone {...getProps('lower_100', 'Lower 100s')} x={100} y={350} width={600} height={80} />
            <Zone {...getProps('lower_200', 'Lower 200s')} x={50} y={440} width={700} height={60} />
            <Zone {...getProps('upper_400', 'Upper 400s')} x={50} y={510} width={700} height={40} />
            <Zone {...getProps('lower_side_l', 'Side L')} x={20} y={150} width={60} height={200} />
            <Zone {...getProps('lower_side_r', 'Side R')} x={720} y={150} width={60} height={200} />
        </SvgWrapper>
    );
};

// 4c. CONCERT - CENTER STAGE (360 Degree)
export const ConcertCenterStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 800" className="bg-slate-900 border-slate-800">
            <circle cx={400} cy={400} r={60} fill="#1E293B" stroke="#334155" strokeWidth="2" />
            <text x={400} y={400} textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-lg">STAGE</text>
            <Zone {...getProps('floor_section_a', 'Floor A')} x={300} y={180} width={200} height={100} />
            <Zone {...getProps('floor_section_b', 'Floor B')} x={520} y={300} width={100} height={200} />
            <Zone {...getProps('floor_section_c', 'Floor C')} x={300} y={520} width={200} height={100} />
            <Zone {...getProps('floor_section_d', 'Floor D')} x={180} y={300} width={100} height={200} />
            <Zone {...getProps('lower_bowl_100s', 'Lower Bowl')} x={100} y={100} width={600} height={50} />
            <Zone {...getProps('lower_bowl_100s_bottom', 'Lower Bowl S')} x={100} y={650} width={600} height={50} />
            <Zone {...getProps('lower_bowl_200s', 'Lower Bowl E')} x={700} y={150} width={50} height={500} />
            <Zone {...getProps('lower_bowl_200s_west', 'Lower Bowl W')} x={50} y={150} width={50} height={500} />
            <Zone {...getProps('upper_bowl_300s', 'Upper Bowl')} x={20} y={20} width={150} height={60} />
            <Zone {...getProps('upper_bowl_300s_r', 'Upper Bowl')} x={630} y={20} width={150} height={60} />
        </SvgWrapper>
    );
};

// 4d. CONCERT - OUTDOOR MAIN STAGE (HIGH DENSITY)
export const ConcertOutdoorMainStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 1000 800" className="bg-neutral-950">
            {/* LARGE CENTER STAGE */}
            <rect x="350" y="20" width="300" height="120" fill="#1e293b" rx="8" />
            <path d="M 350 140 Q 500 180 650 140" fill="none" stroke="#64748b" strokeWidth="2" />
            <text x="500" y="90" textAnchor="middle" className="fill-white font-black text-4xl tracking-[0.2em]">STAGE</text>

            {/* CENTRAL BLOCKS (C1 - C4) */}
            <Zone {...getProps('c1', 'C1 - PLATINUM')} x={340} y={190} width={320} height={100} />
            <Zone {...getProps('c2', 'C2 - GOLD')} x={330} y={310} width={340} height={120} />
            <Zone {...getProps('c3', 'C3 - SILVER')} x={320} y={450} width={360} height={140} />
            <Zone {...getProps('c4', 'C4 - BRONZE')} x={310} y={610} width={380} height={150} />

            {/* LEFT BLOCKS (L1 - L4) - Angled layout */}
            <g transform="rotate(-15, 300, 200)">
                <Zone {...getProps('l1', 'L1')} x={140} y={150} width={150} height={80} />
            </g>
            <g transform="rotate(-10, 250, 350)">
                <Zone {...getProps('l2', 'L2')} x={40} y={280} width={220} height={100} />
            </g>
            <g transform="rotate(-5, 200, 500)">
                <Zone {...getProps('l3', 'L3')} x={20} y={420} width={240} height={120} />
            </g>
            <g transform="rotate(-2, 180, 650)">
                <Zone {...getProps('l4', 'L4')} x={10} y={580} width={260} height={140} />
            </g>

            {/* RIGHT BLOCKS (R1 - R4) - Angled layout */}
            <g transform="rotate(15, 700, 200)">
                <Zone {...getProps('r1', 'R1')} x={710} y={150} width={150} height={80} />
            </g>
            <g transform="rotate(10, 750, 350)">
                <Zone {...getProps('r2', 'R2')} x={740} y={280} width={220} height={100} />
            </g>
            <g transform="rotate(5, 800, 500)">
                <Zone {...getProps('r3', 'R3')} x={740} y={420} width={240} height={120} />
            </g>
            <g transform="rotate(2, 820, 650)">
                <Zone {...getProps('r4', 'R4')} x={730} y={580} width={260} height={140} />
            </g>

            {/* BOUNDARY / BACKGROUND ART */}
            <path d="M 50 100 L 300 100 M 700 100 L 950 100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
        </SvgWrapper>
    );
};

// 4e. CONCERT - INDOOR STADIUM END STAGE (FAN LAYOUT)
export const ConcertIndoorStadiumEndStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    const createSector = (cx, cy, rIn, rOut, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + rIn * Math.cos(startAngle * rad);
        const y1 = cy + rIn * Math.sin(startAngle * rad);
        const x2 = cx + rOut * Math.cos(startAngle * rad);
        const y2 = cy + rOut * Math.sin(startAngle * rad);
        const x3 = cx + rOut * Math.cos(endAngle * rad);
        const y3 = cy + rOut * Math.sin(endAngle * rad);
        const x4 = cx + rIn * Math.cos(endAngle * rad);
        const y4 = cy + rIn * Math.sin(endAngle * rad);
        const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
        return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1} ${y1} Z`;
    };

    const getCenterPos = (cx, cy, r, angle) => {
        const rad = Math.PI / 180;
        return {
            x: cx + r * Math.cos(angle * rad),
            y: cy + r * Math.sin(angle * rad)
        };
    };

    const cx = 400, cy = 600;

    // ANGLES: 200 (Left) to 340 (Right) - Fan opening upwards
    const innerTiers = [
        { id: 'block_g', label: 'G', start: 200, end: 220 },
        { id: 'block_f', label: 'F', start: 220, end: 240 },
        { id: 'block_e', label: 'E', start: 240, end: 260 },
        { id: 'block_d', label: 'D', start: 260, end: 280 },
        { id: 'block_c', label: 'C', start: 280, end: 300 },
        { id: 'block_b', label: 'B', start: 300, end: 320 },
        { id: 'block_a', label: 'A', start: 320, end: 340 },
    ];

    const outerTiers = [
        { id: 'block_p', label: 'P', start: 200, end: 220 },
        { id: 'block_n', label: 'N', start: 220, end: 240 },
        { id: 'block_m', label: 'M', start: 240, end: 260 },
        { id: 'block_l', label: 'L', start: 260, end: 280 },
        { id: 'block_k', label: 'K', start: 280, end: 300 },
        { id: 'block_j', label: 'J', start: 300, end: 320 },
        { id: 'block_h', label: 'H', start: 320, end: 340 },
    ];

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-neutral-950">
            {/* STAGE */}
            <rect x="325" y="550" width="150" height="40" fill="#262626" rx="2" />
            <text x="400" y="575" textAnchor="middle" className="fill-white font-bold text-xs tracking-widest">STAGE</text>

            {/* STANDING PIT */}
            <Zone {...getProps('standing', 'STANDING')}
                path={createSector(cx, cy, 80, 260, 205, 335)} />
            <text x="400" y="440" textAnchor="middle" className="fill-white font-bold text-lg tracking-widest pointer-events-none">STANDING</text>

            {/* INNER TIERS (Red-ish) */}
            {innerTiers.map(t => {
                const pos = getCenterPos(cx, cy, 330, (t.start + t.end) / 2);
                return (
                    <g key={t.id}>
                        <Zone {...getProps(t.id, t.label)}
                            path={createSector(cx, cy, 280, 380, t.start, t.end)}
                        />
                        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                            className="fill-white font-bold text-xs pointer-events-none">{t.label}</text>
                    </g>
                );
            })}

            {/* OUTER TIERS (Yellow-ish) */}
            {outerTiers.map(t => {
                const pos = getCenterPos(cx, cy, 470, (t.start + t.end) / 2);
                return (
                    <g key={t.id}>
                        <Zone {...getProps(t.id, t.label)}
                            path={createSector(cx, cy, 400, 540, t.start, t.end)}
                        />
                        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                            className="fill-white font-bold text-xs pointer-events-none">{t.label}</text>
                    </g>
                );
            })}
        </SvgWrapper>
    );
};

// 4f. CONCERT - INDOOR STADIUM CENTER STAGE (BOWL LAYOUT)
export const ConcertIndoorStadiumCenterStageSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // Optimized Sector Path Math
    const createSector = (cx, cy, rIn, rOut, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + rIn * Math.cos(startAngle * rad);
        const y1 = cy + rIn * Math.sin(startAngle * rad);
        const x2 = cx + rOut * Math.cos(startAngle * rad);
        const y2 = cy + rOut * Math.sin(startAngle * rad);
        const x3 = cx + rOut * Math.cos(endAngle * rad);
        const y3 = cy + rOut * Math.sin(endAngle * rad);
        const x4 = cx + rIn * Math.cos(endAngle * rad);
        const y4 = cy + rIn * Math.sin(endAngle * rad);
        return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 0 0 ${x1} ${y1} Z`;
    };

    const cx = 400, cy = 400;

    // 12 Segments for higher density
    const segmentLabels = ['EAST', 'ESE', 'SSE', 'SOUTH', 'SSW', 'WSW', 'WEST', 'WNW', 'NNW', 'NORTH', 'NNE', 'ENE'];
    const segments = Array.from({ length: 12 }, (_, i) => ({
        id: ['e', 'ese', 'sse', 's', 'ssw', 'wsw', 'w', 'wnw', 'nnw', 'n', 'nne', 'ene'][i],
        label: segmentLabels[i],
        start: i * 30 - 15,
        end: (i + 1) * 30 - 15
    }));

    // Entry Points (A-L)
    const entries = segments.map((s, i) => ({
        label: `ENTRY ${String.fromCharCode(65 + i)}`,
        angle: (s.start + s.end) / 2,
        r: 375
    }));

    return (
        <SvgWrapper viewBox="0 0 800 800" className="bg-neutral-950">
            {/* STADIUM RIM */}
            <circle cx={cx} cy={cy} r={390} fill="none" stroke="#e2e8f0" strokeWidth="2" />

            {/* STADIUM BOWL TIERS */}
            {segments.map(s => (
                <g key={s.id}>
                    {/* Lower Tier (100 Level) */}
                    <Zone {...getProps(`lower_${s.id}`, `100 ${s.label}`)}
                        path={createSector(cx, cy, 210, 260, s.start, s.end)} />
                    {/* Club Tier (200 Level) */}
                    <Zone {...getProps(`club_${s.id}`, `200 ${s.label}`)}
                        path={createSector(cx, cy, 265, 305, s.start, s.end)} />
                    {/* Upper Tier (300 Level) */}
                    <Zone {...getProps(`upper_${s.id}`, `300 ${s.label}`)}
                        path={createSector(cx, cy, 310, 360, s.start, s.end)} />
                </g>
            ))}

            {/* ENTRY LABELS ( mimicking Ticketmaster/Mapaplan look) */}
            {entries.map((e, i) => {
                const x = cx + e.r * Math.cos(e.angle * Math.PI / 180);
                const y = cy + e.r * Math.sin(e.angle * Math.PI / 180);
                return (
                    <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                        transform={`rotate(${e.angle + 90}, ${x}, ${y})`}
                        className="fill-slate-400 text-[6px] font-bold tracking-tighter">
                        {e.label}
                    </text>
                );
            })}

            {/* CENTER FIELD AREA */}
            <rect x="260" y="260" width="280" height="280" rx="40" fill="#0f172a" stroke="#334155" strokeWidth="1" />

            {/* FLOOR BLOCKS (Surrounding the stage) */}
            <Zone {...getProps('field_1', 'F1')} x={275} y={275} width={75} height={75} />
            <Zone {...getProps('field_2', 'F2')} x={362.5} y={275} width={75} height={75} />
            <Zone {...getProps('field_3', 'F3')} x={450} y={275} width={75} height={75} />

            <Zone {...getProps('field_4', 'F4')} x={275} y={362.5} width={75} height={75} />
            {/* Center Stage Box */}
            <g>
                <rect x="362.5" y="362.5" width="75" height="75" fill="#1e293b" rx="4" />
                <text x="400" y="400" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-[8px] tracking-widest">STAGE</text>
            </g>
            <Zone {...getProps('field_6', 'F6')} x={450} y={362.5} width={75} height={75} />

            <Zone {...getProps('field_7', 'F7')} x={275} y={450} width={75} height={75} />
            <Zone {...getProps('field_8', 'F8')} x={362.5} y={450} width={75} height={75} />
            <Zone {...getProps('field_9', 'F9')} x={450} y={450} width={75} height={75} />

            {/* Compass / Orientation markings */}
            <text x="400" y="30" textAnchor="middle" className="fill-slate-300 font-black text-xl opacity-20">NORTH</text>
        </SvgWrapper>
    );
};

/* -------------------------------------------------------------------------- */
/*                                  STADIUM                                   */
/* -------------------------------------------------------------------------- */

// 5. ATHLETICS / OLYMPIC STADIUM (Fixing the messy look)
export const AthleticsStadiumSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Track & Field Center */}
            {/* Track (Brown/Clay) */}
            <rect x="200" y="150" width="400" height="300" rx="150" ry="150" fill="#92400e" stroke="#78350f" strokeWidth="2" />
            {/* Field (Green) */}
            <rect x="240" y="190" width="320" height="220" rx="110" ry="110" fill="#15803d" />

            {/* Lanes Markings */}
            <rect x="210" y="160" width="380" height="280" rx="140" ry="140" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
            <rect x="220" y="170" width="360" height="260" rx="130" ry="130" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />

            {/* Stands - Continuous Ring Simulation via Sectors that align perfectly */}
            {/* North (Top) */}
            <Zone {...getProps('north_stand', 'North Stand')}
                path="M 200 130 L 600 130 A 1 1 0 0 0 200 130 L 200 50 L 600 50" // Simplified top block
                x={200} y={20} width={400} height={100}
            />

            {/* Use Rects for cleaner look on sides, Arcs for curves */}

            {/* Top Stand */}
            <Zone {...getProps('stand_north', 'North')} x={200} y={20} width={400} height={100} />

            {/* Bottom Stand */}
            <Zone {...getProps('stand_south', 'South')} x={200} y={480} width={400} height={100} />

            {/* West Curve Stand (Left) */}
            <Zone {...getProps('stand_west', 'West Curve')} x={20} y={150} width={150} height={300} />

            {/* East Curve Stand (Right) */}
            <Zone {...getProps('stand_east', 'East Curve')} x={630} y={150} width={150} height={300} />

            {/* Field Label */}
            <text x="400" y="300" textAnchor="middle" className="fill-white/30 text-3xl font-black">TRACK & FIELD</text>
        </SvgWrapper>
    );
};

// 6. MOTORSPORT TRACK
export const MotorsportTrackSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-100">
            {/* Track Shape */}
            <path d="M 100 100 L 600 100 Q 700 100 700 200 L 700 400 Q 700 500 600 500 L 200 500 Q 100 500 100 400 Z"
                fill="none" stroke="#334155" strokeWidth="40" />
            <path d="M 100 100 L 600 100 Q 700 100 700 200 L 700 400 Q 700 500 600 500 L 200 500 Q 100 500 100 400 Z"
                fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10,10" />

            {/* Grandstands */}
            <Zone {...getProps('grandstand_main', 'Main Straight GS')} x={200} y={30} width={300} height={50} />
            <Zone {...getProps('grandstand_turn1', 'Turn 1 GS')} x={650} y={50} width={100} height={100} />
            <Zone {...getProps('grandstand_hairpin', 'Hairpin GS')} x={50} y={350} width={100} height={150} />

            {/* Paddock Club */}
            <Zone {...getProps('paddock_club', 'Paddock Club')} x={200} y={150} width={300} height={60} />
        </SvgWrapper>
    );
};


// 8. FOOTBALL - CLASSIC GROUND (Four distinct stands)
export const FootballClassicGroundSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Pitch (Standard) */}
            <rect x="150" y="100" width="500" height="400" fill="#15803d" stroke="#166534" strokeWidth="4" />
            <rect x="150" y="100" width="500" height="400" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
            <line x1="400" y1="100" x2="400" y2="500" stroke="white" strokeWidth="2" opacity="0.6" />
            <circle cx="400" cy="300" r="50" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />

            {/* 4 Separate Stands (English Stadium Style - Rectangular & Close) */}
            <Zone {...getProps('stand_north', 'North Stand')} x={150} y={20} width={500} height={70} />
            <Zone {...getProps('stand_south', 'South Stand')} x={150} y={510} width={500} height={70} />
            <Zone {...getProps('stand_west', 'West Stand')} x={20} y={100} width={120} height={400} />
            <Zone {...getProps('stand_east', 'East Stand')} x={660} y={100} width={120} height={400} />

            {/* Corner Floodlights (Visual Only) */}
            <g fill="#94a3b8">
                <circle cx="130" cy="80" r="8" />
                <circle cx="670" cy="80" r="8" />
                <circle cx="130" cy="520" r="8" />
                <circle cx="670" cy="520" r="8" />
            </g>
        </SvgWrapper>
    );
};

// 9. FOOTBALL - MODERN ARENA (Continuous Bowl)
export const FootballModernArenaSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-100">
            {/* Pitch (Slightly smaller to fit bowl) */}
            <rect x="180" y="130" width="440" height="340" fill="#15803d" stroke="#166534" strokeWidth="4" />
            <rect x="180" y="130" width="440" height="340" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
            <line x1="400" y1="130" x2="400" y2="470" stroke="white" strokeWidth="2" opacity="0.6" />
            <circle cx="400" cy="300" r="50" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Continuous Bowl Construction (Trapezoids) */}

            {/* North Bowl */}
            <Zone {...getProps('bowl_north', 'North Bowl')}
                path="M 150 120 L 650 120 L 680 40 L 120 40 Z" />

            {/* South Bowl */}
            <Zone {...getProps('bowl_south', 'South Bowl')}
                path="M 150 480 L 650 480 L 680 560 L 120 560 Z" />

            {/* West Bowl */}
            <Zone {...getProps('bowl_west', 'West Bowl')}
                path="M 170 130 L 170 470 L 40 540 L 40 60 Z" />

            {/* East Bowl */}
            <Zone {...getProps('bowl_east', 'East Bowl')}
                path="M 630 130 L 630 470 L 760 540 L 760 60 Z" />

            {/* Corners (Connecting) */}
            <path d="M 120 40 L 40 60 L 170 130 L 150 120 Z" fill="#cbd5e1" opacity="0.5" /> {/* NW */}
            <path d="M 680 40 L 760 60 L 630 130 L 650 120 Z" fill="#cbd5e1" opacity="0.5" /> {/* NE */}
            <path d="M 120 560 L 40 540 L 170 470 L 150 480 Z" fill="#cbd5e1" opacity="0.5" /> {/* SW */}
            <path d="M 680 560 L 760 540 L 630 470 L 650 480 Z" fill="#cbd5e1" opacity="0.5" /> {/* SE */}

        </SvgWrapper>
    );
};

// 10. CRICKET - MODERN BOWL (Circular Large Stadium)
export const CricketModernBowlSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // Helper to create annular sectors (curved blocks)
    const createSector = (cx, cy, rIn, rOut, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + rIn * Math.cos(startAngle * rad);
        const y1 = cy + rIn * Math.sin(startAngle * rad);
        const x2 = cx + rOut * Math.cos(startAngle * rad);
        const y2 = cy + rOut * Math.sin(startAngle * rad);
        const x3 = cx + rOut * Math.cos(endAngle * rad);
        const y3 = cy + rOut * Math.sin(endAngle * rad);
        const x4 = cx + rIn * Math.cos(endAngle * rad);
        const y4 = cy + rIn * Math.sin(endAngle * rad);
        return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 0 0 ${x1} ${y1} Z`;
    };

    const cx = 400, cy = 300;

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Large Circular Field */}
            <circle cx={cx} cy={cy} r={160} fill="#15803d" stroke="#166534" strokeWidth="2" />
            <rect x={cx - 10} y={cy - 40} width={20} height={80} fill="#e2e8f0" /> {/* Pitch */}
            <circle cx={cx} cy={cy} r={70} fill="none" stroke="white" strokeWidth="1" opacity="0.4" /> {/* 30 Yard Circle */}

            {/* Huge Continuous Roof/Stand Structure */}
            <circle cx={cx} cy={cy} r={280} fill="none" stroke="#e2e8f0" strokeWidth="1" />

            {/* 3 Tier Seating Ring sections */}
            {[0, 90, 180, 270].map((angle, i) => (
                <React.Fragment key={i}>
                    {/* Lower Tier */}
                    <Zone {...getProps(`lower_tier_${['d', 'c', 'b', 'a'][i]}`, 'Lower')}
                        path={createSector(cx, cy, 170, 210, angle + 10, angle + 80)} />

                    {/* Upper Tier */}
                    <Zone {...getProps(`upper_tier_${['d', 'c', 'b', 'a'][i]}`, 'Upper')}
                        path={createSector(cx, cy, 220, 270, angle + 10, angle + 80)} />
                </React.Fragment>
            ))}

            {/* 4 Floodlight Towers */}
            <circle cx={150} cy={50} r={10} fill="#64748b" />
            <circle cx={650} cy={50} r={10} fill="#64748b" />
            <circle cx={150} cy={550} r={10} fill="#64748b" />
            <circle cx={650} cy={550} r={10} fill="#64748b" />
        </SvgWrapper>
    );
};

// 11. CRICKET - PAVILION STYLE (Asymmetric/Classic)
export const CricketPavilionSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-green-50">
            {/* Oval Field (Slightly offset) */}
            <ellipse cx="400" cy="350" rx="200" ry="160" fill="#15803d" stroke="#166534" strokeWidth="2" />
            <rect x="390" y="310" width="20" height="80" fill="#fef3c7" /> {/* Pitch */}

            {/* The Historic Pavilion (Top Center) */}
            <rect x="300" y="50" width="200" height="100" fill="#7c2d12" stroke="#451a03" strokeWidth="4" />
            <text x="400" y="100" textAnchor="middle" className="fill-white font-serif tracking-widest text-lg">THE PAVILION</text>
            <Zone {...getProps('pavilion_members', 'Members Balcony')} x={320} y={110} width={160} height={40} fill="rgba(255,255,255,0.2)" />

            {/* Grass Banks (Sides) */}
            <path d="M 150 350 Q 100 200 250 150 L 280 180 Q 180 220 190 350 Z" fill="#84cc16" opacity="0.5" />
            <text x="200" y="250" className="fill-green-900 font-bold text-xs -rotate-45">GRASS BANK WEST</text>
            <Zone {...getProps('grass_bank_west', 'West Bank')} path="M 150 350 Q 100 200 250 150 L 280 180 Q 180 220 190 350 Z" />

            <path d="M 650 350 Q 700 200 550 150 L 520 180 Q 620 220 610 350 Z" fill="#84cc16" opacity="0.5" />
            <text x="600" y="250" className="fill-green-900 font-bold text-xs rotate-45">GRASS BANK EAST</text>
            <Zone {...getProps('grass_bank_east', 'East Bank')} path="M 650 350 Q 700 200 550 150 L 520 180 Q 620 220 610 350 Z" />

            {/* Temp Stands (Bottom) */}
            <Zone {...getProps('stand_south', 'Sightscreen Stand')} x={300} y={520} width={200} height={60} />
        </SvgWrapper>
    );
};

// 12. BASKETBALL - COLLEGE COURT (Bleachers)
export const BasketballCollegeSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-200">
            {/* Court (Wood brighter) */}
            <rect x="150" y="150" width="500" height="300" fill="#fcd34d" stroke="#b45309" strokeWidth="4" />
            <line x1="400" y1="150" x2="400" y2="450" stroke="#b45309" strokeWidth="2" />
            <circle cx="400" cy="300" r="40" stroke="#b45309" strokeWidth="2" fill="none" />

            {/* Painted Keys */}
            <rect x="150" y="230" width="100" height="140" fill="#b45309" opacity="0.2" />
            <rect x="550" y="230" width="100" height="140" fill="#b45309" opacity="0.2" />

            {/* Student Section Bleachers (One side packed) */}
            <g>
                <rect x="100" y="50" width="600" height="80" fill="#e5e5e5" />
                {[60, 75, 90, 105].map(y => <line key={y} x1="100" y1={y} x2="700" y2={y} stroke="#a3a3a3" strokeWidth="1" />)}
                <Zone {...getProps('bleachers_home', 'STUDENT SECTION')} x={100} y={50} width={600} height={80} />
            </g>

            {/* Visitor/General Bleachers (Bottom) */}
            <g>
                <rect x="100" y="470" width="600" height="80" fill="#e5e5e5" />
                {[480, 495, 510, 525].map(y => <line key={y} x1="100" y1={y} x2="700" y2={y} stroke="#a3a3a3" strokeWidth="1" />)}
                <Zone {...getProps('bleachers_visitor', 'General Admission')} x={100} y={470} width={600} height={80} />
            </g>

            {/* Pep Band Corner */}
            <Zone {...getProps('pep_band', 'Pep Band')} x={20} y={150} width={100} height={150} />
        </SvgWrapper>
    );
};

// 13. RUGBY FIELD SVG
export const RugbyFieldSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Pitch */}
            <rect x="150" y="100" width="500" height="400" fill="#15803d" stroke="#166534" strokeWidth="4" />

            {/* Markings */}
            <line x1="400" y1="100" x2="400" y2="500" stroke="white" strokeWidth="2" /> {/* Halfway */}
            <line x1="275" y1="100" x2="275" y2="500" stroke="white" strokeWidth="2" opacity="0.7" /> {/* 22m */}
            <line x1="525" y1="100" x2="525" y2="500" stroke="white" strokeWidth="2" opacity="0.7" /> {/* 22m */}

            <line x1="200" y1="100" x2="200" y2="500" stroke="white" strokeWidth="3" /> {/* Try Line L */}
            <line x1="600" y1="100" x2="600" y2="500" stroke="white" strokeWidth="3" /> {/* Try Line R */}

            <line x1="150" y1="100" x2="150" y2="500" stroke="white" strokeWidth="1" strokeDasharray="5,5" /> {/* Dead Ball L */}
            <line x1="650" y1="100" x2="650" y2="500" stroke="white" strokeWidth="1" strokeDasharray="5,5" /> {/* Dead Ball R */}

            {/* H-Posts */}
            <g stroke="white" strokeWidth="3">
                <line x1="200" y1="280" x2="200" y2="320" /> {/* Crossbar L */}
                <line x1="200" y1="260" x2="200" y2="280" strokeWidth="2" /> {/* Upright Top L */}
                <line x1="200" y1="320" x2="200" y2="340" strokeWidth="2" /> {/* Upright Bottom L */}

                <line x1="600" y1="280" x2="600" y2="320" /> {/* Crossbar R */}
                <line x1="600" y1="260" x2="600" y2="280" strokeWidth="2" />
                <line x1="600" y1="320" x2="600" y2="340" strokeWidth="2" />
            </g>

            {/* Stands - Grandstand Style */}
            <Zone {...getProps('grandstand_west', 'West Stand')} x={20} y={100} width={100} height={400} />
            <Zone {...getProps('grandstand_east', 'East Stand')} x={680} y={100} width={100} height={400} />
            <Zone {...getProps('terrace_north', 'North Terrace')} x={150} y={20} width={500} height={60} />
            <Zone {...getProps('terrace_south', 'South Terrace')} x={150} y={520} width={500} height={60} />
        </SvgWrapper>
    );
};

// 14. FIELD HOCKEY SVG
export const FieldHockeySvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Pitch (Blue Turf Modern) */}
            <rect x="150" y="120" width="500" height="360" fill="#0ea5e9" stroke="#0284c7" strokeWidth="4" />

            {/* Shooting Circles (D-Zones) */}
            <path d="M 150 250 A 50 50 0 0 1 200 250 L 200 350 A 50 50 0 0 1 150 350" fill="#e0f2fe" opacity="0.3" stroke="white" strokeWidth="2" />
            <path d="M 650 250 A 50 50 0 0 0 600 250 L 600 350 A 50 50 0 0 0 650 350" fill="#e0f2fe" opacity="0.3" stroke="white" strokeWidth="2" />

            <line x1="400" y1="120" x2="400" y2="480" stroke="white" strokeWidth="2" />
            <line x1="275" y1="120" x2="275" y2="480" stroke="white" strokeWidth="1" strokeDasharray="5,5" /> {/* 23m line */}
            <line x1="525" y1="120" x2="525" y2="480" stroke="white" strokeWidth="1" strokeDasharray="5,5" />

            {/* Stands */}
            <Zone {...getProps('main_stand', 'Main Stand')} x={150} y={40} width={500} height={60} />
            <Zone {...getProps('open_stand', 'Open Stand')} x={150} y={500} width={500} height={60} />
            <Zone {...getProps('side_stand_l', 'Goal Stand L')} x={40} y={150} width={90} height={300} />
            <Zone {...getProps('side_stand_r', 'Goal Stand R')} x={670} y={150} width={90} height={300} />
        </SvgWrapper>
    );
};

// 15. BASEBALL - MODERN BALLPARK
export const BaseballModernBallparkSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-100">
            {/* Asymmetric Field (Fenway/Oracle style) */}
            <path d="M 400 550 L 100 250 L 100 100 L 700 150 L 700 250 Z" fill="#15803d" />
            <path d="M 400 550 L 250 400 L 400 250 L 550 400 Z" fill="#b45309" /> {/* Diamond */}

            {/* Bases */}
            <rect x="395" y="540" width="10" height="10" fill="white" />
            <rect x="545" y="395" width="10" height="10" fill="white" />
            <rect x="395" y="250" width="10" height="10" fill="white" />
            <rect x="245" y="395" width="10" height="10" fill="white" />

            {/* Green Monster Wall (Left Field) */}
            <rect x="80" y="100" width="20" height="170" fill="#064e3b" />
            <Zone {...getProps('monster_seats', 'Green Monster')} x={40} y={100} width={40} height={170} />

            {/* Right Field Bleachers */}
            <Zone {...getProps('right_field_bleachers', 'Right Bleachers')} x={710} y={150} width={60} height={150} />

            {/* Home Plate Tower / Club */}
            <Zone {...getProps('home_plate_club', 'Home Plate Club')} x={300} y={500} width={200} height={80} />

            {/* Third Base Line - Multi-Deck */}
            <Zone {...getProps('third_base_lower', '3rd Base Lower')} x={120} y={280} width={100} height={150} transform="rotate(-45, 170, 355)" />
            <Zone {...getProps('third_base_upper', '3rd Base Upper')} x={50} y={280} width={60} height={150} transform="rotate(-45, 100, 355)" />

            {/* First Base Line - Multi-Deck */}
            <Zone {...getProps('first_base_lower', '1st Base Lower')} x={580} y={280} width={100} height={150} transform="rotate(45, 630, 355)" />
            <Zone {...getProps('first_base_upper', '1st Base Upper')} x={690} y={280} width={60} height={150} transform="rotate(45, 700, 355)" />

        </SvgWrapper>
    );
};

// 16. RUGBY - MODERN STADIUM (Bowl with Rugby Pitch)
export const RugbyModernStadiumSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Large Stadium Structure (Bowl) */}
            <path d="M 50 150 Q 400 50 750 150 L 750 450 Q 400 550 50 450 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />

            {/* Rugby Pitch (Center) */}
            <rect x="200" y="180" width="400" height="240" fill="#15803d" stroke="#166534" strokeWidth="2" />
            <line x1="400" y1="180" x2="400" y2="420" stroke="white" strokeWidth="2" /> {/* Halfway */}
            <line x1="240" y1="180" x2="240" y2="420" stroke="white" strokeWidth="2" /> {/* Try L */}
            <line x1="560" y1="180" x2="560" y2="420" stroke="white" strokeWidth="2" /> {/* Try R */}

            {/* Posts */}
            <line x1="240" y1="280" x2="240" y2="320" stroke="white" strokeWidth="3" />
            <line x1="560" y1="280" x2="560" y2="320" stroke="white" strokeWidth="3" />

            {/* Stadium Zones (Surrounding) */}
            <Zone {...getProps('bowl_north', 'North Tier')} path="M 150 150 Q 400 80 650 150 L 600 170 Q 400 120 200 170 Z" />
            <Zone {...getProps('bowl_south', 'South Tier')} path="M 150 450 Q 400 520 650 450 L 600 430 Q 400 480 200 430 Z" />
            <Zone {...getProps('bowl_west', 'West Tier')} path="M 50 150 Q 0 300 50 450 L 100 430 Q 60 300 100 170 Z" />
            <Zone {...getProps('bowl_east', 'East Tier')} path="M 750 150 Q 800 300 750 450 L 700 430 Q 740 300 700 170 Z" />
        </SvgWrapper>
    );
};

// 17. TENNIS - MODERN STADIUM (Massive Center Court)
export const TennisModernStadiumSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-900"> {/* Dark theme for premium feel */}
            {/* Large Arena Floor */}
            <rect x="150" y="100" width="500" height="400" fill="#1e293b" rx="20" />

            {/* Tennis Court (Blue) */}
            <rect x="250" y="180" width="300" height="240" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <line x1="400" y1="180" x2="400" y2="420" stroke="white" strokeWidth="1" strokeDasharray="4,2" /> {/* Net */}
            <line x1="250" y1="240" x2="550" y2="240" stroke="white" strokeWidth="1" opacity="0.7" />
            <line x1="250" y1="360" x2="550" y2="360" stroke="white" strokeWidth="1" opacity="0.7" />

            {/* Stadium Seating (Rectangular surrounding high capacity) */}
            <Zone {...getProps('court_prime_north', 'Prime North')} x={250} y={40} width={300} height={100} />
            <Zone {...getProps('court_prime_south', 'Prime South')} x={250} y={460} width={300} height={100} />
            <Zone {...getProps('court_side_west', 'West Stand')} x={50} y={150} width={150} height={300} />
            <Zone {...getProps('court_side_east', 'East Stand')} x={600} y={150} width={150} height={300} />

            {/* Corners */}
            <Zone {...getProps('corner_nw', 'NW Corner')} x={50} y={40} width={150} height={100} />
            <Zone {...getProps('corner_ne', 'NE Corner')} x={600} y={40} width={150} height={100} />
            <Zone {...getProps('corner_sw', 'SW Corner')} x={50} y={460} width={150} height={100} />
            <Zone {...getProps('corner_se', 'SE Corner')} x={600} y={460} width={150} height={100} />
        </SvgWrapper>
    );
};

// 18. FIELD HOCKEY - MODERN STADIUM
export const FieldHockeyModernStadiumSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            {/* Stadium Shell */}
            <ellipse cx="400" cy="300" rx="380" ry="280" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

            {/* Blue Turf Pitch */}
            <rect x="200" y="150" width="400" height="300" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
            <circle cx="400" cy="300" r="40" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M 200 250 A 40 40 0 0 1 240 250 L 240 350 A 40 40 0 0 1 200 350" fill="none" stroke="white" />
            <path d="M 600 250 A 40 40 0 0 0 560 250 L 560 350 A 40 40 0 0 0 600 350" fill="none" stroke="white" />

            {/* Continuous Stands */}
            <Zone {...getProps('stand_main', 'Main Grandstand')} x={200} y={50} width={400} height={80} />
            <Zone {...getProps('stand_opposite', 'Opposite Stand')} x={200} y={470} width={400} height={80} />
            <Zone {...getProps('stand_goal_1', 'Goal Stand 1')} x={50} y={150} width={130} height={300} />
            <Zone {...getProps('stand_goal_2', 'Goal Stand 2')} x={620} y={150} width={130} height={300} />
        </SvgWrapper>
    );
};

// 19. BASKETBALL - MODERN STADIUM (Huge Arena)
export const BasketballModernStadiumSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // Annular sector helper
    const createSector = (cx, cy, rIn, rOut, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + rIn * Math.cos(startAngle * rad);
        const y1 = cy + rIn * Math.sin(startAngle * rad);
        const x2 = cx + rOut * Math.cos(startAngle * rad);
        const y2 = cy + rOut * Math.sin(startAngle * rad);
        const x3 = cx + rOut * Math.cos(endAngle * rad);
        const y3 = cy + rOut * Math.sin(endAngle * rad);
        const x4 = cx + rIn * Math.cos(endAngle * rad);
        const y4 = cy + rIn * Math.sin(endAngle * rad);
        return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 0 0 ${x1} ${y1} Z`;
    };
    const cx = 400, cy = 300;

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-900">
            {/* Center Court */}
            <rect x="280" y="220" width="240" height="160" fill="#ffedd5" stroke="#c2410c" strokeWidth="2" />
            <circle cx={400} cy={300} r="30" stroke="#c2410c" strokeWidth="2" fill="none" />

            {/* Huge Arena Tiers (Circular) */}

            {/* Lower Bowl */}
            {[0, 90, 180, 270].map((angle, i) => (
                <Zone
                    key={`lower_${i}`}
                    {...getProps(`arena_lower_${i}`, 'Lower Bowl')}
                    path={createSector(cx, cy, 140, 200, angle + 10, angle + 80)}
                />
            ))}

            {/* Upper Bowl */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <Zone
                    key={`upper_${i}`}
                    {...getProps(`arena_upper_${i}`, 'Upper Deck')}
                    path={createSector(cx, cy, 210, 280, angle + 5, angle + 40)}
                />
            ))}

        </SvgWrapper>
    );
};

// 20. KABADDI - TRADITIONAL (Clay/Mud Court)
export const KabaddiTraditionalSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-amber-100">
            {/* Mud Ground */}
            <rect x="0" y="0" width="800" height="600" fill="#fde68a" opacity="0.5" />

            {/* The Mat (Clay Color) */}
            <rect x="250" y="200" width="300" height="200" fill="#d97706" stroke="#92400e" strokeWidth="2" />
            <text x="400" y="300" textAnchor="middle" className="fill-amber-900 font-bold opacity-50 text-4xl">KABADDI</text>

            {/* Lines */}
            <line x1="400" y1="200" x2="400" y2="400" stroke="white" strokeWidth="2" opacity="0.8" />
            <line x1="325" y1="200" x2="325" y2="400" stroke="white" strokeWidth="1" opacity="0.6" /> {/* Baulk */}
            <line x1="475" y1="200" x2="475" y2="400" stroke="white" strokeWidth="1" opacity="0.6" /> {/* Baulk */}

            {/* Simple Earth Banks (Stands) */}
            <Zone {...getProps('bank_north', 'North Bank')} x={200} y={50} width={400} height={100} />
            <Zone {...getProps('bank_south', 'South Bank')} x={200} y={450} width={400} height={100} />
            <Zone {...getProps('bank_west', 'West Bank')} x={50} y={150} width={150} height={300} />
            <Zone {...getProps('bank_east', 'East Bank')} x={600} y={150} width={150} height={300} />
        </SvgWrapper>
    );
};

// 21. KABADDI - PRO LEAGUE (TV Arena)
export const KabaddiProLeagueSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-purple-900">
            {/* Neon Glow Mat */}
            <rect x="280" y="220" width="240" height="160" fill="#f472b6" stroke="#fbcfe8" strokeWidth="4" className="drop-shadow-lg" />
            <line x1="400" y1="220" x2="400" y2="380" stroke="white" strokeWidth="2" />

            {/* Premium Courtside */}
            <Zone {...getProps('courtside_vip', 'VIP Courtside')} x={250} y={150} width={300} height={50} />
            <Zone {...getProps('courtside_seats', 'Courtside Seats')} x={250} y={400} width={300} height={50} />

            {/* Studio / Commentators */}
            <Zone {...getProps('studio_box', 'Studio')} x={650} y={250} width={100} height={100} />

            {/* General Stands (Darkened) */}
            <Zone {...getProps('stand_upper_n', 'Upper North')} x={200} y={50} width={400} height={80} />
            <Zone {...getProps('stand_upper_s', 'Upper South')} x={200} y={470} width={400} height={80} />

        </SvgWrapper>
    );
};

// 21b. CRICKET - OVAL (Classic)
export const CricketOvalSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    const createSector = (cx, cy, rInner, rOuter, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + rInner * Math.cos(startAngle * rad);
        const y1 = cy + rInner * Math.sin(startAngle * rad);
        const x2 = cx + rOuter * Math.cos(startAngle * rad);
        const y2 = cy + rOuter * Math.sin(startAngle * rad);
        const x3 = cx + rOuter * Math.cos(endAngle * rad);
        const y3 = cy + rOuter * Math.sin(endAngle * rad);
        const x4 = cx + rInner * Math.cos(endAngle * rad);
        const y4 = cy + rInner * Math.sin(endAngle * rad);
        return `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`;
    };
    const cx = 400, cy = 300;
    const stands = [
        { id: 'stand_a', label: 'N', angle: 270 }, { id: 'stand_b', label: 'NE', angle: 315 },
        { id: 'stand_c', label: 'E', angle: 0 }, { id: 'stand_d', label: 'SE', angle: 45 },
        { id: 'stand_e', label: 'S', angle: 90 }, { id: 'stand_f', label: 'SW', angle: 135 },
        { id: 'stand_g', label: 'W', angle: 180 }, { id: 'stand_h', label: 'NW', angle: 225 }
    ];
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            <circle cx={cx} cy={cy} r={130} fill="#15803d" stroke="#166534" strokeWidth="4" />
            <rect x={cx - 10} y={cy - 40} width={20} height={80} fill="#e2e8f0" />
            {stands.map(s => (
                <g key={s.id}>
                    <Zone {...getProps(`${s.id}_lower`, `${s.label} Lower`)} path={createSector(cx, cy, 140, 190, s.angle - 20, s.angle + 20)} />
                    <Zone {...getProps(`${s.id}_upper`, `${s.label} Upper`)} path={createSector(cx, cy, 200, 260, s.angle - 20, s.angle + 20)} />
                </g>
            ))}
        </SvgWrapper>
    );
};

// 21c. KABADDI - INDOOR ARENA
export const KabaddiIndoorSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-900 border-slate-800">
            <rect x="300" y="225" width="200" height="150" fill="#f59e0b" rx="2" opacity="0.9" />
            <Zone {...getProps('courtside_premium', 'Courtside')} path="M 280 205 H 520 V 395 H 280 V 205 Z M 300 225 V 375 H 500 V 225 H 300 Z" fillRule="evenodd" />
            <Zone {...getProps('lower_bowl_section_a', 'Lower N')} x={280} y={100} width={240} height={90} />
            <Zone {...getProps('lower_bowl_section_c', 'Lower S')} x={280} y={410} width={240} height={90} />
            <Zone {...getProps('lower_bowl_section_d', 'Lower W')} x={150} y={205} width={110} height={190} />
            <Zone {...getProps('lower_bowl_section_b', 'Lower E')} x={540} y={205} width={110} height={190} />
            <Zone {...getProps('upper_tier_section_a', 'Upper N')} x={280} y={20} width={240} height={60} />
            <Zone {...getProps('upper_tier_section_b', 'Upper S')} x={280} y={520} width={240} height={60} />
        </SvgWrapper>
    );
};


// 23. THEATRE - PREMIUM LOUNGE (Recliners)
export const TheatrePremiumLoungeSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-neutral-900 border-neutral-800">
            {/* Screen */}
            <rect x="200" y="30" width="400" height="5" fill="#e5e5e5" />
            <text x="400" y="60" textAnchor="middle" className="text-xs font-serif tracking-widest fill-neutral-400">LUXURY SCREEN</text>

            {/* Recliner Pods - Spacious Layout */}
            <g transform="translate(0, 50)">
                <Zone {...getProps('lounge_row_a', 'Row A - Recliners')} x={150} y={50} width={500} height={70} rx="15" />
                <Zone {...getProps('lounge_row_b', 'Row B - Recliners')} x={150} y={150} width={500} height={70} rx="15" />
                <Zone {...getProps('lounge_row_c', 'Row C - Recliners')} x={150} y={250} width={500} height={70} rx="15" />

                {/* Private Pods (Back) */}
                <Zone {...getProps('private_pod_l', 'VIP Pod L')} x={50} y={380} width={200} height={100} rx="20" />
                <Zone {...getProps('private_pod_c', 'VIP Pod C')} x={300} y={380} width={200} height={100} rx="20" />
                <Zone {...getProps('private_pod_r', 'VIP Pod R')} x={550} y={380} width={200} height={100} rx="20" />
            </g>
        </SvgWrapper>
    );
};

// 24. THEATRE - MULTIPLEX (Modern Standard)
export const TheatreMultiplexSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-950">
            <defs>
                <linearGradient id="screenGradient" x1="400" y1="50" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Screen */}
            <path d="M 100 50 L 700 50" stroke="#f8fafc" strokeWidth="4" />
            <path d="M 100 50 L 120 400 L 680 400 L 700 50 Z" fill="url(#screenGradient)" />

            {/* Side Aisles */}
            <rect x="50" y="100" width="80" height="400" fill="#1e293b" />
            <rect x="670" y="100" width="80" height="400" fill="#1e293b" />

            {/* Seating Blocks with Aisles */}
            <Zone {...getProps('stalls_left', 'Stalls Left')} x={150} y={100} width={150} height={200} />
            <Zone {...getProps('stalls_center', 'Stalls Center')} x={320} y={100} width={160} height={200} />
            <Zone {...getProps('stalls_right', 'Stalls Right')} x={500} y={100} width={150} height={200} />

            <Zone {...getProps('circle_left', 'Circle Left')} x={150} y={330} width={150} height={150} />
            <Zone {...getProps('circle_center', 'Circle Center')} x={320} y={330} width={160} height={150} />
            <Zone {...getProps('circle_right', 'Circle Right')} x={500} y={330} width={150} height={150} />

            {/* Executive Back Row */}
            <Zone {...getProps('executive_row', 'Executive')} x={150} y={500} width={500} height={50} />
        </SvgWrapper>
    );
};

// 25. THEATRE - OUTDOOR / ROOFTOP
export const TheatreOutdoorSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-indigo-950">
            {/* Night Sky / Stars Background (Simulated with dots if needed, but solid dark blue works) */}

            {/* Inflatable Screen */}
            <rect x="200" y="50" width="400" height="200" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" rx="5" />
            <rect x="220" y="70" width="360" height="160" fill="black" opacity="0.8" />

            {/* Deck Chairs / Bean Bags Area */}
            <Zone {...getProps('bean_bags_front', 'Front Bean Bags')} x={250} y={280} width={300} height={80} />

            {/* Deck Chairs */}
            <Zone {...getProps('deck_chairs_a', 'Deck Chairs A')} x={150} y={380} width={200} height={100} />
            <Zone {...getProps('deck_chairs_b', 'Deck Chairs B')} x={450} y={380} width={200} height={100} />

            {/* Picnic Tables / Rear */}
            <Zone {...getProps('picnic_tables', 'Picnic Spot')} x={100} y={500} width={600} height={80} />

            {/* Bar/Food Truck */}
            <rect x="650" y="300" width="100" height="60" fill="#f59e0b" />
            <text x="700" y="335" textAnchor="middle" className="fill-white text-xs font-bold">SNACKS</text>
        </SvgWrapper>
    );
};
// 26. THEATRE - STANDARD CINEMA (Detailed Seat Map replacement)
export const TheatreStandardCinemaSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);

    // Helper to generate a grid of seats
    const SeatGrid = ({ idPrefix, label, rows, cols, startX, startY, seatSize = 18, gap = 4 }) => {
        const seats = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                seats.push(
                    <rect
                        key={`${idPrefix}_${r}_${c}`}
                        x={startX + c * (seatSize + gap)}
                        y={startY + r * (seatSize + gap)}
                        width={seatSize}
                        height={seatSize}
                        rx="3"
                        fill="currentColor"
                        opacity="0.25"
                    />
                );
            }
        }

        return (
            <g className="text-slate-400">
                {seats}
                <Zone
                    {...getProps(idPrefix, label)}
                    x={startX - 5}
                    y={startY - 5}
                    width={(cols * (seatSize + gap)) + 5}
                    height={(rows * (seatSize + gap)) + 5}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                />
            </g>
        );
    };

    return (
        <SvgWrapper viewBox="0 0 800 800" className="bg-[#0a0a1a] border-slate-800">
            <defs>
                <linearGradient id="screenGlowEnhanced" x1="400" y1="0" x2="400" y2="250" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <filter id="blurGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                </filter>
            </defs>

            {/* DRAMATIC SCREEN SECTION */}
            <g transform="translate(0, 10)">
                {/* Back glow */}
                <ellipse cx="400" cy="40" rx="350" ry="100" fill="#0ea5e9" opacity="0.1" filter="url(#blurGlow)" />

                {/* The Screen Boundary */}
                <path
                    d="M 120 70 Q 400 30 680 70 L 720 120 L 80 120 Z"
                    fill="#e0f2fe"
                    className="opacity-90 shadow-2xl"
                />

                {/* Light Beam */}
                <path
                    d="M 120 70 Q 400 30 680 70 L 780 400 L 20 400 Z"
                    fill="url(#screenGlowEnhanced)"
                    className="pointer-events-none"
                />

                <text x="400" y="105" textAnchor="middle" className="text-sm font-black tracking-[0.8em] fill-sky-800 uppercase">THE SCREEN</text>
            </g>

            {/* SEAT SECTIONS - Unified Layout */}
            <g transform="translate(0, 50)">
                {/* SILVER SECTION - Front Row - More prominent labels */}
                <text x="400" y="125" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold tracking-widest uppercase opacity-60">Silver Section</text>
                <SeatGrid idPrefix="zone_silver_left" label="Silver Left" rows={2} cols={6} startX={100} startY={140} />
                <SeatGrid idPrefix="zone_silver_center" label="Silver Center" rows={2} cols={10} startX={280} startY={140} />
                <SeatGrid idPrefix="zone_silver_right" label="Silver Right" rows={2} cols={6} startX={560} startY={140} />

                {/* GOLD SECTION - Main Body */}
                <text x="400" y="220" textAnchor="middle" className="fill-yellow-600 text-[10px] font-bold tracking-widest uppercase opacity-60">Gold Executive</text>
                <SeatGrid idPrefix="zone_gold_left" label="Gold Left" rows={5} cols={6} startX={100} startY={240} />
                <SeatGrid idPrefix="zone_gold_center" label="Gold Center" rows={5} cols={10} startX={280} startY={240} />
                <SeatGrid idPrefix="zone_gold_right" label="Gold Right" rows={5} cols={6} startX={560} startY={240} />

                {/* PLATINUM SECTION - Luxury Recliners */}
                <text x="400" y="415" textAnchor="middle" className="fill-slate-300 text-[10px] font-bold tracking-widest uppercase opacity-60">Platinum Recliners</text>
                <SeatGrid idPrefix="zone_platinum_full" label="Platinum Full" rows={2} cols={16} startX={115} startY={435} seatSize={24} gap={8} />

                {/* BALCONY DIVIDER */}
                <g transform="translate(0, 530)">
                    <rect x="0" y="0" width="800" height="4" fill="#1e293b" rx="2" />
                    <text x="400" y="30" textAnchor="middle" className="fill-slate-400 text-xs font-bold tracking-[0.4em] uppercase">Premium Balcony</text>

                    <SeatGrid idPrefix="zone_balcony_left" label="Balc Left" rows={3} cols={6} startX={100} startY={50} />
                    <SeatGrid idPrefix="zone_balcony_center" label="Balc Center" rows={3} cols={10} startX={280} startY={50} />
                    <SeatGrid idPrefix="zone_balcony_right" label="Balc Right" rows={3} cols={6} startX={560} startY={50} />

                    {/* ROYAL BOX - Very back center */}
                    <g transform="translate(300, 160)">
                        <rect x="0" y="0" width="200" height="40" rx="8" fill="#422006" stroke="#fbbf24" strokeWidth="1" />
                        <text x="100" y="25" textAnchor="middle" className="fill-yellow-500 text-[10px] font-black tracking-widest">ROYAL BOX</text>
                        <Zone {...getProps('zone_box', 'Royal Box')} x={0} y={0} width={200} height={40} className="opacity-0 hover:opacity-100" />
                    </g>
                </g>
            </g>

        </SvgWrapper>
    );
};
// DEPRECATED THEATRE LAYOUTS REMOVED PER LOCKED PROMPT


// 33. FOOTBALL - RECTANGLE (Standard)
export const FootballRectangleSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50">
            <rect x="150" y="100" width="500" height="400" fill="#15803d" stroke="#166534" strokeWidth="4" />
            <Zone {...getProps('main_stand_lower', 'Main Lower')} x={20} y={100} width={110} height={400} />
            <Zone {...getProps('opposite_stand_lower', 'Opposite Lower')} x={670} y={100} width={110} height={400} />
            <Zone {...getProps('north_end_lower', 'North End')} x={150} y={20} width={500} height={70} />
            <Zone {...getProps('south_end_lower', 'South End')} x={150} y={510} width={500} height={70} />
        </SvgWrapper>
    );
};

// 34. TENNIS - COURT (Standard)
export const TennisCourtSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-blue-800">
            <rect x="200" y="150" width="400" height="300" fill="#3b82f6" stroke="white" strokeWidth="4" />
            <Zone {...getProps('courtside_premium', 'Courtside')} x={150} y={150} width={40} height={300} />
            <Zone {...getProps('lower_tier_deuce', 'Lower Deuce')} x={100} y={470} width={290} height={100} />
            <Zone {...getProps('lower_tier_advantage', 'Lower Adv')} x={410} y={470} width={290} height={100} />
            <Zone {...getProps('upper_tier_deuce', 'Upper Deuce')} x={100} y={30} width={290} height={100} />
            <Zone {...getProps('upper_tier_advantage', 'Upper Adv')} x={410} y={30} width={290} height={100} />
        </SvgWrapper>
    );
};

// 35. BASKETBALL - COURT (Standard)
export const BasketballCourtSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-900 border-slate-800">
            <rect x="150" y="150" width="500" height="300" fill="#d97706" stroke="white" strokeWidth="4" />
            <Zone {...getProps('courtside', 'Courtside')} x={150} y={460} width={500} height={50} />
            <Zone {...getProps('lower_bowl_sections', 'Lower Bowl')} x={20} y={150} width={120} height={300} />
            <Zone {...getProps('upper_bowl_sections', 'Upper Bowl')} x={20} y={20} width={760} height={60} />
        </SvgWrapper>
    );
};

// 36. BASEBALL - DIAMOND (Classic)
export const BaseballDiamondSvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-50 border-slate-200">
            <path d="M 400 500 L 100 200 Q 400 0 700 200 Z" fill="#15803d" />
            <Zone {...getProps('diamond_club', 'Diamond Club')} x={250} y={450} width={300} height={60} />
            <Zone {...getProps('first_base_line', '1st Base Line')} x={580} y={250} width={120} height={200} />
            <Zone {...getProps('third_base_line', '3rd Base Line')} x={100} y={250} width={120} height={200} />
            <Zone {...getProps('outfield_bleachers', 'Outfield')} x={200} y={100} width={400} height={80} />
        </SvgWrapper>
    );
};

// 37. ICE HOCKEY - RINK (Standard)
export const IceHockeySvg = ({ onZoneClick, activeZones = [], zoneMap = {}, adminMode = false }) => {
    const getProps = useZoneProps(zoneMap, activeZones, onZoneClick, adminMode);
    return (
        <SvgWrapper viewBox="0 0 800 600" className="bg-slate-100 border-slate-300">
            <rect x="150" y="150" width="500" height="300" rx="50" fill="white" stroke="#334155" strokeWidth="2" />
            <Zone {...getProps('lower_bowl_side_n', 'Lower North')} x={150} y={80} width={500} height={60} />
            <Zone {...getProps('lower_bowl_side_s', 'Lower South')} x={150} y={460} width={500} height={60} />
            <Zone {...getProps('end_zone_w', 'West End')} x={60} y={150} width={80} height={300} />
            <Zone {...getProps('end_zone_e', 'East End')} x={660} y={150} width={80} height={300} />
        </SvgWrapper>
    );
};

