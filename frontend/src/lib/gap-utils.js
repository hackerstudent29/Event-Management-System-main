// ============================================================================
// GAP CALCULATION UTILITIES
// Implements strict gap rules per theatre subtype specification
// ============================================================================

/**
 * Calculate gap positions based on gap rule type
 * @param {number} seatsPerRow - Total seats in the row
 * @param {string} gapRule - 'none', 'midpoint', or 'every4'
 * @returns {number[]} - Array of column positions where gaps should appear
 */
export const calculateGapPositions = (seatsPerRow, gapRule) => {
    if (!gapRule || gapRule === 'none') return [];

    if (gapRule === 'midpoint') {
        // Split at exact midpoint: 10|GAP|10 for 20 seats
        return [Math.floor(seatsPerRow / 2)];
    }

    if (gapRule === 'every4') {
        // Gap after every 4 seats: 4|GAP|4|GAP|4|GAP|4
        const gaps = [];
        for (let i = 4; i < seatsPerRow; i += 4) {
            gaps.push(i);
        }
        return gaps;
    }

    return [];
};

/**
 * Calculate X position for a seat with gaps
 * @param {number} col - Column number (1-indexed)
 * @param {number} seatSize - Width of each seat
 * @param {number} seatGap - Gap between seats
 * @param {number} gridStartX - Starting X position
 * @param {number[]} gapPositions - Array of gap positions
 * @param {number} gapWidth - Width of aisle gap (default: seatGap * 2)
 * @returns {number} - X coordinate for the seat
 */
export const calculateSeatX = (col, seatSize, seatGap, gridStartX, gapPositions, gapWidth = null) => {
    const actualGapWidth = gapWidth || (seatGap * 2);
    const gapsBefore = gapPositions.filter(g => g < col).length;
    const aisleOffset = gapsBefore * actualGapWidth;
    return gridStartX + (col - 1) * (seatSize + seatGap) + aisleOffset;
};

/**
 * Validate seat count for 4DX (STRICT)
 * @param {number} seatsPerRow - Proposed seats per row
 * @returns {boolean} - True if valid
 */
export const validate4DXSeatCount = (seatsPerRow) => {
    const allowedCounts = [4, 8, 12, 16];
    return allowedCounts.includes(seatsPerRow);
};

/**
 * Get gap rule for a theatre subtype
 * @param {string} subtype - Theatre subtype
 * @returns {string} - Gap rule ('none', 'midpoint', 'every4')
 */
export const getGapRuleForSubtype = (subtype) => {
    const rules = {
        'IMAX': 'none',
        'Standard Cinema': 'midpoint',
        'Dolby Atmos': 'midpoint',
        '4DX': 'every4',
        'ScreenX': 'none',
        'Drive-In': 'none',
        'Premium Lounge': 'midpoint',
        'Outdoor Cinema': 'midpoint',
        // Fallback for uppercase keys if used elsewhere
        'STANDARD_CINEMA': 'midpoint',
        'DOLBY_ATMOS': 'midpoint',
        'SCREENX': 'none',
        'DRIVE_IN': 'none',
        'PREMIUM_LOUNGE': 'midpoint',
        'OUTDOOR_CINEMA': 'midpoint'
    };
    return rules[subtype] || 'none';
};

export default {
    calculateGapPositions,
    calculateSeatX,
    validate4DXSeatCount,
    getGapRuleForSubtype
};
