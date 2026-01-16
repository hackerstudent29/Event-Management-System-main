// ============================================================================
// THEATRE LAYOUT CONFIGURATIONS (LOCKED PER SPEC)
// Enforces strict business rules for each theatre subtype
// ============================================================================

export const THEATRE_LAYOUT_RULES = {
    // IMAX - No gaps, continuous rows, max 400 seats
    IMAX: {
        maxCapacity: 400,
        allowGaps: false,
        allowedSeatsPerRow: null, // Any count up to capacity
        categories: ['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony'],
        defaultLayout: {
            rows: 14,
            seatsPerRow: 20,
            zones: {
                'Front Row': [1, 2],
                'Standard': [3, 4, 5],
                'VIP': [6, 7, 8, 9],
                'Elite': [10, 11, 12],
                'Balcony': [13, 14]
            }
        }
    },

    // Standard Cinema - Gaps at midpoint, max 320 seats
    STANDARD_CINEMA: {
        maxCapacity: 320,
        allowGaps: true,
        gapPosition: 'midpoint', // Split at 50%
        categories: ['Platinum', 'Gold', 'Silver', 'Front Row', 'Balcony'],
        defaultLayout: {
            rows: 12,
            seatsPerRow: 18,
            zones: {
                'Front Row': [1, 2],
                'Silver': [3, 4, 5, 6],
                'Gold': [7, 8, 9],
                'Platinum': [10, 11, 12]
            }
        }
    },

    // Dolby Atmos - Gaps at midpoint, max 260 seats
    DOLBY_ATMOS: {
        maxCapacity: 260,
        allowGaps: true,
        gapPosition: 'midpoint',
        categories: ['Premium', 'Gold', 'Silver', 'Front Row', 'Recliner'],
        defaultLayout: {
            rows: 12,
            seatsPerRow: 18,
            zones: {
                'Front Row': [1, 2],
                'Silver': [3, 4, 5],
                'Gold': [6, 7, 8, 9],
                'Recliner': [10, 11, 12]
            }
        }
    },

    // 4DX - STRICT: Only 4, 8, 12, 16 seats per row, gaps every 4 seats, max 160
    '4DX': {
        maxCapacity: 160,
        allowGaps: true,
        gapPosition: 'every4', // Gap after every 4 seats
        allowedSeatsPerRow: [4, 8, 12, 16],
        categories: ['Motion Premium', 'Motion Standard', 'Rear Safe Zone'],
        defaultLayout: {
            rows: 10,
            seatsPerRow: 16,
            zones: {
                'Rear Safe Zone': [1],
                'Motion Premium': [2, 3, 4, 5],
                'Motion Standard': [6, 7, 8, 9, 10]
            }
        }
    },

    // ScreenX - FIXED LAYOUT: Cannot be changed by admin
    SCREENX: {
        maxCapacity: 180,
        allowGaps: false,
        isFixed: true, // Admin cannot change seat counts
        categories: ['Immersion Center', 'Side Immersion', 'Standard', 'Rear'],
        fixedLayout: {
            // Pyramid layout: 8→10→12→14→16→18→20→20→20→20→22
            rows: [
                { row: 1, seats: 8, category: 'Rear' },
                { row: 2, seats: 10, category: 'Rear' },
                { row: 3, seats: 12, category: 'Standard' },
                { row: 4, seats: 14, category: 'Standard' },
                { row: 5, seats: 16, category: 'Standard' },
                { row: 6, seats: 18, category: 'Side Immersion' },
                { row: 7, seats: 20, category: 'Immersion Center' },
                { row: 8, seats: 20, category: 'Immersion Center' },
                { row: 9, seats: 20, category: 'Immersion Center' },
                { row: 10, seats: 20, category: 'Immersion Center' },
                { row: 11, seats: 22, category: 'Side Immersion' }
            ]
        }
    },

    // Drive-In - No gaps, parking grid, max 100 cars
    DRIVE_IN: {
        maxCapacity: 100,
        allowGaps: false,
        isParking: true,
        categories: ['Front Parking', 'Middle Parking', 'Rear Parking', 'SUV'],
        defaultLayout: {
            rows: 6,
            spotsPerRow: 10,
            zones: {
                'Front Parking': [1, 2],
                'Middle Parking': [3, 4],
                'Rear Parking': [5, 6]
            }
        }
    },

    // Premium Lounge - Optional gaps, wider seats
    PREMIUM_LOUNGE: {
        maxCapacity: 96,
        allowGaps: true,
        gapPosition: 'midpoint',
        categories: ['Recliner Premium', 'Recliner Standard'],
        defaultLayout: {
            rows: 8,
            seatsPerRow: 12,
            zones: {
                'Recliner Premium': [1, 2, 3, 4],
                'Recliner Standard': [5, 6, 7, 8]
            }
        }
    },

    // VIP Pods - Fixed pod count, sold per pod
    VIP_PODS: {
        maxCapacity: 24,
        allowGaps: true,
        isPods: true,
        categories: ['VIP Pod'],
        defaultLayout: {
            rows: 4,
            podsPerRow: 6,
            zones: {
                'VIP Pod': [1, 2, 3, 4]
            }
        }
    },

    // Outdoor Cinema - Gaps allowed, flexible
    OUTDOOR_CINEMA: {
        maxCapacity: 200,
        allowGaps: true,
        gapPosition: 'midpoint',
        categories: ['Premium Chairs', 'Standard Chairs', 'Back Lawn'],
        defaultLayout: {
            rows: 10,
            seatsPerRow: 16,
            zones: {
                'Premium Chairs': [1, 2, 3],
                'Standard Chairs': [4, 5, 6, 7],
                'Back Lawn': [8, 9, 10]
            }
        }
    }
};

