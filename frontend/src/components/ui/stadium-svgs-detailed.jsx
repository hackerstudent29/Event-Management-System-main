import React from 'react';
import { cn } from '@/lib/utils';

// Helper for zone colors and interaction
const useZoneHelpers = (zoneConfigs, onZoneClick, activeZones = []) => {
    const getZoneColor = (zoneId) => zoneConfigs[zoneId]?.color || '#CBD5E1';

    const isConfigured = (zoneId) => zoneConfigs[zoneId]?.seats && zoneConfigs[zoneId]?.price;

    const handleZoneClick = (zoneId, zoneName) => {
        if (onZoneClick) {
            onZoneClick(zoneId, zoneName, zoneConfigs[zoneId]);
        }
    };

    const getZoneProps = (zoneId, zoneName) => {
        const isActive = activeZones.includes(zoneId);
        return {
            fill: getZoneColor(zoneId),
            stroke: isActive ? '#FBBF24' : '#1e293b',
            strokeWidth: isActive ? 5 : 2,
            className: cn(
                "cursor-pointer transition-all duration-300",
                isActive ? "brightness-125 z-10" : "hover:opacity-80 hover:brightness-110"
            ),
            style: {
                filter: isActive ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))' : 'none'
            },
            onClick: () => handleZoneClick(zoneId, zoneName)
        };
    };

    return { getZoneColor, isConfigured, handleZoneClick, getZoneProps };
};

// Config Indicator Component (SVG) - Disabled as per user request
const ConfiguredMark = () => null;

// ============================================================================
// FOOTBALL STADIUM SVG - 15 Zones (Horizontal Field)
// ============================================================================
export const FootballStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            {/* Field: Horizontal Rectangle */}
            <rect x="150" y="150" width="500" height="300" fill="#2D7A3E" stroke="#fff" strokeWidth="2" />
            <line x1="400" y1="150" x2="400" y2="450" stroke="#fff" strokeWidth="2" />
            <circle cx="400" cy="300" r="40" fill="none" stroke="#fff" strokeWidth="2" />

            {/* NORTH SIDELINE (Top - Away/General) */}
            <path d="M 150 50 L 650 50 L 620 120 L 180 120 Z" {...getZoneProps('north_stand', 'Away End North')} />
            <text x="400" y="90" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">AWAY END (NORTH)</text>

            <rect x="180" y="20" width="440" height="25" {...getZoneProps('north_upper', 'North Upper Tier')} />
            <text x="400" y="37" textAnchor="middle" fill="#fff" fontSize="9" pointerEvents="none">NORTH UPPER</text>


            {/* SOUTH SIDELINE (Bottom - Home/Main) */}
            <path d="M 180 480 L 620 480 L 650 550 L 150 550 Z" {...getZoneProps('south_stand', 'Home End South')} />
            <text x="400" y="520" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">HOME END (SOUTH)</text>

            <rect x="180" y="555" width="440" height="25" {...getZoneProps('south_upper', 'South Upper Tier')} />
            <text x="400" y="572" textAnchor="middle" fill="#fff" fontSize="9" pointerEvents="none">SOUTH UPPER</text>


            {/* WEST GOAL END (Left - Premium Side) */}
            {/* VIP Center */}
            <path d="M 40 250 L 120 250 L 120 350 L 40 350 Z" {...getZoneProps('west_center', 'VIP Box')} strokeWidth="3" />
            <text x="80" y="300" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" transform="rotate(-90 80 300)" pointerEvents="none">VIP BOX</text>

            {/* West Left (Premium) */}
            <path d="M 40 150 L 120 150 L 120 250 L 40 250 Z" {...getZoneProps('west_left', 'Premium West LHS')} />
            <text x="80" y="190" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>

            {/* West Right (Premium) */}
            <path d="M 40 350 L 120 350 L 120 450 L 40 450 Z" {...getZoneProps('west_right', 'Premium West RHS')} />
            <text x="80" y="390" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>

            {/* Upper West */}
            <rect x="10" y="150" width="25" height="300" {...getZoneProps('west_upper', 'West Upper')} />
            <text x="22" y="300" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(-90 22 300)" pointerEvents="none">WEST UPPER</text>


            {/* EAST GOAL END (Right - General Side) */}
            {/* East Center (Premium) */}
            <path d="M 680 250 L 760 250 L 760 350 L 680 350 Z" {...getZoneProps('east_center', 'East Center')} />
            <text x="720" y="300" textAnchor="middle" fill="#fff" fontSize="10" transform="rotate(90 720 300)" pointerEvents="none">EAST CENTER</text>

            {/* East Lower (Ends) */}
            <path d="M 680 150 L 760 150 L 760 250 L 680 250 Z" {...getZoneProps('east_lower', 'East Lower LHS')} />
            <text x="720" y="190" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">LOWER EAST</text>

            <path d="M 680 350 L 760 350 L 760 450 L 680 450 Z" {...getZoneProps('east_lower', 'East Lower RHS')} />
            <text x="720" y="390" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">LOWER EAST</text>

            {/* Upper East */}
            <rect x="765" y="150" width="25" height="300" {...getZoneProps('east_upper', 'East Upper')} />
            <text x="777" y="300" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(90 777 300)" pointerEvents="none">EAST UPPER</text>


            {/* Corners */}
            <path d="M 120 100 L 180 120 L 150 150 L 100 150 Z" {...getZoneProps('corner_nw', 'NW Corner')} strokeWidth="1" />
            <text x="140" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">CORNER NW</text>

            <path d="M 620 120 L 680 100 L 700 150 L 650 150 Z" {...getZoneProps('corner_ne', 'NE Corner')} strokeWidth="1" />
            <text x="660" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">CORNER NE</text>

            <path d="M 120 500 L 180 480 L 150 450 L 100 450 Z" {...getZoneProps('corner_sw', 'SW Corner')} strokeWidth="1" />
            <text x="140" y="465" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">CORNER SW</text>

            <path d="M 620 480 L 680 500 L 700 450 L 650 450 Z" {...getZoneProps('corner_se', 'SE Corner')} strokeWidth="1" />
            <text x="660" y="465" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">CORNER SE</text>

            <text x="400" y="595" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">FOOTBALL STADIUM</text>
        </svg>
    );
};

