---
description: Implement Real-Time Wallet Payment System
---

# 🔥 Wallet Payment System Implementation Workflow

This workflow guides you through implementing the complete real-time wallet-to-wallet payment system.

**Reference**: See `WALLET_PAYMENT_ARCHITECTURE.md` for complete technical details.

---

## PHASE 1: Database Setup (Day 1)

### Step 1: Create Wallet Service Database

```sql
-- Create new database for wallet service
CREATE DATABASE wallet_service;
```

### Step 2: Run Wallet Service Migrations

Create file: `backend/wallet-service/src/main/resources/db/migration/V1__create_wallet_tables.sql`

```sql
-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    from_wallet_id UUID REFERENCES wallets(id),
    to_wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference_id VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_from_wallet ON wallet_transactions(from_wallet_id);
CREATE INDEX idx_wallet_transactions_to_wallet ON wallet_transactions(to_wallet_id);
CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_id);

-- Event wallet (system wallet)
INSERT INTO wallets (id, user_id, balance, status) 
VALUES ('EVENT_WALLET_001', 'SYSTEM_EVENT_WALLET', 0.00, 'ACTIVE');
```

### Step 3: Update Event Management Database

Add to existing database:

```sql
-- Add wallet transaction reference to orders table
ALTER TABLE orders 
ADD COLUMN wallet_transaction_id VARCHAR(255);

-- Create payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    wallet_transaction_id VARCHAR(255),
    failure_reason TEXT,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_wallet_txn_id ON payment_transactions(wallet_transaction_id);
```

---

## PHASE 2: Wallet Service Backend (Days 2-4)

### Step 4: Create Wallet Service Project

```bash
cd "d:\.gemini\Event Management System"
mkdir wallet-service
cd wallet-service
```

Create Spring Boot project with dependencies:
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring WebSocket
- Spring Security
- Lombok

### Step 5: Implement Core Wallet Entities

Create:
- `Wallet.java` entity
- `WalletTransaction.java` entity
- `WalletRepository.java`
- `WalletTransactionRepository.java`

### Step 6: Implement Wallet Service Logic

Create `WalletService.java` with:
- `processTransfer()` - Main transfer logic with pessimistic locking
- `getBalance()` - Get user wallet balance
- `processRefund()` - Refund logic
- `generateTransactionId()` - Unique transaction ID generation

**Critical**: Use `@Transactional` and pessimistic locking to prevent race conditions.

### Step 7: Implement Wallet API Controller

Create `WalletController.java` with endpoints:
- `POST /api/wallet/transfer` - Process transfer (API key protected)
- `GET /api/wallet/balance/{userId}` - Get balance (API key protected)
- `POST /api/wallet/refund` - Process refund (API key protected)

### Step 8: Add API Key Security

Create:
- `ApiKeyAuthFilter.java` - Validate X-API-Key header
- `SecurityConfig.java` - Configure security rules
- `application.properties` - Store valid API keys

### Step 9: Test Wallet Service

Create tests:
- `WalletServiceTest.java` - Unit tests
- `WalletControllerTest.java` - Integration tests

Test scenarios:
- ✅ Successful transfer
- ❌ Insufficient balance
- ❌ Wallet not found
- ❌ Invalid amount
- ❌ Concurrent transfers (race condition)

---

## PHASE 3: Event Management Backend Integration (Days 5-7)

### Step 10: Add WebSocket Dependencies

Update `backend/pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Step 11: Configure WebSocket

Create `WebSocketConfig.java`:
- Enable STOMP over WebSocket
- Configure message broker
- Set allowed origins

### Step 12: Implement Payment Service

Create `PaymentService.java`:
- `initiatePayment()` - Main payment flow
- Call Wallet Service via RestTemplate
- Handle success/failure responses
- Update order status
- Trigger WebSocket notifications

### Step 13: Implement WebSocket Notification Service

Create `WebSocketService.java`:
- `notifyPaymentSuccess()` - Send success notification
- `notifyPaymentFailure()` - Send failure notification

### Step 14: Create Payment Controller

Create `PaymentController.java`:
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/status/{orderId}` - Get payment status

### Step 15: Add Configuration

Update `application.properties`:

```properties
# Wallet Service Configuration
wallet.service.url=http://localhost:8081
wallet.service.api.key=your_secret_key_here

# WebSocket Configuration
spring.websocket.allowed-origins=http://localhost:5173
```

---

## PHASE 4: Frontend Implementation (Days 8-10)

