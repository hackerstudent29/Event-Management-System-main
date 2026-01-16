## ✅ FINAL MASTER PROMPT — THEATRE SEATING & ADMIN CONFIGURATION (LOCKED)

> **Role:**
> You are a senior product designer and frontend system architect building an **admin-controlled theatre seating system** for a public ticket-booking platform.
> The system must generate **SVG-based, seat-level, clickable theatre layouts** based strictly on the rules below.

---

## 🎭 1. THEATRE SUBTYPES & ALLOWED CATEGORIES (FINAL)

Use **only** the following category sets.
No additional categories are allowed.

| Subtype         | Categories                                       |
| --------------- | ------------------------------------------------ |
| IMAX            | VIP, Elite, Standard, Front Row, Balcony         |
| Standard Cinema | Platinum, Gold, Silver, Front Row, Balcony       |
| Dolby Atmos     | Premium, Gold, Silver, Front Row, Recliner       |
| 4DX             | Motion Premium, Motion Standard, Rear Safe Zone  |
| ScreenX         | Immersion Center, Side Immersion, Standard, Rear |
| Drive-In        | Front Parking, Middle Parking, Rear Parking, SUV |
| Premium Lounge  | Recliner Premium, Recliner Standard / VIP Pod    |
| Outdoor Cinema  | Premium Chairs, Standard Chairs, Back Lawn       |

---

## 🧩 2. GLOBAL ADMIN RULES (CRITICAL)

* Admin **does NOT draw seats manually**
* Admin can configure only:
  * Category
  * Number of rows
  * Seats per row
  * Price per category
* Row labels must be **A–Z**
* Seat labels must be **A1, A2, A3…**
* Layout is rendered automatically as SVG

---

## 🪑 3. ROW & SEAT RULES (GLOBAL)

### Row Rules

* Rows are labeled **A to Z**
* Admin can create multiple rows per category
* Row order flows **front (A) → back (Z)**

### Seat Rules

* Seats are **individual, clickable SVG elements**
* Seats are rectangular with rounded corners
* Seat selection is **even-only** when gaps are enabled
  ❌ Single-seat booking not allowed in gap layouts

---

## 🧱 4. GAP RULES (VERY IMPORTANT)

### Gap-Enabled Layouts (DEFAULT)

* If a row has **20 seats**, layout must be:
  ```
  10 seats  | GAP |  10 seats
  ```
* Gaps represent walkways
* Gaps are **not seats**
* Admin cannot remove gap seats individually

### No-Gap Layouts (EXCEPTIONS)

**No gaps allowed for:**
* IMAX
* Drive-In
* Any explicitly fixed-seat layout

---

## 🎥 5. SUBTYPE-SPECIFIC RULES (STRICT)

---

### 🔹 IMAX

* **No gaps**
* Fully continuous rows
* Max seating capacity: **400**
* Admin controls:
  * Rows
  * Seats per row
* Slightly curved screen required

---

### 🔹 Standard Cinema

* Gaps allowed
* Max seating capacity: **320**
* Normal flat or mild curve screen

---

### 🔹 Dolby Atmos

* Gaps allowed
* Recliner category may have fewer seats per row
* Max seating capacity: **260**
* Slightly curved screen

---

### 🔹 4DX

* **VERY STRICT**
* Max seating capacity: **160**
* Seats per row allowed **ONLY**:
  ```
  4, 8, 12, 16
  ```
* Mandatory walkway gaps:
  ```
  4 seats | GAP | 4 seats | GAP | 4 seats | GAP | 4 seats
  ```
* No other seat counts allowed
* Rows limited accordingly

---

### 🔹 ScreenX (FIXED LAYOUT — NO ADMIN EDIT)

Admin **cannot change seats, rows, or gaps**.

Seat distribution is **fixed**:

| Row | Seats                       |
| --- | --------------------------- |
| 1   | 8                           |
| 2   | 10                          |
| 3   | 12                          |
| 4   | 14                          |
| 5   | 16                          |
| 6   | 18                          |
| 7   | 20                          |
| 8   | 20                          |
| 9   | 20                          |
| 10  | 20                          |
| 11  | 22 (extra 2 seats centered) |