// ============================================================================
// CRICKET STADIUM SVG - 12 Zones (Oval, Vertical Pitch)
// ============================================================================
export const CricketStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            {/* Field */}
            <ellipse cx="400" cy="300" rx="340" ry="240" fill="#2d6a4f" stroke="none" />
            <ellipse cx="400" cy="300" rx="140" ry="100" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="5,5" />
            <rect x="340" y="290" width="120" height="20" fill="#E4D6A7" stroke="#fff" strokeWidth="1" />

            {/* NORTH STAND (Top) */}
            <path d="M 250 40 L 550 40 L 500 90 L 300 90 Z" {...getZoneProps('north_stand', 'North Stand')} />
            <text x="400" y="65" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">NORTH STAND</text>

            {/* SOUTH STAND (Bottom) */}
            <path d="M 300 510 L 500 510 L 550 560 L 250 560 Z" {...getZoneProps('south_stand', 'South Stand')} />
            <text x="400" y="535" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">SOUTH STAND</text>

            {/* WEST PAVILION (Left - VIP/Premium) */}
            <path d="M 40 250 L 100 250 L 100 350 L 40 350 Z" {...getZoneProps('west_center', 'West Pavilion')} strokeWidth="3" />
            <text x="70" y="300" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" transform="rotate(-90 70 300)" pointerEvents="none">PAVILION</text>

            <path d="M 40 150 L 100 170 L 100 250 L 40 250 Z" {...getZoneProps('west_left', 'West Stand A')} />
            <text x="70" y="210" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">STAND A</text>

            <path d="M 40 350 L 100 350 L 100 430 L 40 450 Z" {...getZoneProps('west_right', 'West Stand B')} />
            <text x="70" y="390" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">STAND B</text>


            {/* EAST STAND (Right - General) */}
            <path d="M 760 180 L 700 200 L 700 400 L 760 420 Z" {...getZoneProps('east_stand', 'East Stand')} />
            <text x="730" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(90 730 300)" pointerEvents="none">EAST STAND</text>

            {/* Diagonal Galleries */}
            <path d="M 120 100 L 220 120 L 180 180 Z" {...getZoneProps('corner_nw', 'NW Standard')} strokeWidth="1" />
            <text x="170" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">GALLERY NW</text>

            <path d="M 580 120 L 680 100 L 620 180 Z" {...getZoneProps('corner_ne', 'NE Standard')} strokeWidth="1" />
            <text x="630" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">GALLERY NE</text>

            <path d="M 180 420 L 220 480 L 120 500 Z" {...getZoneProps('corner_sw', 'SW Standard')} strokeWidth="1" />
            <text x="170" y="475" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">GALLERY SW</text>

            <path d="M 620 420 L 580 480 L 680 500 Z" {...getZoneProps('corner_se', 'SE Standard')} strokeWidth="1" />
            <text x="630" y="475" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">GALLERY SE</text>

            {/* Grand Stands (Upper) */}
            <rect x="20" y="150" width="15" height="300" rx="4" {...getZoneProps('west_upper', 'West Upper')} />
            <text x="27" y="250" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(-90 27 250)" pointerEvents="none">UPPER</text>

            <rect x="765" y="150" width="15" height="300" rx="4" {...getZoneProps('east_upper', 'East Upper')} />
            <text x="772" y="250" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(90 772 250)" pointerEvents="none">UPPER</text>

            <text x="400" y="30" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">CRICKET STADIUM</text>
        </svg>
    );
};

