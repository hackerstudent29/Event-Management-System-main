import React from 'react';
import { cn } from '@/lib/utils';

export const SvgWrapper = ({ children, className, viewBox = "0 0 800 600" }) => (
    <svg viewBox={viewBox} className={cn("w-full h-auto bg-white rounded-lg shadow-sm border border-slate-200 select-none", className)}>
        {children}
    </svg>
);

export const Zone = ({ id, path, x, y, width, height, label, type, selected, occupied, onClick, className, color, onMouseEnter, onMouseLeave }) => {
    const isOccupied = occupied;
    const isSelected = selected;

    // Base styles - use custom color ONLY if provided, otherwise grey for unconfigured
    const hasColor = color && color !== undefined;
    const fill = isOccupied ? '#CBD5E1' : (isSelected ? (hasColor ? color : '#3B82F6') : (hasColor ? color : '#E2E8F0'));
    const stroke = isSelected ? '#FBBF24' : (hasColor ? '#94A3B8' : '#CBD5E1'); // Gold for selection
    const strokeWidth = isSelected ? 5 : 1;
    const shadowColor = isSelected ? 'rgba(251, 191, 36, 0.8)' : 'transparent'; // Stronger gold glow

    return (
        <g
            onClick={(e) => {
                e.stopPropagation();
                if (!isOccupied && onClick) onClick(id);
            }}
            onMouseEnter={() => !isOccupied && onMouseEnter && onMouseEnter(id)}
            onMouseLeave={() => !isOccupied && onMouseLeave && onMouseLeave(id)}
            className={cn(
                "transition-all duration-300 cursor-pointer pointer-events-auto hover:opacity-80",
                isOccupied && "cursor-not-allowed hover:opacity-100",
                isSelected && "brightness-125 z-10",
                className
            )}
        >
            {path ? (
                <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{ filter: isSelected ? `drop-shadow(0 0 12px ${shadowColor})` : 'none', transition: 'all 0.4s ease' }} />
            ) : (
                <rect x={x} y={y} width={width} height={height} rx="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{ filter: isSelected ? `drop-shadow(0 0 12px ${shadowColor})` : 'none', transition: 'all 0.4s ease' }} />
            )}

            {/* Label */}
            {label && (
                <text
                    x={x + width / 2 || 0}
                    y={y + height / 2 || 0}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-white pointer-events-none uppercase tracking-wider drop-shadow-lg"
                    style={{ fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                    {path ? null : label}
                </text>
            )}
        </g>
    );
};
