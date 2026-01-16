// ============================================================================
// STADIUM SEATING CATEGORIES - SPORT-SPECIFIC WITH SPATIAL ANCHORS
// ============================================================================
// Each sport has precise category definitions with exact spatial locations
// following the global stadium coordinate system:
//
//            NORTH STAND
//        -------------------
//        |                 |
// WEST   |   PLAY AREA     |   EAST
// STAND  |                 |   STAND
//        -------------------
//            SOUTH STAND
// ============================================================================

/**
 * Spatial Anchor Types
 * These define exact locations on the stadium map
 */
export const ANCHORS = {
    // Cardinal directions
    NORTH: 'NORTH',
    SOUTH: 'SOUTH',
    EAST: 'EAST',
    WEST: 'WEST',

    // Center positions
    WEST_CENTER: 'WEST_CENTER',
    EAST_CENTER: 'EAST_CENTER',
    NORTH_CENTER: 'NORTH_CENTER',
    SOUTH_CENTER: 'SOUTH_CENTER',

    // Goal/End positions
    NORTH_GOAL: 'NORTH_GOAL',
    SOUTH_GOAL: 'SOUTH_GOAL',

    // Boundary positions (Cricket)
    BOUNDARY_NORTH: 'BOUNDARY_NORTH',
    BOUNDARY_SOUTH: 'BOUNDARY_SOUTH',

    // Special positions
    PAVILION: 'PAVILION', // Cricket: WEST_CENTER
    FINISH_LINE: 'FINISH_LINE', // Athletics: WEST
    COURTSIDE: 'COURTSIDE', // Basketball/Tennis: Around edges
    MAT_SIDE: 'MAT_SIDE', // Kabaddi: WEST front

    // Tier levels
    LOWER_TIER: 'LOWER_TIER',
    UPPER_TIER: 'UPPER_TIER',

    // Corners
    CORNER_NE: 'CORNER_NE',
    CORNER_NW: 'CORNER_NW',
    CORNER_SE: 'CORNER_SE',
    CORNER_SW: 'CORNER_SW',

    // All sides
    ALL_SIDES: 'ALL_SIDES',
    ALL_UPPER: 'ALL_UPPER',
    ALL_LOWER: 'ALL_LOWER'
};

/**
 * Sport-specific seating categories with spatial anchors
 */