// Helper: Get gap positions for a given seat count and rule
export const calculateGapPositions = (seatsPerRow, gapRule) => {
    if (!gapRule || gapRule === 'none') return [];

    if (gapRule === 'midpoint') {
        return [Math.floor(seatsPerRow / 2)];
    }

    if (gapRule === 'every4') {
        const gaps = [];
        for (let i = 4; i < seatsPerRow; i += 4) {
            gaps.push(i);
        }
        return gaps;
    }

    return [];
};

// Helper: Validate seat count for subtype
export const validateSeatCount = (subtype, seatsPerRow) => {
    const rules = THEATRE_LAYOUT_RULES[subtype];
    if (!rules) return { valid: false, error: 'Invalid subtype' };

    // Check if fixed layout
    if (rules.isFixed) {
        return { valid: false, error: 'This layout cannot be modified' };
    }

    // Check allowed seats per row
    if (rules.allowedSeatsPerRow && !rules.allowedSeatsPerRow.includes(seatsPerRow)) {
        return {
            valid: false,
            error: `Only ${rules.allowedSeatsPerRow.join(', ')} seats per row allowed for ${subtype}`
        };
    }

    return { valid: true };
};

// Helper: Calculate total capacity
export const calculateCapacity = (rows, seatsPerRow) => {
    if (Array.isArray(rows)) {
        // Fixed layout (like ScreenX)
        return rows.reduce((sum, row) => sum + row.seats, 0);
    }
    return rows * seatsPerRow;
};

// Helper: Validate total capacity
export const validateCapacity = (subtype, totalSeats) => {
    const rules = THEATRE_LAYOUT_RULES[subtype];
    if (!rules) return { valid: false, error: 'Invalid subtype' };

    if (totalSeats > rules.maxCapacity) {
        return {
            valid: false,
            error: `Exceeds maximum capacity of ${rules.maxCapacity} for ${subtype}`
        };
    }

    return { valid: true };
};

export default THEATRE_LAYOUT_RULES;