### Step 16: Install WebSocket Dependencies

```bash
cd frontend
npm install sockjs-client @stomp/stompjs
```

### Step 17: Create WebSocket Hook

Create `src/hooks/usePaymentWebSocket.js`:
- Connect to WebSocket on mount
- Subscribe to user-specific payment queue
- Handle payment notifications
- Clean up on unmount

### Step 18: Create Wallet Payment Component

Create `src/components/Payment/WalletPayment.jsx`:
- Display payment amount
- Show wallet balance
- Handle payment button click
- Show processing state
- Listen for WebSocket updates

### Step 19: Create Payment Result Component

Create `src/components/Payment/PaymentResult.jsx`:
- Success modal with transaction ID
- Failure modal with error reason
- Action buttons (View Booking / Try Again)

### Step 20: Integrate into Booking Flow

Update booking pages to:
- Show wallet payment option
- Handle payment success → redirect to confirmation
- Handle payment failure → show error + retry

### Step 21: Add Payment Styles

Create `src/styles/payment.css`:
- Payment button styles
- Loading spinner
- Success/failure modals
- Responsive design

---

## PHASE 5: Testing & Refinement (Days 11-12)

### Step 22: Create Test Users with Wallets

```sql
-- Create test users with different balances
INSERT INTO wallets (user_id, balance) VALUES
('test-user-1', 1000.00),  -- Sufficient balance
('test-user-2', 50.00),    -- Insufficient balance
('test-user-3', 0.00);     -- Zero balance
```

### Step 23: Test Complete Flow

Test scenarios:
1. ✅ User with sufficient balance → Payment succeeds
2. ❌ User with insufficient balance → Payment fails with proper error
3. ❌ User with no wallet → Proper error handling
4. ⚡ WebSocket disconnected → Graceful degradation
5. ⚡ Wallet service down → Proper error message

### Step 24: Test Real-time Updates

Verify:
- Payment notification arrives < 1 second
- UI updates immediately
- No page refresh needed
- Proper error messages shown

### Step 25: Load Testing

Use k6 or JMeter to test:
- 100 concurrent payments
- Response time < 2 seconds
- No transaction failures
- No race conditions

---

## PHASE 6: Deployment (Days 13-14)

### Step 26: Environment Configuration

Create production configs:
- Wallet Service: `application-prod.properties`
- Event Management: Update production settings
- Frontend: `.env.production`

### Step 27: Security Hardening

- [ ] Generate strong API keys
- [ ] Enable HTTPS for WebSocket
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring

### Step 28: Deploy Services

1. Deploy Wallet Service (port 8081)
2. Deploy Event Management Backend (port 8080)
3. Deploy Frontend
4. Verify all services can communicate

### Step 29: Smoke Testing

Test in production:
- Create test order
- Initiate payment
- Verify WebSocket connection
- Verify payment completes
- Check database records

### Step 30: Monitoring Setup

Set up:
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Database monitoring
- Alert rules

---

## 🎯 SUCCESS CRITERIA

Your implementation is complete when:

✅ User can pay with wallet in < 1 second
✅ Real-time notification appears immediately
✅ Payment success/failure handled correctly
✅ Insufficient balance shows proper error
✅ WebSocket reconnects automatically
✅ All transactions are atomic (no partial transfers)
✅ Complete audit trail in database
✅ Load testing passes (100 concurrent users)
✅ Error handling is user-friendly
✅ Production deployment successful

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: WebSocket connection fails
**Solution**: Check CORS configuration and allowed origins

### Issue: Payment succeeds but UI doesn't update
**Solution**: Verify WebSocket subscription path matches backend

### Issue: Race condition in wallet transfer
**Solution**: Ensure pessimistic locking is enabled in WalletService

### Issue: Duplicate transactions
**Solution**: Implement idempotency key checking

### Issue: Slow payment processing
**Solution**: Check database indexes and connection pool settings

---

## 📚 REFERENCE FILES

- `WALLET_PAYMENT_ARCHITECTURE.md` - Complete technical specification
- `backend/src/main/java/com/eventmanagement/service/PaymentService.java`
- `wallet-service/src/main/java/com/wallet/service/WalletService.java`
- `frontend/src/hooks/usePaymentWebSocket.js`
- `frontend/src/components/Payment/WalletPayment.jsx`

---

**Estimated Total Time**: 14 days
**Complexity**: Medium
**Team Size**: 1-2 developers
