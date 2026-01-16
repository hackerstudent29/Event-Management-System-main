# 🏟️ STADIUM SEATING SPATIAL MAPPING SYSTEM

## Overview

This document defines the **precise spatial mapping system** for stadium seating categories across all sports. Every category has an **exact location** using spatial anchors, not arbitrary names.

---

## 🧭 Global Stadium Coordinate System

**ALL stadium maps follow this orientation:**

```
            NORTH STAND
        -------------------
        |                 |
WEST    |   PLAY AREA     |   EAST
STAND   |                 |   STAND
        -------------------
            SOUTH STAND
```

### Key Concepts

- **Cardinal Directions**: NORTH, SOUTH, EAST, WEST
- **Center Positions**: WEST_CENTER, EAST_CENTER (halfway line/midpoint)
- **Tier Levels**: LOWER_TIER (close to play area), UPPER_TIER (higher rows)
- **Sport-Specific Anchors**: PAVILION (Cricket), FINISH_LINE (Athletics), COURTSIDE (Basketball/Tennis)

---

## 🏏 Cricket - Asymmetrical (Pavilion-Centric)

**Key Rule**: Pavilion = WEST_CENTER only. Never anywhere else.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| VIP Pavilion | `PAVILION` | WEST center, behind pitch | Premium |
| Premium West | `WEST` | West stand adjacent to pavilion | Premium |
| Lower Tier East | `EAST + LOWER_TIER` | East stand lower rows | Standard |
| Upper Tier East | `EAST + UPPER_TIER` | East stand upper rows | Standard |
| Boundary North | `BOUNDARY_NORTH` | Behind north boundary | Standard |
| Boundary South | `BOUNDARY_SOUTH` | Behind south boundary | Standard |
| Gallery | `CORNERS` | NE, NW, SE, SW corners | Economy |
| Accessible | `PAVILION + LOWER_TIER` | Near pavilion, lower rows | Accessible |

**Visual**:
```
        Boundary North
    -------------------
    |G             G|
W   |P  CRICKET    E|  E
E   |R  PITCH      A|  A
S   |E             S|  S
T   |M             T|  T
    |G             G|
    -------------------
        Boundary South
    
    P = Pavilion (VIP)
    G = Gallery (Corners)
```

---

## ⚽ Football - Symmetrical (Goal-Focused)

**Key Rule**: Behind-goal stands are **never premium**.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| VIP Box | `WEST_CENTER` | Center of west stand (halfway line) | Premium |
| Premium Center | `WEST_CENTER + EAST_CENTER` | Center blocks of main stands | Premium |
| Lower Tier | `ALL_SIDES + LOWER_TIER` | Closest rows to pitch (all sides) | Standard |
| Upper Tier | `ALL_SIDES + UPPER_TIER` | Upper rows (all sides) | Standard |
| Home End | `SOUTH_GOAL` | Behind south goal | Fan Zone |
| Away End | `NORTH_GOAL` | Behind north goal | Fan Zone |
| Accessible | `WEST + LOWER_TIER` | Near tunnel entrance | Accessible |

**Visual**:
```
        Away End (NORTH)
    -------------------
    |                 |
W   |U  FOOTBALL   U|  E
E   |P  PITCH      P|  A
S   |P              P|  S
T   |E              E|  T
    |R              R|
    -------------------
        Home End (SOUTH)
    
    UPPER = Upper Tier (all sides)
```

---

## 🤼 Kabaddi - Compact & Frontal (West-Dominant)

**Key Rule**: WEST side is always the main viewing side.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| VIP Mat-side | `MAT_SIDE + WEST_CENTER` | Front rows west center | Premium |
| Premium | `WEST + EAST` | Middle blocks of viewing sides | Premium |
| General East | `EAST` | East stand general seating | Standard |
| Gallery North | `NORTH` | North end seating | Economy |
| Gallery South | `SOUTH` | South end seating | Economy |
| Accessible | `WEST_CENTER + LOWER_TIER` | Near west center aisle | Accessible |

---

## 🏀 Basketball - Center-Focused (Not End-Focused)

**Key Rule**: Courtside seats exist only here (and tennis).

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| Courtside VIP | `COURTSIDE` | Around court edges | Premium |
| Premium Center | `WEST_CENTER + EAST_CENTER` | Center sections of main sides | Premium |
| Lower Tier | `ALL_SIDES + LOWER_TIER` | Lower rows all sides | Standard |
| Upper Tier | `ALL_SIDES + UPPER_TIER` | Upper rows all sides | Standard |
| Behind Basket North | `NORTH` | Behind north basket | Standard |
| Behind Basket South | `SOUTH` | Behind south basket | Standard |
| Accessible | `COURTSIDE + WEST` | Courtside entry points | Accessible |

---

## 🎾 Tennis - Side-Dominant (Baseline vs Sideline)

**Key Rule**: Baseline seats ≠ sideline seats.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| Courtside Premium | `COURTSIDE + WEST + EAST` | Along sidelines | Premium |
| Premium Mid | `WEST_CENTER + EAST_CENTER` | Mid rows of sideline stands | Premium |
| Baseline North | `NORTH` | Behind north baseline | Standard |
| Baseline South | `SOUTH` | Behind south baseline | Standard |
| Upper Gallery | `ALL_UPPER` | Upper rows all sides | Economy |
| Accessible | `WEST + LOWER_TIER` | Near umpire chair side | Accessible |

---

## 🏑 Hockey - Similar to Football (Lower Seating Priority)

