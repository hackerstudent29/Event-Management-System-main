# 💳 Real-time Wallet Payment System Guide

This system implements a server-to-server wallet transfer between **Website A (Events)** and **Wallet App B (Payments)**.

## 🏗️ Architecture

1.  **Website A Frontend (React)**:
    *   Connects to Socket.IO on port `8085`.
    *   Sends payment request to Website A Backend.
2.  **Website A Backend (Spring Boot)**:
    *   Exposes `/api/payments/initiate-wallet-transfer`.
    *   Calls Wallet App B API.
    *   On success, saves bookings to the primary database.
    *   Pushes status update via Socket.IO.
3.  **Wallet App B (Node.js)**:
    *   Exposes `/api/wallet/transfer`.
    *   Manages wallet balances and transactions in the database.
    *   Port: `5000`.

---

## 🚀 How to Run

### 1. Database Setup
Ensure you have ran the SQL in `database/wallet_schema.sql` on your PostgreSQL database.
This creates the `wallets` and `transactions` tables.

### 2. Start Wallet App B (Node.js)
```bash
cd wallet-backend
npm install
npm start
```
*Port: 5000*

### 3. Start Website A Backend (Spring Boot)
Ensure `pom.xml` is updated and rerun/rebuild.
```bash
cd backend
mvn spring-boot:run
```
*Port: 8080 (API) / 8085 (Socket.IO)*

### 4. Start Website A Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*Port: 5173*

---

## 🧪 Testing the Flow
1.  Log in to the Website.
2.  Select an event and seats.
3.  Go to **Order Summary**.
4.  Select **Wallet App** as payment method.
5.  Click **Confirm Payment**.
6.  The backend will call the Wallet service on port 5000.
7.  Upon success, the UI will update **instantly** without refreshing, showing "Payment Successful!".

---

## 🔐 Security Notes
*   **Server-to-Server**: The transfer happens between backends. No credentials or balance manipulation happens on the client.
*   **Atomic Transactions**: The Node.js backend uses PostgreSQL `BEGIN/COMMIT` with `FOR UPDATE` locks to prevent double-spending.
*   **Socket.IO Rooms**: Frontend only receives updates for its specific `referenceId`.