export const STADIUM_CATEGORIES = {

    // ========================================================================
    // 🏏 CRICKET - Asymmetrical (Pavilion-centric)
    // ========================================================================
    'Cricket': [
        {
            name: 'VIP Pavilion',
            anchor: ANCHORS.PAVILION, // WEST_CENTER only
            description: 'Premium seats directly behind pitch',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium West',
            anchor: ANCHORS.WEST,
            description: 'West stand adjacent to pavilion',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'Lower Tier East',
            anchor: [ANCHORS.EAST, ANCHORS.LOWER_TIER],
            description: 'East stand lower rows',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Upper Tier East',
            anchor: [ANCHORS.EAST, ANCHORS.UPPER_TIER],
            description: 'East stand upper rows',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Boundary North',
            anchor: ANCHORS.BOUNDARY_NORTH,
            description: 'Behind north boundary',
            tier: 'standard',
            color: '#06b6d4'
        },
        {
            name: 'Boundary South',
            anchor: ANCHORS.BOUNDARY_SOUTH,
            description: 'Behind south boundary',
            tier: 'standard',
            color: '#14b8a6'
        },
        {
            name: 'Gallery',
            anchor: [ANCHORS.CORNER_NE, ANCHORS.CORNER_NW, ANCHORS.CORNER_SE, ANCHORS.CORNER_SW],
            description: 'Corner seating areas',
            tier: 'economy',
            color: '#10b981'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.PAVILION, ANCHORS.LOWER_TIER],
            description: 'Wheelchair accessible near pavilion',
            tier: 'accessible',
            color: '#84cc16'
        }
    ],

    // ========================================================================
    // ⚽ FOOTBALL - Symmetrical (Goal-focused)
    // ========================================================================
    'Football': [
        {
            name: 'VIP Box',
            anchor: ANCHORS.WEST_CENTER,
            description: 'Center of west stand (halfway line)',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium Center',
            anchor: [ANCHORS.WEST_CENTER, ANCHORS.EAST_CENTER],
            description: 'Center blocks of main stands',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'Lower Tier',
            anchor: [ANCHORS.ALL_SIDES, ANCHORS.LOWER_TIER],
            description: 'Closest rows to pitch (all sides)',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Upper Tier',
            anchor: [ANCHORS.ALL_SIDES, ANCHORS.UPPER_TIER],
            description: 'Upper rows (all sides)',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Home End',
            anchor: ANCHORS.SOUTH_GOAL,
            description: 'Behind south goal',
            tier: 'fan_zone',
            color: '#06b6d4'
        },
        {
            name: 'Away End',
            anchor: ANCHORS.NORTH_GOAL,
            description: 'Behind north goal',
            tier: 'fan_zone',
            color: '#14b8a6'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.WEST, ANCHORS.LOWER_TIER],
            description: 'Near tunnel entrance',
            tier: 'accessible',
            color: '#84cc16'
        },
        {
            name: 'Corner',
            anchor: [ANCHORS.CORNER_NE, ANCHORS.CORNER_NW, ANCHORS.CORNER_SE, ANCHORS.CORNER_SW],
            description: 'Corner seating areas',
            tier: 'economy',
            color: '#f59e0b'
        }
    ],

    // ========================================================================
    // 🤼 KABADDI - Compact & Frontal (West-dominant)
    // ========================================================================
    'Kabaddi': [
        {
            name: 'VIP Mat-side',
            anchor: [ANCHORS.MAT_SIDE, ANCHORS.WEST_CENTER],
            description: 'Front rows west center',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium',
            anchor: [ANCHORS.WEST, ANCHORS.EAST],
            description: 'Middle blocks of main viewing sides',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'General East',
            anchor: ANCHORS.EAST,
            description: 'East stand general seating',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Gallery North',
            anchor: ANCHORS.NORTH,
            description: 'North end seating',
            tier: 'economy',
            color: '#0ea5e9'
        },
        {
            name: 'Gallery South',
            anchor: ANCHORS.SOUTH,
            description: 'South end seating',
            tier: 'economy',
            color: '#06b6d4'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.WEST_CENTER, ANCHORS.LOWER_TIER],
            description: 'Near west center aisle',
            tier: 'accessible',
            color: '#84cc16'
        }
    ],

    // ========================================================================
    // 🏀 BASKETBALL - Center-focused (Not end-focused)
    // ========================================================================
    'Basketball': [
        {
            name: 'Courtside VIP',
            anchor: ANCHORS.COURTSIDE,
            description: 'Around court edges',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium Center',
            anchor: [ANCHORS.WEST_CENTER, ANCHORS.EAST_CENTER],
            description: 'Center sections of main sides',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'Lower Tier',
            anchor: [ANCHORS.ALL_SIDES, ANCHORS.LOWER_TIER],
            description: 'Lower rows all sides',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Upper Tier',
            anchor: [ANCHORS.ALL_SIDES, ANCHORS.UPPER_TIER],
            description: 'Upper rows all sides',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Behind Basket North',
            anchor: ANCHORS.NORTH,
            description: 'Behind north basket',
            tier: 'standard',
            color: '#06b6d4'
        },
        {
            name: 'Behind Basket South',
            anchor: ANCHORS.SOUTH,
            description: 'Behind south basket',
            tier: 'standard',
            color: '#14b8a6'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.COURTSIDE, ANCHORS.WEST],
            description: 'Courtside entry points',
            tier: 'accessible',
            color: '#84cc16'
        }
    ],

    // ========================================================================
    // 🎾 TENNIS - Side-dominant (Baseline vs Sideline)
    // ========================================================================
    'Tennis': [
        {
            name: 'Courtside Premium',
            anchor: [ANCHORS.COURTSIDE, ANCHORS.WEST, ANCHORS.EAST],
            description: 'Along sidelines',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium Mid',
            anchor: [ANCHORS.WEST_CENTER, ANCHORS.EAST_CENTER],
            description: 'Mid rows of sideline stands',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'Baseline North',
            anchor: ANCHORS.NORTH,
            description: 'Behind north baseline',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Baseline South',
            anchor: ANCHORS.SOUTH,
            description: 'Behind south baseline',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Upper Gallery',
            anchor: ANCHORS.ALL_UPPER,
            description: 'Upper rows all sides',
            tier: 'economy',
            color: '#06b6d4'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.WEST, ANCHORS.LOWER_TIER],
            description: 'Near umpire chair side',
            tier: 'accessible',
            color: '#84cc16'
        }
    ],

    // ========================================================================
    // 🏑 HOCKEY - Similar to Football (Lower seating priority)
    // ========================================================================
    'Hockey': [
        {
            name: 'VIP Center',
            anchor: ANCHORS.WEST_CENTER,
            description: 'West stand center',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium',
            anchor: [ANCHORS.WEST, ANCHORS.EAST],
            description: 'Center blocks of main stands',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'General East',
            anchor: ANCHORS.EAST,
            description: 'East stand general seating',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Goal End North',
            anchor: ANCHORS.NORTH_GOAL,
            description: 'Behind north goal',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Goal End South',
            anchor: ANCHORS.SOUTH_GOAL,
            description: 'Behind south goal',
            tier: 'standard',
            color: '#06b6d4'
        },
        {
            name: 'Upper Gallery',
            anchor: ANCHORS.ALL_UPPER,
            description: 'Upper rows (flatter stadiums)',
            tier: 'economy',
            color: '#14b8a6'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.WEST, ANCHORS.LOWER_TIER],
            description: 'Lower west stand',
            tier: 'accessible',
            color: '#84cc16'
        },
        {
            name: 'Corner',
            anchor: [ANCHORS.CORNER_NE, ANCHORS.CORNER_NW, ANCHORS.CORNER_SE, ANCHORS.CORNER_SW],
            description: 'Corner seating areas',
            tier: 'economy',
            color: '#f59e0b'
        }
    ],

    // ========================================================================
    // 🏃 ATHLETICS - Finish Line is Everything
    // ========================================================================
    'Athletics': [
        {
            name: 'VIP Finish Line',
            anchor: [ANCHORS.FINISH_LINE, ANCHORS.WEST],
            description: 'Finish line side (west)',
            tier: 'premium',
            color: '#8b5cf6'
        },
        {
            name: 'Premium West',
            anchor: ANCHORS.WEST,
            description: 'Adjacent to finish line',
            tier: 'premium',
            color: '#6366f1'
        },
        {
            name: 'Trackside',
            anchor: [ANCHORS.ALL_SIDES, ANCHORS.LOWER_TIER],
            description: 'Closest rows to track',
            tier: 'standard',
            color: '#3b82f6'
        },
        {
            name: 'Curve View East',
            anchor: ANCHORS.EAST,
            description: 'East stand (curve view)',
            tier: 'standard',
            color: '#0ea5e9'
        },
        {
            name: 'Upper Gallery',
            anchor: ANCHORS.ALL_UPPER,
            description: 'Upper rows all stands',
            tier: 'economy',
            color: '#06b6d4'
        },
        {
            name: 'Accessible',
            anchor: [ANCHORS.FINISH_LINE, ANCHORS.LOWER_TIER],
            description: 'Finish line level',
            tier: 'accessible',
            color: '#84cc16'
        }
    ]
};

/**
 * Get categories for a specific sport
 */
export const getCategoriesForSport = (sport) => {
    return STADIUM_CATEGORIES[sport] || [];
};

/**
 * Get default category names for a sport (for backward compatibility)
 */
export const getDefaultCategoryNames = (sport) => {
    const categories = getCategoriesForSport(sport);
    return categories.map(cat => cat.name);
};

/**
 * Get category by name for a sport
 */
export const getCategoryByName = (sport, categoryName) => {
    const categories = getCategoriesForSport(sport);
    return categories.find(cat => cat.name === categoryName);
};

/**
 * Validate if a category exists for a sport
 */
export const isCategoryValid = (sport, categoryName) => {
    return getCategoryByName(sport, categoryName) !== undefined;
};

/**
 * Get all categories grouped by tier
 */
export const getCategoriesByTier = (sport) => {
    const categories = getCategoriesForSport(sport);
    return categories.reduce((acc, cat) => {
        if (!acc[cat.tier]) acc[cat.tier] = [];
        acc[cat.tier].push(cat);
        return acc;
    }, {});
};