**Key Rule**: Hockey stadiums are flatter → fewer tiers.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| VIP Center | `WEST_CENTER` | West stand center | Premium |
| Premium | `WEST + EAST` | Center blocks of main stands | Premium |
| General East | `EAST` | East stand general seating | Standard |
| Goal End North | `NORTH_GOAL` | Behind north goal | Standard |
| Goal End South | `SOUTH_GOAL` | Behind south goal | Standard |
| Upper Gallery | `ALL_UPPER` | Upper rows (flatter stadiums) | Economy |
| Accessible | `WEST + LOWER_TIER` | Lower west stand | Accessible |

---

## 🏃 Athletics - Finish Line is Everything

**Key Rule**: Finish line side must be highlighted visually.

| Category | Anchor | Location | Tier |
|----------|--------|----------|------|
| VIP Finish Line | `FINISH_LINE + WEST` | Finish line side (west) | Premium |
| Premium West | `WEST` | Adjacent to finish line | Premium |
| Trackside | `ALL_SIDES + LOWER_TIER` | Closest rows to track | Standard |
| Curve View East | `EAST` | East stand (curve view) | Standard |
| Upper Gallery | `ALL_UPPER` | Upper rows all stands | Economy |
| Accessible | `FINISH_LINE + LOWER_TIER` | Finish line level | Accessible |

---

## 🧠 Data Model (Antigravity-Friendly)

### Category Structure

```javascript
{
  name: "VIP Box",
  anchor: "WEST_CENTER", // or ["WEST_CENTER", "EAST_CENTER"]
  description: "Center of west stand (halfway line)",
  tier: "premium", // premium | standard | economy | fan_zone | accessible
  color: "#8b5cf6" // Hex color for visual mapping
}
```

### Anchor Types

```javascript
// Cardinal directions
NORTH, SOUTH, EAST, WEST

// Center positions
WEST_CENTER, EAST_CENTER, NORTH_CENTER, SOUTH_CENTER

// Goal/End positions
NORTH_GOAL, SOUTH_GOAL

// Boundary positions (Cricket)
BOUNDARY_NORTH, BOUNDARY_SOUTH

// Special positions
PAVILION        // Cricket: WEST_CENTER
FINISH_LINE     // Athletics: WEST
COURTSIDE       // Basketball/Tennis: Around edges
MAT_SIDE        // Kabaddi: WEST front

// Tier levels
LOWER_TIER, UPPER_TIER

// Corners
CORNER_NE, CORNER_NW, CORNER_SE, CORNER_SW

// All sides
ALL_SIDES, ALL_UPPER, ALL_LOWER
```

---

## ❌ Anti-Patterns (DO NOT DO)

1. **❌ Same categories for all sports**
   - Cricket pavilion ≠ Football VIP box
   - Each sport has unique spatial logic

2. **❌ Random placement of VIP**
   - VIP must follow sport-specific rules
   - Cricket: WEST_CENTER (pavilion)
   - Football: WEST_CENTER (halfway line)
   - Athletics: WEST (finish line)

3. **❌ Treat cricket & football the same**
   - Cricket is asymmetrical (pavilion matters)
   - Football is symmetrical (both ends equal)

4. **❌ Ignore finish line / pavilion / goal logic**
   - These are the PRIMARY spatial anchors
   - Everything else is positioned relative to them

5. **❌ Generic "premium" without location**
   - "Premium" means nothing without spatial context
   - Must specify: Premium WHERE?

---

## 📐 Implementation Guidelines

### For Layout Engines

1. **Parse the anchor** to determine exact coordinates
2. **Map anchor to SVG/Canvas coordinates** based on sport
3. **Render category zones** at correct positions
4. **Apply tier-based styling** (colors, borders)

### For Admin Configuration

1. **Show sport-specific categories** in dropdown
2. **Display anchor information** for clarity
3. **Validate category placement** against anchors
4. **Prevent invalid combinations** (e.g., Cricket pavilion on EAST)

### For Booking Interface

1. **Highlight categories** based on anchor positions
2. **Show tier information** (premium, standard, etc.)
3. **Enable spatial filtering** (e.g., "Show only WEST side")
4. **Display relative pricing** based on tier

---

## 🎯 Usage Example

```javascript
import { getCategoriesForSport, ANCHORS } from '@/lib/stadium-categories';

// Get categories for Football
const footballCategories = getCategoriesForSport('Football');

// Find VIP Box
const vipBox = footballCategories.find(cat => cat.name === 'VIP Box');
console.log(vipBox.anchor); // "WEST_CENTER"

// Filter by tier
const premiumSeats = footballCategories.filter(cat => cat.tier === 'premium');

// Map to visual coordinates
function mapAnchorToCoordinates(anchor, sportType) {
  switch(anchor) {
    case ANCHORS.WEST_CENTER:
      return { x: 100, y: 300 }; // Example coordinates
    case ANCHORS.NORTH_GOAL:
      return { x: 300, y: 50 };
    // ... etc
  }
}
```

---

## 📊 Summary

| Sport | Primary Anchor | Symmetry | Key Feature |
|-------|---------------|----------|-------------|
| Cricket | PAVILION (WEST) | Asymmetric | Pavilion-centric |
| Football | HALFWAY LINE (WEST_CENTER) | Symmetric | Goal ends equal |
| Kabaddi | MAT_SIDE (WEST) | Asymmetric | West-dominant |
| Basketball | COURTSIDE | Symmetric | Center-focused |
| Tennis | SIDELINES (WEST/EAST) | Symmetric | Baseline vs Sideline |
| Hockey | WEST_CENTER | Symmetric | Flatter tiers |
| Athletics | FINISH_LINE (WEST) | Asymmetric | Finish line priority |

---

**This system ensures every seat category has precise spatial meaning, enabling accurate visual mapping and better user experience.**
