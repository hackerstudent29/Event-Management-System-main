// ============================================================================
// VENUE CONFIGURATION SYSTEM
// Comprehensive event type, subtype, and layout definitions
// ============================================================================

export const EVENT_TYPES = {
    THEATRE: 'Theatre',
    CONCERT: 'Concert',
    STADIUM: 'Stadium'
};

// ============================================================================
// EVENT SUBTYPES - Sport/Event specific categories
// ============================================================================

export const EVENT_SUBTYPES = {
    [EVENT_TYPES.THEATRE]: [
        'IMAX',
        'Standard Cinema',
        'Dolby Atmos',
        '4DX',
        'ScreenX',
        'Drive-In',
        'Premium Lounge',
        'Outdoor Cinema'
    ],
    [EVENT_TYPES.CONCERT]: [
        'Indoor Stadium Concert',
        'Outdoor Concert'
    ],
    [EVENT_TYPES.STADIUM]: [
        'Cricket',
        'Football',
        'Kabaddi',
        'Basketball',
        'Tennis',
        'Hockey',
        'Athletics'
    ]
};

// ============================================================================
// LAYOUT VARIANTS - Different seating configurations per subtype
// ============================================================================

export const LAYOUT_VARIANTS = {
    // STADIUM SPORTS - Sport-specific layouts
    [EVENT_TYPES.STADIUM]: {
        'Cricket': ['Oval Classic', 'Modern Bowl', 'Pavilion Style'],
        'Football': ['European Rectangle', 'Modern Arena', 'Classic Ground'],
        'Kabaddi': ['Indoor Arena', 'Traditional Mat', 'Pro League'],
        'Basketball': ['NBA Arena', 'College Court', 'Compact Hall'],
        'Tennis': ['Center Court', 'Stadium Court', 'Indoor Arena'],
        'Hockey': ['Ice Rink Arena', 'Field Hockey Ground'],
        'Athletics': ['Olympic Stadium', 'Track & Field']
    },

    // CONCERT VENUES
    [EVENT_TYPES.CONCERT]: {
        'Indoor Stadium Concert': ['End Stage', 'Center Stage'],
        'Outdoor Concert': ['Main Stage']
    },

    // THEATRE TYPES (FINAL LOCKED)
    [EVENT_TYPES.THEATRE]: {
        'IMAX': ['Large Format IMAX', 'Laser IMAX', 'Digital IMAX'],
        'Standard Cinema': ['Single Screen'],
        'Dolby Atmos': ['Dolby Atmos'],
        '4DX': ['4DX Standard', 'Motion Seats'],
        'ScreenX': ['Standard ScreenX', 'Side-Wall Immersion'],
        'Drive-In': ['Car Grid', 'Arena Parking'],
        'Premium Lounge': ['Luxury Recliners', 'VIP Pods'],
        'Outdoor Cinema': ['Open Air']
    }
};

// ============================================================================
// ZONE DEFINITIONS - Specific zones for each sport/event type
// ============================================================================

export const SPORT_ZONES = {
    // CRICKET - Oval stadium with 360° seating
    'Cricket': {
        'Oval Classic': [
            'pavilion_members', 'pavilion_premium',
            'east_stand_lower', 'east_stand_upper',
            'west_stand_lower', 'west_stand_upper',
            'north_stand', 'south_stand',
            'corporate_boxes', 'party_deck'
        ],
        'Modern Bowl': [
            'lower_tier_a', 'lower_tier_b', 'lower_tier_c', 'lower_tier_d',
            'upper_tier_a', 'upper_tier_b', 'upper_tier_c', 'upper_tier_d',
            'premium_club', 'sky_boxes'
        ]
    },

    // FOOTBALL - Rectangular pitch
    'Football': {
        'European Rectangle': [
            'main_stand_lower', 'main_stand_upper',
            'opposite_stand_lower', 'opposite_stand_upper',
            'north_end_lower', 'north_end_upper',
            'south_end_lower', 'south_end_upper',
            'vip_boxes', 'press_box'
        ]
    },

    // KABADDI - Smaller rectangular court
    'Kabaddi': {
        'Indoor Arena': [
            'courtside_premium',
            'lower_bowl_section_a', 'lower_bowl_section_b',
            'lower_bowl_section_c', 'lower_bowl_section_d',
            'upper_tier_section_a', 'upper_tier_section_b',
            'vip_lounge'
        ],
        'Pro League': [
            'mat_side_a', 'mat_side_b',
            'corner_a', 'corner_b', 'corner_c', 'corner_d',
            'general_seating', 'premium_seating'
        ]
    },

    // BASKETBALL - Indoor arena
    'Basketball': {
        'NBA Arena': [
            'courtside', 'club_seats',
            'lower_bowl_sections', 'upper_bowl_sections',
            'suites', 'standing_room'
        ]
    },

    // TENNIS - Court-focused
    'Tennis': {
        'Center Court': [
            'courtside_premium',
            'lower_tier_deuce', 'lower_tier_advantage',
            'upper_tier_deuce', 'upper_tier_advantage',
            'royal_box', 'general_admission'
        ]
    }
};

// ============================================================================
// CONCERT ZONES
// ============================================================================

