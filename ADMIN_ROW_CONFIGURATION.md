# 🎯 ADMIN ROW-BASED THEATRE CONFIGURATION

## ✅ **HOW IT WORKS**

The admin can now configure theatre layouts by **selecting rows and assigning categories** to them.

### **Example: Admin Configuring an IMAX Theatre**

**Step 1**: Admin selects theatre subtype: **IMAX**

**Step 2**: Admin assigns categories to row ranges:
- **Row A-B** (Rows 1-2) → **"Front Row"** → ₹150
- **Row C-E** (Rows 3-5) → **"Standard"** → ₹200
- **Row F-I** (Rows 6-9) → **"VIP"** → ₹300
- **Row J-L** (Rows 10-12) → **"Elite"** → ₹250
- **Row M-N** (Rows 13-14) → **"Balcony"** → ₹180

**Step 3**: System automatically:
- Creates categories (Front Row, Standard, VIP, Elite, Balcony)
- Creates 14 rows (A-N)
- Generates 20 seats per row (A1-A20, B1-B20, etc.)
- Total: **280 seats**

---

## 📋 **API ENDPOINT**

### **POST /api/admin/theatre/configure**

**Request Body:**
```json
{
  "eventId": 123,
  "subtype": "IMAX",
  "seatsPerRow": 20,
  "rowAssignments": [
    {
      "startRow": 1,
      "endRow": 2,
      "categoryName": "Front Row",
      "price": 150.00,
      "color": "#FF5733",
      "seatsPerRow": 20
    },
    {
      "startRow": 3,
      "endRow": 5,
      "categoryName": "Standard",
      "price": 200.00,
      "color": "#3498DB"
    },
    {
      "startRow": 6,
      "endRow": 9,
      "categoryName": "VIP",
      "price": 300.00,
      "color": "#F1C40F"
    },
    {
      "startRow": 10,
      "endRow": 12,
      "categoryName": "Elite",
      "price": 250.00,
      "color": "#9B59B6"
    },
    {
      "startRow": 13,
      "endRow": 14,
      "categoryName": "Balcony",
      "price": 180.00,
      "color": "#E74C3C"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Theatre configured successfully",
  "configId": 456,
  "totalCapacity": 280
}
```

---

## 🎨 **VISUAL REPRESENTATION**

### **Admin UI Flow:**

```
┌─────────────────────────────────────────────────────┐
│  Configure IMAX Theatre for Event #123             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Default Seats Per Row: [20]                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Row Assignment 1                              │ │
│  │ From Row: [A] To Row: [B]                     │ │
│  │ Category: [Front Row]                         │ │
│  │ Price: [₹150]                                 │ │
│  │ Color: [🎨 #FF5733]                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Row Assignment 2                              │ │
│  │ From Row: [C] To Row: [E]                     │ │
│  │ Category: [Standard]                          │ │
│  │ Price: [₹200]                                 │ │
│  │ Color: [🎨 #3498DB]                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Row Assignment 3                              │ │
│  │ From Row: [F] To Row: [I]                     │ │
│  │ Category: [VIP]                               │ │
│  │ Price: [₹300]                                 │ │
│  │ Color: [🎨 #F1C40F]                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [+ Add More Rows]                                 │
│                                                     │
│  [Save Configuration]                              │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **BACKEND LOGIC**

### **What Happens When Admin Saves:**

1. **Validate Subtype** - Check if IMAX, Standard Cinema, etc.
2. **Create Configuration** - Store event_id, subtype, gap_rule
3. **Create Categories** - Create unique categories (Front Row, VIP, etc.)
4. **Create Rows** - For each row assignment:
   - Create rows from startRow to endRow
   - Link each row to its category
   - Set seats per row
5. **Generate Seats** - For each row:
   - Create individual seats (A1, A2, A3, etc.)
   - Mark as available (not booked)
6. **Update Counts** - Auto-calculate:
   - Total capacity
   - Seats per category
   - Available seats

---

## 📊 **DATABASE STRUCTURE**

### **Example: IMAX with 280 seats**

**theatre_configurations:**
```
id | event_id | subtype | total_capacity | gap_rule
1  | 123      | IMAX    | 280            | none
```

**theatre_categories:**
```
id | config_id | category_name | price  | color    | total_seats | available_seats
1  | 1         | Front Row     | 150.00 | #FF5733  | 40          | 40
2  | 1         | Standard      | 200.00 | #3498DB  | 60          | 60
3  | 1         | VIP           | 300.00 | #F1C40F  | 80          | 80
4  | 1         | Elite         | 250.00 | #9B59B6  | 60          | 60
5  | 1         | Balcony       | 180.00 | #E74C3C  | 40          | 40
```

**theatre_rows:**
```
id | config_id | category_id | row_number | row_label | seats_per_row
1  | 1         | 1           | 1          | A         | 20
2  | 1         | 1           | 2          | B         | 20
3  | 1         | 2           | 3          | C         | 20
4  | 1         | 2           | 4          | D         | 20
5  | 1         | 2           | 5          | E         | 20
... (continues for all 14 rows)
```

**theatre_seats:**
```
id | row_id | seat_number | seat_label | is_booked
1  | 1      | 1           | A1         | false
2  | 1      | 2           | A2         | false
3  | 1      | 3           | A3         | false
... (continues for all 280 seats)
```

---

## 🎯 **KEY FEATURES**

### **1. Flexible Row Assignment**
- Admin can assign any row range to any category
- Example: "Row A-D = Elite, Row E-H = VIP"

### **2. Category Reuse**
- Same category can be used for multiple row ranges
- Example: "Row A-B = VIP, Row G-H = VIP"

### **3. Custom Seats Per Row**
- Can override default seats for specific categories
- Example: Recliner rows might have fewer seats

### **4. Auto-Generation**
- Seats are automatically generated
- Seat labels auto-created (A1, A2, B1, etc.)

### **5. Validation**
- Prevents overlapping row assignments
- Enforces max capacity limits
- Validates category names per subtype

---

## 🚀 **TESTING THE API**

### **Using Postman:**

1. **Create Configuration**
   - Method: POST
   - URL: `http://localhost:8080/api/admin/theatre/configure`
   - Body: (see JSON example above)

2. **Update Row Assignments**
   - Method: PUT
   - URL: `http://localhost:8080/api/admin/theatre/456/rows`
   - Body: Array of row assignments

---

## ✅ **PHASE 2 COMPLETE**

**What's Working:**
- ✅ Admin can select row ranges (e.g., Row A-D)
- ✅ Admin can assign category names (e.g., "Elite")
- ✅ Admin can set prices per category
- ✅ Admin can choose colors for visual representation
- ✅ System auto-generates all seats
- ✅ Database tracks everything properly

**Next: Phase 3 - Build the Admin UI for this flow**

---

**Status**: Backend API is complete and ready for frontend integration!
