// ============================================================================
// STADIUM ZONE MAPPING - Maps categories to visual zone IDs
// ============================================================================
// This defines which visual zone on the SVG corresponds to which category
// for each sport. When a sport is selected, these zones are auto-populated.
// ============================================================================

/**
 * Zone mapping for each sport
 * Key: Sport name (must match EVENT_SUBTYPES)
 * Value: Array of { zoneId, categoryName }
 * 
 * zoneId: The ID of the zone in the SVG (e.g., 'west_center', 'north_stand')
 * categoryName: The category name from stadium-categories.js
 */
export const SPORT_ZONE_MAPPING = {

    // ========================================================================
    // 🏏 CRICKET - 8 Categories
    // ========================================================================
    'Cricket': [
        { zoneId: 'west_center', categoryName: 'VIP Pavilion' },
        { zoneId: 'west_left', categoryName: 'Premium West' },
        { zoneId: 'west_right', categoryName: 'Premium West' },
        { zoneId: 'west_upper', categoryName: 'Premium West' },
        { zoneId: 'east_stand', categoryName: 'Lower Tier East' },
        { zoneId: 'east_upper', categoryName: 'Upper Tier East' },
        { zoneId: 'north_stand', categoryName: 'Boundary North' },
        { zoneId: 'south_stand', categoryName: 'Boundary South' },
        { zoneId: 'corner_ne', categoryName: 'Gallery' },
        { zoneId: 'corner_nw', categoryName: 'Gallery' },
        { zoneId: 'corner_se', categoryName: 'Gallery' },
        { zoneId: 'corner_sw', categoryName: 'Gallery' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // ⚽ FOOTBALL - 11 Categories
    // ========================================================================
    'Football': [
        { zoneId: 'west_center', categoryName: 'VIP Box' },
        { zoneId: 'west_left', categoryName: 'Premium Center' },
        { zoneId: 'west_right', categoryName: 'Premium Center' },
        { zoneId: 'east_center', categoryName: 'Premium Center' },
        { zoneId: 'west_lower', categoryName: 'Lower Tier' },
        { zoneId: 'east_lower', categoryName: 'Lower Tier' },
        { zoneId: 'north_lower', categoryName: 'Lower Tier' },
        { zoneId: 'south_lower', categoryName: 'Lower Tier' },
        { zoneId: 'west_upper', categoryName: 'Upper Tier' },
        { zoneId: 'east_upper', categoryName: 'Upper Tier' },
        { zoneId: 'north_upper', categoryName: 'Upper Tier' },
        { zoneId: 'south_upper', categoryName: 'Upper Tier' },
        { zoneId: 'south_stand', categoryName: 'Home End' },
        { zoneId: 'north_stand', categoryName: 'Away End' },
        { zoneId: 'corner_nw', categoryName: 'Corner' },
        { zoneId: 'corner_ne', categoryName: 'Corner' },
        { zoneId: 'corner_sw', categoryName: 'Corner' },
        { zoneId: 'corner_se', categoryName: 'Corner' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // 🤼 KABADDI - 6 Categories
    // ========================================================================
    'Kabaddi': [
        { zoneId: 'west_center', categoryName: 'VIP Mat-side' },
        { zoneId: 'west_left', categoryName: 'Premium' },
        { zoneId: 'west_right', categoryName: 'Premium' },
        { zoneId: 'east_center', categoryName: 'Premium' },
        { zoneId: 'east_stand', categoryName: 'General East' },
        { zoneId: 'north_stand', categoryName: 'Gallery North' },
        { zoneId: 'south_stand', categoryName: 'Gallery South' },
        { zoneId: 'corner_nw', categoryName: 'Gallery North' },
        { zoneId: 'corner_ne', categoryName: 'Gallery North' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // 🏀 BASKETBALL - 8 Categories
    // ========================================================================
    'Basketball': [
        { zoneId: 'courtside_west', categoryName: 'Courtside VIP' },
        { zoneId: 'courtside_east', categoryName: 'Courtside VIP' },
        { zoneId: 'courtside_north', categoryName: 'Courtside VIP' },
        { zoneId: 'courtside_south', categoryName: 'Courtside VIP' },
        { zoneId: 'west_center', categoryName: 'Premium Center' },
        { zoneId: 'east_center', categoryName: 'Premium Center' },
        { zoneId: 'west_lower', categoryName: 'Lower Tier' },
        { zoneId: 'east_lower', categoryName: 'Lower Tier' },
        { zoneId: 'north_lower', categoryName: 'Lower Tier' },
        { zoneId: 'south_lower', categoryName: 'Lower Tier' },
        { zoneId: 'west_upper', categoryName: 'Upper Tier' },
        { zoneId: 'east_upper', categoryName: 'Upper Tier' },
        { zoneId: 'north_upper', categoryName: 'Upper Tier' },
        { zoneId: 'south_upper', categoryName: 'Upper Tier' },
        { zoneId: 'north_stand', categoryName: 'Behind Basket North' },
        { zoneId: 'south_stand', categoryName: 'Behind Basket South' },
        { zoneId: 'corner_nw', categoryName: 'Upper Tier' },
        { zoneId: 'corner_ne', categoryName: 'Upper Tier' },
        { zoneId: 'corner_sw', categoryName: 'Upper Tier' },
        { zoneId: 'corner_se', categoryName: 'Upper Tier' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // 🎾 TENNIS - 6 Categories
    // ========================================================================
    'Tennis': [
        { zoneId: 'courtside_west', categoryName: 'Courtside Premium' },
        { zoneId: 'courtside_east', categoryName: 'Courtside Premium' },
        { zoneId: 'west_center', categoryName: 'Premium Mid' },
        { zoneId: 'east_center', categoryName: 'Premium Mid' },
        { zoneId: 'north_stand', categoryName: 'Baseline North' },
        { zoneId: 'south_stand', categoryName: 'Baseline South' },
        { zoneId: 'west_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'east_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'north_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'south_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'corner_nw', categoryName: 'Upper Gallery' },
        { zoneId: 'corner_ne', categoryName: 'Upper Gallery' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // 🏑 HOCKEY - 8 Categories
    // ========================================================================
    'Hockey': [
        { zoneId: 'west_center', categoryName: 'VIP Center' },
        { zoneId: 'west_left', categoryName: 'Premium' },
        { zoneId: 'west_right', categoryName: 'Premium' },
        { zoneId: 'east_center', categoryName: 'Premium' },
        { zoneId: 'east_stand', categoryName: 'General East' },
        { zoneId: 'north_stand', categoryName: 'Goal End North' },
        { zoneId: 'south_stand', categoryName: 'Goal End South' },
        { zoneId: 'west_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'east_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'north_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'south_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'corner_nw', categoryName: 'Corner' },
        { zoneId: 'corner_ne', categoryName: 'Corner' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ],

    // ========================================================================
    // 🏃 ATHLETICS - 6 Categories
    // ========================================================================
    'Athletics': [
        { zoneId: 'west_center', categoryName: 'VIP Finish Line' },
        { zoneId: 'west_left', categoryName: 'Premium West' },
        { zoneId: 'west_right', categoryName: 'Premium West' },
        { zoneId: 'west_lower', categoryName: 'Trackside' },
        { zoneId: 'east_lower', categoryName: 'Trackside' },
        { zoneId: 'north_lower', categoryName: 'Trackside' },
        { zoneId: 'south_lower', categoryName: 'Trackside' },
        { zoneId: 'east_stand', categoryName: 'Curve View East' },
        { zoneId: 'north_stand', categoryName: 'Curve View East' },
        { zoneId: 'south_stand', categoryName: 'Curve View East' },
        { zoneId: 'west_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'east_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'north_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'south_upper', categoryName: 'Upper Gallery' },
        { zoneId: 'accessible', categoryName: 'Accessible' }
    ]
};

/**
 * Get zone mapping for a specific sport
 */
export const getZoneMappingForSport = (sport) => {
    return SPORT_ZONE_MAPPING[sport] || [];
};

/**
 * Auto-populate zone configurations for a sport
 * Returns an object with zoneId as key and config as value
 */
export const autoPopulateZoneConfigs = (sport, categoriesData) => {
    const zoneMapping = getZoneMappingForSport(sport);
    const configs = {};

    zoneMapping.forEach(({ zoneId, categoryName }) => {
        // Find the category data
        const category = categoriesData.find(cat => cat.name === categoryName);

        if (category) {
            configs[zoneId] = {
                categoryName: category.name,
                seats: '100', // Default seats to ensure visibility
                price: '50', // Default price to ensure visibility
                color: category.color,
                description: category.description,
                tier: category.tier
            };
        }
    });

    return configs;
};

/**
 * Check if a zone is configured
 */
export const isZoneConfigured = (zoneId, zoneConfigs) => {
    return zoneConfigs[zoneId] &&
        zoneConfigs[zoneId].seats &&
        zoneConfigs[zoneId].price;
};

/**
 * Get configured zones count
 */
export const getConfiguredZonesCount = (zoneConfigs) => {
    return Object.values(zoneConfigs).filter(config =>
        config.seats && config.price
    ).length;
};

/**
 * Get total zones count for a sport
 */
export const getTotalZonesCount = (sport) => {
    return getZoneMappingForSport(sport).length;
};