// ============================================================================
// KABADDI STADIUM SVG - 8 Zones (Rectangular Mat)
// ============================================================================
export const KabaddiStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            <rect x="250" y="200" width="300" height="200" fill="#EAB308" stroke="#fff" strokeWidth="2" />
            <line x1="400" y1="200" x2="400" y2="400" stroke="#fff" strokeWidth="2" />
            <line x1="320" y1="200" x2="320" y2="400" stroke="#fff" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="480" y1="200" x2="480" y2="400" stroke="#fff" strokeWidth="1" strokeDasharray="3,3" />

            {/* NORTH STAND (Sideline Top) */}
            <path d="M 200 50 L 600 50 L 580 150 L 220 150 Z" {...getZoneProps('north_stand', 'Gallery North')} />
            <text x="400" y="100" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" pointerEvents="none">GALLERY NORTH</text>

            {/* SOUTH STAND (Sideline Bottom) */}
            <path d="M 220 450 L 580 450 L 600 550 L 200 550 Z" {...getZoneProps('south_stand', 'Gallery South')} />
            <text x="400" y="500" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" pointerEvents="none">GALLERY SOUTH</text>

            {/* WEST END - VIP */}
            <path d="M 50 250 L 180 250 L 180 350 L 50 350 Z" {...getZoneProps('west_center', 'VIP Mat-side')} strokeWidth="3" />
            <text x="115" y="300" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" transform="rotate(-90 115 300)" pointerEvents="none">VIP</text>

            <path d="M 50 160 L 180 180 L 180 250 L 50 250 Z" {...getZoneProps('west_left', 'Premium West')} />
            <text x="115" y="190" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>

            <path d="M 50 350 L 180 350 L 180 420 L 50 440 Z" {...getZoneProps('west_right', 'Premium West')} />
            <text x="115" y="380" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>


            {/* EAST END */}
            <path d="M 620 180 L 750 160 L 750 440 L 620 420 Z" {...getZoneProps('east_center', 'East End')} />
            <text x="700" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(90 700 300)" pointerEvents="none">EAST END</text>

            {/* Corners */}
            <rect x="50" y="50" width="100" height="80" {...getZoneProps('corner_nw', 'Corner NW')} />
            <text x="100" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">CORNER NW</text>

            <rect x="650" y="50" width="100" height="80" {...getZoneProps('corner_ne', 'Corner NE')} />
            <text x="700" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">CORNER NE</text>

            <text x="400" y="30" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">KABADDI ARENA</text>
        </svg>
    );
};

