# 🚀 QUICK START GUIDE - Wallet Payment System

**Goal**: Get your wallet payment system up and running in the fastest way possible.

---

## 📋 PREREQUISITES

Before starting, ensure you have:
- ✅ PostgreSQL installed and running
- ✅ Java 17+ installed
- ✅ Node.js 18+ installed
- ✅ Your Event Management System running
- ✅ Basic understanding of Spring Boot and React

---

## ⚡ FASTEST PATH TO WORKING SYSTEM

Follow these steps in order. Each step builds on the previous one.

---

## STEP 1: Create Wallet Database (5 minutes)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE wallet_service;

-- Connect to it
\c wallet_service

-- Create tables
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

-- Create indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_from_wallet ON wallet_transactions(from_wallet_id);
CREATE INDEX idx_wallet_transactions_to_wallet ON wallet_transactions(to_wallet_id);
CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_id);

-- Create event wallet (system wallet to receive payments)
INSERT INTO wallets (id, user_id, balance, status) 
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 0.00, 'ACTIVE');

-- Create test user wallets
-- Replace these UUIDs with actual user IDs from your users table
INSERT INTO wallets (user_id, balance) VALUES
('YOUR_TEST_USER_ID_1'::uuid, 1000.00),
('YOUR_TEST_USER_ID_2'::uuid, 50.00),
('YOUR_TEST_USER_ID_3'::uuid, 5000.00);
```

✅ **Checkpoint**: You should now have a wallet database with tables and test data.

---

## STEP 2: Update Event Management Database (3 minutes)

```sql
-- Connect to your event management database
\c event_management

-- Add wallet transaction reference to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wallet_transaction_id VARCHAR(255);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
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

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_wallet_txn_id ON payment_transactions(wallet_transaction_id);
```

✅ **Checkpoint**: Your event management database now has payment tracking tables.

---

## STEP 3: Create Wallet Service Project (10 minutes)

```bash
# Navigate to your project root
cd "d:\.gemini\Event Management System"

# Create wallet service directory
mkdir wallet-service
cd wallet-service

# Create Spring Boot project structure
mkdir -p src/main/java/com/wallet
mkdir -p src/main/resources
mkdir -p src/test/java/com/wallet
```

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.wallet</groupId>
    <artifactId>wallet-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

Create `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8081
spring.application.name=wallet-service

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/wallet_service
spring.datasource.username=postgres
spring.datasource.password=your_password_here
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# API Security
wallet.api.keys=SECRET_KEY_12345,ANOTHER_KEY_67890

# Logging
logging.level.com.wallet=DEBUG
```

✅ **Checkpoint**: Wallet service project structure is ready.

---

## STEP 4: Implement Wallet Service Core (30 minutes)

I'll create the essential files for you. Let me know when you're ready, and I'll generate:

1. `WalletServiceApplication.java` - Main application
2. `Wallet.java` - Wallet entity
3. `WalletTransaction.java` - Transaction entity
4. `WalletRepository.java` - Wallet repository
5. `WalletTransactionRepository.java` - Transaction repository
6. `WalletService.java` - Core business logic
7. `WalletController.java` - REST API
8. `ApiKeyAuthFilter.java` - Security filter
9. `SecurityConfig.java` - Security configuration

**Would you like me to create these files now?**

---

## STEP 5: Add WebSocket to Event Management Backend (20 minutes)

Update your existing backend with:

1. WebSocket configuration
2. Payment service
3. WebSocket notification service
4. Payment controller

**Would you like me to create these files now?**

---

## STEP 6: Implement Frontend (30 minutes)

Add to your React frontend:

1. WebSocket hook
2. Wallet payment component
3. Payment result modal
4. Integration with booking flow

**Would you like me to create these files now?**

---

## STEP 7: Test the System (15 minutes)

### Test Flow:

1. **Start Wallet Service**:
   ```bash
   cd wallet-service
   mvn spring-boot:run
   ```
   Should run on http://localhost:8081

2. **Start Event Management Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Should run on http://localhost:8080

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Should run on http://localhost:5173

4. **Test Payment**:
   - Login with test user
   - Select an event
   - Choose seats
   - Click "Pay with Wallet"
   - Should see success in < 1 second

---

## 🎯 EXPECTED RESULTS

After completing all steps:

✅ Wallet service running on port 8081
✅ Event management backend running on port 8080
✅ Frontend running on port 5173
✅ User can pay with wallet
✅ Payment completes in < 1 second
✅ Real-time notification appears
✅ Order status updates to COMPLETED
✅ Wallet balance decreases
✅ Event wallet balance increases

---

## 🐛 TROUBLESHOOTING

### Issue: Wallet service won't start
**Check**: Database connection in application.properties
**Fix**: Update username/password

### Issue: WebSocket connection fails
**Check**: CORS configuration
**Fix**: Add frontend URL to allowed origins

### Issue: Payment fails with "Insufficient balance"
**Check**: User wallet balance in database
**Fix**: Update balance: `UPDATE wallets SET balance = 1000.00 WHERE user_id = 'your_user_id';`

### Issue: Payment succeeds but UI doesn't update
**Check**: WebSocket subscription path
**Fix**: Ensure frontend subscribes to `/user/{userId}/queue/payment`

---

## 📞 NEXT STEPS

Once basic flow works:

1. Add error handling
2. Add loading states
3. Add wallet balance display
4. Add transaction history
5. Add refund functionality
6. Add admin dashboard
7. Add monitoring/logging
8. Deploy to production

---

## 🎓 LEARNING RESOURCES

- **Spring WebSocket**: https://spring.io/guides/gs/messaging-stomp-websocket/
- **SockJS Client**: https://github.com/sockjs/sockjs-client
- **STOMP.js**: https://stomp-js.github.io/stomp-websocket/

---

## ✅ READY TO START?

Reply with:
- **"Create wallet service files"** - I'll generate all wallet service code
- **"Create backend integration"** - I'll add payment service to your backend
- **"Create frontend components"** - I'll create React components
- **"Create everything"** - I'll create all files at once

Let me know how you'd like to proceed!
