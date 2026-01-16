# 🎯 IMPLEMENTATION ROADMAP - ALL 3 PHASES

## ✅ PHASE 1: Seat Grid Component Adjustments (IN PROGRESS - 40%)

### **Completed:**
1. ✅ **Theatre Layout Rules Engine** (`theatre-layout-rules.js`)
   - Max capacity limits per subtype
   - Gap positioning rules
   - Allowed seats per row validation
   - Fixed layout detection
   - Category name enforcement

2. ✅ **Gap Calculation Utilities** (`gap-utils.js`)
   - Midpoint gap calculator
   - Every-4-seats gap calculator
   - Seat X position calculator with gaps
   - 4DX validation
   - Subtype gap rule lookup

3. ✅ **IMAX Layout - NO GAPS**
   - Removed center aisle
   - Continuous rows (280 seats)
   - Updated category names: VIP, Elite, Standard, Front Row, Balcony

4. ✅ **ScreenX Fixed Layout** (`screenx-fixed-layout.jsx`)
   - Pyramid layout: 8→10→12→14→16→18→20→20→20→20→22
   - Total 180 seats (non-negotiable)
   - Admin can ONLY set pricing
   - Warning message in admin mode

### **Remaining (Phase 1):**
- ✅ Update Standard Cinema with midpoint gaps
- ✅ Update Dolby Atmos with midpoint gaps
- ✅ Update 4DX with every-4-seats gaps
- ✅ Update Premium Lounge with midpoint gaps
- ✅ Update Outdoor Cinema with midpoint gaps
- ⏳ Update all category names to match spec (Data validation)
- ✅ Integrate gap-utils into all components

**Estimated Time**: 2-3 hours
**Priority**: HIGH (blocks Phase 2)

---

## 📋 PHASE 2: Database Schema (NOT STARTED)

### **Tables to Create:**

#### 1. **`theatre_configurations`**
```sql
CREATE TABLE theatre_configurations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id),
    subtype VARCHAR(50) NOT NULL, -- IMAX, Standard Cinema, etc.
    total_capacity INT NOT NULL,
    is_fixed_layout BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **`theatre_rows`**
```sql
CREATE TABLE theatre_rows (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT REFERENCES theatre_configurations(id),
    row_number INT NOT NULL,
    row_label VARCHAR(2) NOT NULL, -- A, B, C, etc.
    seats_per_row INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    UNIQUE(config_id, row_number)
);
```

#### 3. **`theatre_categories`**
```sql
CREATE TABLE theatre_categories (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT REFERENCES theatre_configurations(id),
    category_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(7), -- Hex color code
    UNIQUE(config_id, category_name)
);
```

#### 4. **`theatre_seats`**
```sql
CREATE TABLE theatre_seats (
    id BIGSERIAL PRIMARY KEY,
    row_id BIGINT REFERENCES theatre_rows(id),
    seat_number INT NOT NULL,
    seat_label VARCHAR(10) NOT NULL, -- A1, A2, etc.
    is_booked BOOLEAN DEFAULT FALSE,
    booking_id BIGINT REFERENCES bookings(id),
    UNIQUE(row_id, seat_number)
);
```

#### 5. **`theatre_gap_rules`**
```sql
CREATE TABLE theatre_gap_rules (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT REFERENCES theatre_configurations(id),
    gap_type VARCHAR(20) NOT NULL, -- 'none', 'midpoint', 'every4'
    gap_width INT DEFAULT 12 -- pixels
);
```

### **API Endpoints to Create:**

#### Admin Endpoints:
- `POST /api/admin/theatre/configure` - Create theatre configuration
- `PUT /api/admin/theatre/{id}/rows` - Update row configuration
- `PUT /api/admin/theatre/{id}/categories` - Update category pricing
- `GET /api/admin/theatre/{id}/validate` - Validate configuration

#### Public Endpoints:
- `GET /api/theatre/{eventId}/layout` - Get seat map
- `GET /api/theatre/{eventId}/availability` - Get available seats
- `POST /api/theatre/{eventId}/book` - Book seats
- `GET /api/theatre/{eventId}/categories` - Get pricing

**Estimated Time**: 4-5 hours
**Priority**: MEDIUM (after Phase 1)

---

## 🎨 PHASE 3: Admin UI Redesign (NOT STARTED)

### **New Components to Build:**

#### 1. **Theatre Configuration Wizard**
```
Step 1: Select Subtype
Step 2: Configure Rows (if not fixed)
Step 3: Assign Categories
Step 4: Set Pricing
Step 5: Preview & Publish
```

#### 2. **Row Configuration Panel**
- Add/Remove rows
- Set seats per row (with validation)
- Assign category to row
- Real-time capacity counter
- Visual preview

#### 3. **Category Manager**
- Create/Edit categories
- Set prices
- Choose colors
- Category usage stats

#### 4. **Capacity Validator**
- Show current vs max capacity
- Warning at 80% capacity
- Error at 100% capacity
- Prevent exceeding limits

#### 5. **Fixed Layout Indicator**
- Show "LOCKED" badge for ScreenX
- Disable row/seat editing
- Allow only pricing changes

### **UI/UX Requirements:**
- ✅ Real-time validation
- ✅ Visual feedback
- ✅ Undo/Redo support
- ✅ Save as draft
- ✅ Publish when ready
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)

**Estimated Time**: 6-8 hours
**Priority**: LOW (after Phase 2)

---

## 📊 Overall Progress

| Phase | Status | Progress | Est. Time | Priority |
|-------|--------|----------|-----------|----------|
| Phase 1: Seat Grids | 🟢 Almost Done | 90% | 1h | HIGH |
| Phase 2: Database | ⚪ Not Started | 0% | 4-5h | MEDIUM |
| Phase 3: Admin UI | ⚪ Not Started | 0% | 6-8h | LOW |

**Total Estimated Time**: 12-16 hours
**Current Progress**: 13% overall

---

## 🚀 Execution Plan

### **Today (Immediate):**
1. ✅ Complete remaining Phase 1 layouts (2-3 hours)
2. ✅ Test all layouts in browser
3. ✅ Fix any visual bugs

### **Next Session:**
1. Create database schema (Phase 2)
2. Build API endpoints
3. Test with Postman

### **Final Session:**
1. Build admin UI (Phase 3)
2. Integration testing
3. End-to-end testing
4. Production deployment

---

## 🎯 Success Criteria

### **Phase 1 Complete When:**
- ✅ All 9 layouts enforce correct gap rules
- ✅ All category names match spec
- ✅ All capacity limits enforced
- ✅ ScreenX is truly fixed
- ✅ 4DX only allows 4/8/12/16 seats
- ✅ IMAX has no gaps
- ✅ Visual tests pass

### **Phase 2 Complete When:**
- ✅ All tables created
- ✅ All API endpoints working
- ✅ Postman tests pass
- ✅ Data persistence verified
- ✅ Booking flow works

### **Phase 3 Complete When:**
- ✅ Admin can configure all layouts
- ✅ Validation prevents errors
- ✅ Fixed layouts are locked
- ✅ Capacity limits enforced
- ✅ UI is intuitive
- ✅ End-to-end flow works

---

**Current Status**: Phase 1 infrastructure complete. Ready to finish remaining layouts.

**Next Action**: Complete Standard Cinema, Dolby Atmos, 4DX, Premium Lounge, and Outdoor Cinema with proper gap rules.