// ============================================================================
// BASKETBALL STADIUM SVG - 17 Zones (Horizontal Court)
// ============================================================================
export const BasketballStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            <rect x="150" y="150" width="500" height="300" fill="#D97706" stroke="#fff" strokeWidth="2" />
            <rect x="150" y="150" width="500" height="300" fill="url(#woodPattern)" opacity="0.5" />
            <line x1="400" y1="150" x2="400" y2="450" stroke="#fff" strokeWidth="2" />
            <circle cx="400" cy="300" r="40" fill="none" stroke="#fff" strokeWidth="2" />

            {/* NORTH SIDELINE (Top) */}
            <path d="M 150 100 L 650 100 L 650 140 L 150 140 Z" {...getZoneProps('courtside_north', 'Courtside North')} />
            <text x="400" y="125" textAnchor="middle" fill="#fff" fontSize="8" pointerEvents="none">COURTSIDE</text>

            <path d="M 150 20 L 650 20 L 650 90 L 150 90 Z" {...getZoneProps('north_lower', 'Lower North')} />
            <text x="400" y="45" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">LOWER NORTH</text>


            {/* SOUTH SIDELINE (Bottom) */}
            <path d="M 150 460 L 650 460 L 650 500 L 150 500 Z" {...getZoneProps('courtside_south', 'Courtside South')} />
            <text x="400" y="485" textAnchor="middle" fill="#fff" fontSize="8" pointerEvents="none">COURTSIDE</text>

            <path d="M 150 510 L 650 510 L 650 580 L 150 580 Z" {...getZoneProps('south_lower', 'Lower South')} />
            <text x="400" y="545" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">LOWER SOUTH</text>


            {/* WEST BASKET END (Left) */}
            <path d="M 40 150 L 140 150 L 140 450 L 40 450 Z" {...getZoneProps('west_center', 'Premium West Center')} />
            <text x="90" y="300" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" transform="rotate(-90 90 300)" pointerEvents="none">WEST VIP</text>

            {/* EAST BASKET END (Right) */}
            <path d="M 660 150 L 760 150 L 760 450 L 660 450 Z" {...getZoneProps('east_center', 'Premium East Center')} />
            <text x="710" y="300" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" transform="rotate(90 710 300)" pointerEvents="none">EAST VIP</text>

            {/* Corners (Upper) */}
            <path d="M 20 20 L 120 20 L 120 120 L 20 120 Z" {...getZoneProps('corner_nw', 'NW Corner')} />
            <text x="70" y="50" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">UPPER NW</text>

            <path d="M 680 20 L 780 20 L 780 120 L 680 120 Z" {...getZoneProps('corner_ne', 'NE Corner')} />
            <text x="730" y="50" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">UPPER NE</text>

            <path d="M 20 480 L 120 480 L 120 580 L 20 580 Z" {...getZoneProps('corner_sw', 'SW Corner')} />
            <text x="70" y="515" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">UPPER SW</text>

            <path d="M 680 480 L 780 480 L 780 580 L 680 580 Z" {...getZoneProps('corner_se', 'SE Corner')} />
            <text x="730" y="515" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">UPPER SE</text>

            <text x="400" y="595" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">BASKETBALL ARENA</text>
        </svg>
    );
};

// ============================================================================
// TENNIS STADIUM SVG - 11 Zones (Horizontal Court)
// ============================================================================
export const TennisStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            <rect x="150" y="170" width="500" height="260" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
            <rect x="230" y="170" width="340" height="260" fill="#1D4ED8" stroke="#fff" strokeWidth="2" />
            <line x1="400" y1="170" x2="400" y2="430" stroke="#fff" strokeWidth="2" />

            {/* Courtside North (Sideline) */}
            <path d="M 180 80 L 620 80 L 600 160 L 200 160 Z" {...getZoneProps('north_stand', 'North Sideline')} />
            <text x="400" y="120" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">NORTH SIDELINE</text>

            {/* Courtside South (Sideline) */}
            <path d="M 200 440 L 600 440 L 620 520 L 180 520 Z" {...getZoneProps('south_stand', 'South Sideline')} />
            <text x="400" y="480" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">SOUTH SIDELINE</text>

            {/* West Baseline */}
            <path d="M 40 180 L 140 180 L 140 420 L 40 420 Z" {...getZoneProps('west_center', 'West Baseline')} />
            <text x="90" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(-90 90 300)" pointerEvents="none">WEST BASELINE</text>

            {/* East Baseline */}
            <path d="M 660 180 L 760 180 L 760 420 L 660 420 Z" {...getZoneProps('east_center', 'East Baseline')} />
            <text x="710" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(90 710 300)" pointerEvents="none">EAST BASELINE</text>

            {/* Courtside Corners (Premium) */}
            <path d="M 180 80 L 140 180 L 200 160 Z" {...getZoneProps('courtside_west', 'Courtside West')} />
            <text x="170" y="140" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" pointerEvents="none">COURTSIDE</text>

            <path d="M 620 80 L 660 180 L 600 160 Z" {...getZoneProps('courtside_east', 'Courtside East')} />
            <text x="630" y="140" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" pointerEvents="none">COURTSIDE</text>

            {/* Upper Corners */}
            <path d="M 40 80 L 100 80 L 100 160 L 40 160 Z" {...getZoneProps('corner_nw', 'NW Upper')} />
            <text x="70" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">UPPER NW</text>

            <path d="M 700 80 L 760 80 L 760 160 L 700 160 Z" {...getZoneProps('corner_ne', 'NE Upper')} />
            <text x="730" y="125" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">UPPER NE</text>

            <text x="400" y="30" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">TENNIS COURT</text>
        </svg>
    );
};