export const CONCERT_ZONES = {
    'Indoor Stadium Concert': {
        'End Stage': [
            'standing',
            'block_a', 'block_b', 'block_c', 'block_d', 'block_e', 'block_f', 'block_g',
            'block_h', 'block_j', 'block_k', 'block_l', 'block_m', 'block_n', 'block_p'
        ],
        'Center Stage': [
            'field_1', 'field_2', 'field_3', 'field_4', 'field_5', 'field_6', 'field_7', 'field_8', 'field_9',
            'lower_n', 'lower_ne', 'lower_e', 'lower_se', 'lower_s', 'lower_sw', 'lower_w', 'lower_nw',
            'club_n', 'club_ne', 'club_e', 'club_se', 'club_s', 'club_sw', 'club_w', 'club_nw',
            'upper_n', 'upper_ne', 'upper_e', 'upper_se', 'upper_s', 'upper_sw', 'upper_w', 'upper_nw'
        ]
    },
    'Outdoor Concert': {
        'Main Stage': [
            'c1', 'c2', 'c3', 'c4',
            'l1', 'l2', 'l3', 'l4',
            'r1', 'r2', 'r3', 'r4'
        ]
    }
};

// ============================================================================
// THEATRE ZONES (FINAL LOCKED)
// ============================================================================

export const THEATRE_ZONES = {
    'IMAX': {
        'Large Format IMAX': ['zone_front', 'zone_middle', 'zone_center', 'zone_back', 'zone_balcony'],
        'Laser IMAX': ['zone_front', 'zone_middle', 'zone_center', 'zone_back', 'zone_balcony'],
        'Digital IMAX': ['zone_front', 'zone_middle', 'zone_center', 'zone_back', 'zone_balcony'],
    },
    'Standard Cinema': {
        'Single Screen': ['zone_front', 'zone_middle', 'zone_center', 'zone_back', 'zone_balcony'],
    },
    'Dolby Atmos': {
        'Dolby Atmos': ['zone_front', 'zone_middle', 'zone_center', 'zone_recliner'],
    },
    '4DX': {
        '4DX Standard': ['zone_front', 'zone_premium', 'zone_general'],
        'Motion Seats': ['zone_premium', 'zone_general'],
    },
    'ScreenX': {
        'Standard ScreenX': ['zone_front', 'zone_center', 'zone_back'],
        'Side-Wall Immersion': ['zone_side', 'zone_center'],
    },
    'Drive-In': {
        'Car Grid': ['zone_parking_front', 'zone_parking_middle', 'zone_parking_rear'],
        'Arena Parking': ['zone_parking_front', 'zone_parking_rear'],
    },
    'Premium Lounge': {
        'Luxury Recliners': ['zone_recliner_premium', 'zone_recliner_standard'],
        'VIP Pods': ['zone_vip_pod'],
    },
    'Outdoor Cinema': {
        'Open Air': ['zone_premium', 'zone_general', 'zone_back'],
    }
};

// ============================================================================
// ZONE DISPLAY LABELS - Human-readable labels for visual maps
// ============================================================================

export const ZONE_LABELS = {
    // THEATRE SUBTYPES (FINAL LOCKED)
    'IMAX': {
        zone_front: "Front Rows",
        zone_middle: "Standard",
        zone_center: "VIP Center",
        zone_back: "Elite",
        zone_balcony: "Balcony"
    },
    'Standard Cinema': {
        zone_front: "Front Rows",
        zone_middle: "Silver",
        zone_center: "Gold",
        zone_back: "Platinum",
        zone_balcony: "Balcony"
    },
    'Dolby Atmos': {
        zone_front: "Front",
        zone_middle: "Silver",
        zone_center: "Premium Center",
        zone_recliner: "Recliners"
    },
    '4DX': {
        zone_front: "Restricted Front",
        zone_premium: "Motion Premium",
        zone_general: "Motion Standard"
    },
    'ScreenX': {
        zone_front: "Front",
        zone_center: "Center Immersion",
        zone_back: "Standard",
        zone_side: "Side Walls"
    },
    'Drive-In': {
        zone_parking_front: "Front Parking",
        zone_parking_middle: "Middle Parking",
        zone_parking_rear: "Rear Parking"
    },
    'Premium Lounge': {
        zone_recliner_premium: "Premium Recliners",
        zone_recliner_standard: "Standard Recliners",
        zone_vip_pod: "VIP Pods"
    },
    'Outdoor Cinema': {
        zone_premium: "Premium Chairs",
        zone_general: "Standard Chairs",
        zone_back: "Back Lawn"
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getLayoutsForSubtype = (eventType, subtype) => {
    const variants = LAYOUT_VARIANTS[eventType];
    if (!variants) return ['Default'];
    if (typeof variants === 'object' && !Array.isArray(variants)) {
        return variants[subtype] || ['Default'];
    }
    return variants;
};

export const getZonesForLayout = (subtype, layout) => {
    // Try sport zones first
    if (SPORT_ZONES[subtype] && SPORT_ZONES[subtype][layout]) {
        return SPORT_ZONES[subtype][layout];
    }
    // Try concert zones
    if (CONCERT_ZONES[subtype] && CONCERT_ZONES[subtype][layout]) {
        return CONCERT_ZONES[subtype][layout];
    }
    // Try theatre zones
    if (THEATRE_ZONES[subtype] && THEATRE_ZONES[subtype][layout]) {
        return THEATRE_ZONES[subtype][layout];
    }
    // Default zones
    return ['zone_1', 'zone_2', 'zone_3', 'zone_4'];
};