* Total seats: **180**
* No gaps
* ScreenX side walls implied visually
* Admin can **only assign category pricing**, nothing else

---

### 🔹 Drive-In

* Layout type: **Parking grid**
* Max capacity: **100 cars**
* No middle gaps
* Categories applied per parking zone
* Not seat-based (car = 1 unit)

---

### 🔹 Premium Lounge

#### Luxury Recliners

* Wider seats
* Fewer seats per row
* Optional gaps

#### VIP Pods

* Sold per pod
* Fixed pod count
* No seat-level booking

---

### 🔹 Outdoor Cinema

* Gaps allowed
* Chair-style seating
* Back Lawn is non-chair seating
* Flexible but seat-count based

---

## 🖥️ 6. SVG REQUIREMENTS (MANDATORY)

Each generated layout must:

* Be **inline SVG**
* Contain:
  * Curved or flat screen at top
  * Individual seat `<rect>` elements
  * `data-seat`, `data-row`, `data-category`
* Be fully clickable
* Support hover + selected states
* Be responsive and scalable
* Use **flat UI wireframe style**
* No textures, no images, no people

---

## 🔒 7. ADMIN VS PUBLIC VISIBILITY

### Admin

* Configures categories, rows, seats, pricing
* Cannot break layout rules
* Cannot exceed capacity limits

### Public Users

* Cannot see row/seat logic rules
* Can only select available seats
* Cannot select invalid seat combinations

---

## 🎯 8. GOAL

Produce a **robust, scalable, mistake-proof theatre seating system** that:

* Matches real cinema behavior
* Prevents admin errors
* Scales across theatre types
* Works entirely via configuration

---

## ❗ FINAL RULE

Do **not** invent:
* New theatre subtypes
* New categories
* Custom seat logic

This specification is **final**.

---

## 📋 IMPLEMENTATION STATUS

### ✅ Completed
- [x] Individual clickable SVG seats
- [x] Curved screens for all layouts
- [x] Zone-based rendering
- [x] Admin configuration flow
- [x] Data attributes (data-seat, data-zone)
- [x] Hover and selection states
- [x] 14 theatre layout variants

### 🚧 Needs Adjustment to Match Spec

#### 1. **Gap Logic**
- Current: All layouts have center aisle
- Required: IMAX and Drive-In should have NO gaps
- Required: Standard/Dolby/Outdoor should split at midpoint (10|GAP|10 for 20 seats)

#### 2. **4DX Strict Rules**
- Current: Flexible seat counts
- Required: ONLY 4, 8, 12, 16 seats per row allowed
- Required: Mandatory gaps every 4 seats

#### 3. **ScreenX Fixed Layout**
- Current: Flexible configuration
- Required: Fixed pyramid layout (8→10→12→14→16→18→20→20→20→20→22)
- Required: Admin can ONLY set pricing, not seat counts

#### 4. **Category Names**
- Current: Generic zone names (zone_front, zone_center)
- Required: Specific category names per subtype (VIP, Elite, Platinum, Gold, etc.)

#### 5. **Capacity Limits**
- Current: No enforced limits
- Required: Max capacity per subtype (IMAX: 400, Standard: 320, Dolby: 260, 4DX: 160)

#### 6. **Admin Configuration UI**
- Current: Zone-based configuration
- Required: Row + Category based configuration
- Required: Validation for seat counts, gaps, and capacity

---

## 🔧 NEXT STEPS

### Option A: Adjust Current Implementation
Modify existing seat grid components to enforce:
- Gap rules per subtype
- 4DX strict seat counts
- ScreenX fixed layout
- Capacity limits
- Category name mapping

### Option B: Database Schema
Create schema for:
- Theatre configurations
- Row definitions
- Category pricing
- Seat availability tracking

### Option C: Admin UI Redesign
Build proper admin interface for:
- Row-by-row configuration
- Category assignment
- Price setting
- Real-time capacity validation

---

**Status**: Specification locked. Current implementation needs adjustments to match strict business rules.