// ============================================================================
// HOCKEY STADIUM SVG - 12 Zones (Horizontal Field)
// ============================================================================
export const HockeyStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            <rect x="150" y="150" width="500" height="300" fill="#0EA5E9" stroke="#fff" strokeWidth="2" />
            <line x1="400" y1="150" x2="400" y2="450" stroke="#fff" strokeWidth="2" />
            <circle cx="400" cy="300" r="40" fill="none" stroke="#fff" strokeWidth="2" />

            {/* Sideline North (Top) */}
            <path d="M 150 50 L 650 50 L 650 140 L 150 140 Z" {...getZoneProps('north_stand', 'North Sideline')} />
            <text x="400" y="95" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">NORTH SIDELINE</text>

            {/* Sideline South (Bottom) */}
            <path d="M 150 460 L 650 460 L 650 550 L 150 550 Z" {...getZoneProps('south_stand', 'South Sideline')} />
            <text x="400" y="505" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">SOUTH SIDELINE</text>

            {/* Goal End West - VIP */}
            <path d="M 40 250 L 140 250 L 140 350 L 40 350 Z" {...getZoneProps('west_center', 'VIP Center')} strokeWidth="3" />
            <text x="90" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(-90 90 300)" pointerEvents="none">VIP</text>

            <path d="M 40 150 L 140 150 L 140 250 L 40 250 Z" {...getZoneProps('west_left', 'Premium West')} />
            <text x="90" y="190" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>

            <path d="M 40 350 L 140 350 L 140 450 L 40 450 Z" {...getZoneProps('west_right', 'Premium West')} />
            <text x="90" y="390" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">PREMIUM WEST</text>


            {/* Goal End East (Right) */}
            <path d="M 660 150 L 760 150 L 760 450 L 660 450 Z" {...getZoneProps('east_center', 'East Goal End')} />
            <text x="710" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(90 710 300)" pointerEvents="none">EAST GOAL END</text>

            {/* Corners / Upper */}
            <rect x="40" y="50" width="100" height="90" {...getZoneProps('corner_nw', 'Upper NW')} />
            <text x="90" y="95" textAnchor="middle" fill="#fff" fontSize="8" pointerEvents="none">UPPER NW</text>

            <rect x="660" y="50" width="100" height="90" {...getZoneProps('corner_ne', 'Upper NE')} />
            <text x="710" y="95" textAnchor="middle" fill="#fff" fontSize="8" pointerEvents="none">UPPER NE</text>

            <text x="400" y="30" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">HOCKEY STADIUM</text>
        </svg>
    );
};

// ============================================================================
// ATHLETICS STADIUM SVG - 13 Zones (Olympic Style | Horizontal Oval)
// ============================================================================
export const AthleticsStadiumSvg = ({ onZoneClick, zoneConfigs = {}, activeZones = [], className }) => {
    const { getZoneProps } = useZoneHelpers(zoneConfigs, onZoneClick, activeZones);

    // Track Dimensions
    const cx = 400;
    const cy = 300;

    // Helper to draw lanes
    const renderLanes = () => {
        const lanes = [];
        for (let i = 0; i < 8; i++) {
            lanes.push(
                <ellipse
                    key={i}
                    cx={cx} cy={cy}
                    rx={280 - (i * 10)}
                    ry={180 - (i * 10)}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                />
            );
        }
        return lanes;
    };

    return (
        <svg viewBox="0 0 800 600" className={cn("w-full h-full", className)}>
            {/* BACKGROUND BASE */}
            <rect x="0" y="0" width="800" height="600" fill="#f8fafc" />

            {/* TRACK SURFACE (Red Rubber) */}
            <ellipse cx={cx} cy={cy} rx="290" ry="190" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />

            {/* REALISTIC LANES (8 Lanes) */}
            {renderLanes()}

            {/* INFIELD (Green Grass) */}
            <rect x={cx - 150} y={cy - 90} width="300" height="180" rx="20" fill="#22c55e" stroke="#fff" strokeWidth="2" />

            {/* Football/Field Markings */}
            <rect x={cx - 150} y={cy - 90} width="300" height="180" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1={cx} y1={cy - 90} x2={cx} y2={cy + 90} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

            {/* 1. WEST CURVE (Left End) */}
            <path d="M 40 220 L 100 230 L 100 370 L 40 380 Q 20 300 40 220 Z" {...getZoneProps('west_center', 'West Curve (VIP)')} />
            <text x="70" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(-90 70 300)" pointerEvents="none">WEST CURVE</text>

            {/* Block A (West Top) */}
            <path d="M 60 120 L 110 140 L 100 220 L 40 210 Z" {...getZoneProps('west_left', 'West Curve A')} />
            <text x="85" y="160" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">BLOCK A</text>

            {/* Block B (West Bottom) */}
            <path d="M 40 390 L 100 380 L 110 460 L 60 480 Z" {...getZoneProps('west_right', 'West Curve B')} />
            <text x="85" y="440" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">BLOCK B</text>


            {/* 2. EAST CURVE (Right End) */}
            <path d="M 760 220 L 700 230 L 700 370 L 760 380 Q 780 300 760 220 Z" {...getZoneProps('east_stand', 'East Curve')} />
            <text x="730" y="300" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" transform="rotate(90 730 300)" pointerEvents="none">EAST CURVE</text>

            {/* Block C (East Top) */}
            <path d="M 740 120 L 690 140 L 700 220 L 760 210 Z" {...getZoneProps('east_lower', 'East Curve C')} />
            <text x="730" y="160" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">BLOCK C</text>

            {/* Block D (East Bottom) */}
            <path d="M 760 390 L 700 380 L 690 460 L 740 480 Z" {...getZoneProps('east_lower', 'East Curve D')} />
            <text x="730" y="440" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">BLOCK D</text>


            {/* 3. NORTH STRAIGHT (Top Main Stand) */}
            <path d="M 250 50 L 550 50 L 520 100 L 280 100 Z" {...getZoneProps('north_lower', 'North Straight')} />
            <text x="400" y="80" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">NORTH STRAIGHT</text>

            <rect x="250" y="20" width="300" height="25" {...getZoneProps('north_upper', 'North Upper')} />
            <text x="400" y="32" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">UPPER TIER</text>


            {/* 4. SOUTH STRAIGHT (Bottom Main Stand) */}
            <path d="M 280 500 L 520 500 L 550 550 L 250 550 Z" {...getZoneProps('south_lower', 'South Straight')} />
            <text x="400" y="530" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">SOUTH STRAIGHT</text>

            <rect x="250" y="555" width="300" height="25" {...getZoneProps('south_upper', 'South Upper')} />
            <text x="400" y="570" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" pointerEvents="none">UPPER TIER</text>

            {/* TRACKSIDE SEATS */}
            <rect x="115" y="230" width="30" height="140" {...getZoneProps('west_lower', 'Trackside West')} />
            <text x="130" y="300" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(-90 130 300)">TRACKSIDE</text>

            <rect x="655" y="230" width="30" height="140" {...getZoneProps('east_lower', 'Trackside East')} />
            <text x="670" y="300" textAnchor="middle" fill="#fff" fontSize="8" transform="rotate(90 670 300)" pointerEvents="none">TRACKSIDE</text>


            <text x="400" y="595" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">ATHLETICS STADIUM (OLYMPIC)</text>
        </svg>
    );
};
