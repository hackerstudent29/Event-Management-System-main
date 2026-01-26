# 🔥 REAL-TIME WALLET PAYMENT SYSTEM - COMPLETE ARCHITECTURE

> **Status**: Ready for Implementation
> **Type**: Server-to-Server Wallet Transfer (No QR, No UPI Simulation)
> **Real-time**: WebSocket-based instant updates

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Security Model](#security-model)
8. [User Flow](#user-flow)
9. [API Specifications](#api-specifications)
10. [WebSocket Events](#websocket-events)
11. [Error Handling](#error-handling)
12. [Testing Strategy](#testing-strategy)

---

## 🎯 SYSTEM OVERVIEW

### What This Is
- **Real-time wallet-to-wallet transfer system**
- User clicks "Pay" → Coins transfer instantly
- Website knows immediately if payment succeeded/failed
- No QR codes, no scanning, no manual confirmation

### What This Is NOT
- ❌ Not UPI simulation
- ❌ Not external payment gateway
- ❌ Not blockchain/cryptocurrency
- ❌ Not asynchronous payment processing

### Core Principle
> **The wallet backend is the single source of truth**
> Website A never credits anything — it only requests transfers

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│  ┌────────────────┐              ┌─────────────────────┐    │
│  │  Website A     │              │   Wallet App        │    │
│  │  (Event Mgmt)  │              │   (Mobile/Web)      │    │
│  │  Frontend      │              │   Frontend          │    │
│  └────────┬───────┘              └──────────┬──────────┘    │
│           │                                  │               │
│           │ WebSocket                        │ WebSocket     │
│           │ (Real-time updates)              │               │
└───────────┼──────────────────────────────────┼───────────────┘
            │                                  │
            ▼                                  ▼
┌───────────────────────┐          ┌──────────────────────────┐
│   Website A Backend   │          │   Wallet App Backend     │
│   (Event Management)  │◄────────►│   (Wallet Service)       │
│                       │  API     │                          │
│  - Order Management   │  Calls   │  - Balance Management    │
│  - Payment Requests   │          │  - Transaction Engine    │
│  - WebSocket Server   │          │  - Transfer Processing   │
└───────────┬───────────┘          └──────────┬───────────────┘
            │                                  │
            │                                  │
            ▼                                  ▼
    ┌──────────────┐                  ┌──────────────┐
    │  Orders DB   │                  │  Wallet DB   │
    │  (Postgres)  │                  │  (Postgres)  │
    └──────────────┘                  └──────────────┘
```

---

## 🛠️ TECHNOLOGY STACK

### Backend
- **Language**: Java (Spring Boot) - Already in use
- **Database**: PostgreSQL - Already in use
- **WebSocket**: Spring WebSocket (STOMP over WebSocket)
- **HTTP Client**: RestTemplate / WebClient for inter-service calls
- **Security**: JWT tokens for authentication

### Frontend
- **Framework**: React - Already in use
- **WebSocket Client**: SockJS + STOMP.js
- **HTTP Client**: Axios - Already in use
- **State Management**: React Context / Redux (if needed)

### Infrastructure
- **API Gateway**: Optional (for production)
- **Load Balancer**: Optional (for scaling)
- **Message Queue**: Optional (for high volume)

---

## 💾 DATABASE SCHEMA

### Website A Database (Event Management)

```sql
-- Orders table (already exists, needs modification)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL, -- PENDING, INITIATED, COMPLETED, FAILED, REFUNDED
    payment_method VARCHAR(50), -- WALLET, CARD, etc.
    wallet_transaction_id VARCHAR(255), -- Reference to wallet transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table (new)
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- INITIATED, SUCCESS, FAILED, REFUNDED
    wallet_transaction_id VARCHAR(255), -- From wallet service
    failure_reason TEXT,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB -- Store additional data
);

-- Add indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_wallet_txn_id ON payment_transactions(wallet_transaction_id);
```

### Wallet App Database (Wallet Service)

```sql
-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE, -- Same user_id as in Website A
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, FROZEN, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- TXN_xxxxx
    from_wallet_id UUID REFERENCES wallets(id),
    to_wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- TRANSFER, CREDIT, DEBIT, REFUND
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING
    reference_id VARCHAR(255), -- External reference (e.g., order_id from Website A)
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Event wallet (special wallet for receiving payments)
INSERT INTO wallets (id, user_id, balance, status) 
VALUES (
    'EVENT_WALLET_001', 
    'SYSTEM_EVENT_WALLET', 
    0.00, 
    'ACTIVE'
);

-- Add indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_from_wallet ON wallet_transactions(from_wallet_id);
CREATE INDEX idx_wallet_transactions_to_wallet ON wallet_transactions(to_wallet_id);
CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_id);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
```

---

## 🔧 BACKEND IMPLEMENTATION

### 1. Wallet Service API (New Microservice)

#### WalletController.java

```java
@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    
    @Autowired
    private WalletService walletService;
    
    // Get wallet balance
    @GetMapping("/balance/{userId}")
    public ResponseEntity<WalletBalanceResponse> getBalance(
        @PathVariable UUID userId,
        @RequestHeader("X-API-Key") String apiKey
    ) {
        // Validate API key
        validateApiKey(apiKey);
        
        WalletBalanceResponse balance = walletService.getBalance(userId);
        return ResponseEntity.ok(balance);
    }
    
    // Transfer funds (SERVER-TO-SERVER ONLY)
    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(
        @RequestBody TransferRequest request,
        @RequestHeader("X-API-Key") String apiKey
    ) {
        // Validate API key (only Website A backend can call this)
        validateApiKey(apiKey);
        
        // Validate request
        if (request.getAmount() <= 0) {
            return ResponseEntity.badRequest()
                .body(new TransferResponse("FAILED", "Invalid amount", null));
        }
        
        try {
            TransferResponse response = walletService.processTransfer(request);
            return ResponseEntity.ok(response);
        } catch (InsufficientBalanceException e) {
            return ResponseEntity.ok(
                new TransferResponse("FAILED", "INSUFFICIENT_BALANCE", null)
            );
        } catch (Exception e) {
            return ResponseEntity.ok(
                new TransferResponse("FAILED", e.getMessage(), null)
            );
        }
    }
    
    // Refund transaction
    @PostMapping("/refund")
    public ResponseEntity<RefundResponse> refund(
        @RequestBody RefundRequest request,
        @RequestHeader("X-API-Key") String apiKey
    ) {
        validateApiKey(apiKey);
        RefundResponse response = walletService.processRefund(request);
        return ResponseEntity.ok(response);
    }
}
```

#### WalletService.java

```java
@Service
@Transactional
public class WalletService {
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private WalletTransactionRepository transactionRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    public TransferResponse processTransfer(TransferRequest request) {
        // Start atomic transaction
        String transactionId = generateTransactionId();
        
        try {
            // 1. Lock wallets (pessimistic locking to prevent race conditions)
            Wallet fromWallet = walletRepository.findByUserIdWithLock(request.getFromUserId());
            Wallet toWallet = walletRepository.findByIdWithLock(request.getToWalletId());
            
            // 2. Validate
            if (fromWallet == null || toWallet == null) {
                throw new WalletNotFoundException("Wallet not found");
            }
            
            if (!fromWallet.getStatus().equals("ACTIVE")) {
                throw new WalletInactiveException("Wallet is not active");
            }
            
            if (fromWallet.getBalance().compareTo(request.getAmount()) < 0) {
                throw new InsufficientBalanceException("Insufficient balance");
            }
            
            // 3. Deduct from source wallet
            fromWallet.setBalance(fromWallet.getBalance().subtract(request.getAmount()));
            walletRepository.save(fromWallet);
            
            // 4. Credit to destination wallet
            toWallet.setBalance(toWallet.getBalance().add(request.getAmount()));
            walletRepository.save(toWallet);
            
            // 5. Record transaction
            WalletTransaction transaction = new WalletTransaction();
            transaction.setTransactionId(transactionId);
            transaction.setFromWalletId(fromWallet.getId());
            transaction.setToWalletId(toWallet.getId());
            transaction.setAmount(request.getAmount());
            transaction.setTransactionType("TRANSFER");
            transaction.setStatus("SUCCESS");
            transaction.setReferenceId(request.getReference());
            transaction.setDescription("Payment for event: " + request.getReference());
            transaction.setCompletedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            
            // 6. Notify user via WebSocket (real-time update)
            notificationService.notifyBalanceUpdate(
                request.getFromUserId(), 
                fromWallet.getBalance()
            );
            
            // 7. Return success response
            return new TransferResponse(
                "SUCCESS",
                null,
                transactionId,
                fromWallet.getBalance()
            );
            
        } catch (InsufficientBalanceException | WalletNotFoundException | WalletInactiveException e) {
            // Record failed transaction
            WalletTransaction failedTxn = new WalletTransaction();
            failedTxn.setTransactionId(transactionId);
            failedTxn.setAmount(request.getAmount());
            failedTxn.setTransactionType("TRANSFER");
            failedTxn.setStatus("FAILED");
            failedTxn.setReferenceId(request.getReference());
            failedTxn.setDescription("Failed: " + e.getMessage());
            transactionRepository.save(failedTxn);
            
            throw e;
        }
    }
    
    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
```

### 2. Website A Backend Integration

#### PaymentService.java (Event Management Backend)

```java
@Service
public class PaymentService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;
    
    @Autowired
    private WebSocketService webSocketService;
    
    @Value("${wallet.service.url}")
    private String walletServiceUrl;
    
    @Value("${wallet.service.api.key}")
    private String walletApiKey;
    
    private static final String EVENT_WALLET_ID = "EVENT_WALLET_001";
    
    public PaymentResponse initiatePayment(UUID userId, UUID orderId) {
        // 1. Get order details
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        // 2. Validate order status
        if (!order.getPaymentStatus().equals("PENDING")) {
            throw new InvalidOrderStateException("Order already processed");
        }
        
        // 3. Update order status to INITIATED
        order.setPaymentStatus("INITIATED");
        orderRepository.save(order);
        
        // 4. Create payment transaction record
        PaymentTransaction paymentTxn = new PaymentTransaction();
        paymentTxn.setOrderId(orderId);
        paymentTxn.setUserId(userId);
        paymentTxn.setAmount(order.getTotalAmount());
        paymentTxn.setStatus("INITIATED");
        paymentTransactionRepository.save(paymentTxn);
        
        // 5. Call Wallet Service (SERVER-TO-SERVER)
        try {
            TransferRequest transferRequest = new TransferRequest();
            transferRequest.setFromUserId(userId);
            transferRequest.setToWalletId(EVENT_WALLET_ID);
            transferRequest.setAmount(order.getTotalAmount());
            transferRequest.setReference(orderId.toString());
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-API-Key", walletApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<TransferRequest> entity = new HttpEntity<>(transferRequest, headers);
            
            ResponseEntity<TransferResponse> response = restTemplate.postForEntity(
                walletServiceUrl + "/api/wallet/transfer",
                entity,
                TransferResponse.class
            );
            
            TransferResponse transferResponse = response.getBody();
            
            // 6. Process response
            if ("SUCCESS".equals(transferResponse.getStatus())) {
                // Payment successful
                order.setPaymentStatus("COMPLETED");
                order.setWalletTransactionId(transferResponse.getTransactionId());
                orderRepository.save(order);
                
                paymentTxn.setStatus("SUCCESS");
                paymentTxn.setWalletTransactionId(transferResponse.getTransactionId());
                paymentTxn.setCompletedAt(LocalDateTime.now());
                paymentTransactionRepository.save(paymentTxn);
                
                // 7. Notify user via WebSocket (REAL-TIME UPDATE)
                webSocketService.notifyPaymentSuccess(userId, orderId, transferResponse.getTransactionId());
                
                return new PaymentResponse("SUCCESS", "Payment completed", orderId);
                
            } else {
                // Payment failed
                order.setPaymentStatus("FAILED");
                orderRepository.save(order);
                
                paymentTxn.setStatus("FAILED");
                paymentTxn.setFailureReason(transferResponse.getReason());
                paymentTxn.setCompletedAt(LocalDateTime.now());
                paymentTransactionRepository.save(paymentTxn);
                
                // 8. Notify user via WebSocket
                webSocketService.notifyPaymentFailure(userId, orderId, transferResponse.getReason());
                
                return new PaymentResponse("FAILED", transferResponse.getReason(), orderId);
            }
            
        } catch (Exception e) {
            // Handle connection errors
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            
            paymentTxn.setStatus("FAILED");
            paymentTxn.setFailureReason("Service unavailable: " + e.getMessage());
            paymentTransactionRepository.save(paymentTxn);
            
            webSocketService.notifyPaymentFailure(userId, orderId, "Service unavailable");
            
            return new PaymentResponse("FAILED", "Service unavailable", orderId);
        }
    }
}
```

#### WebSocketService.java (Real-time notifications)

```java
@Service
public class WebSocketService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public void notifyPaymentSuccess(UUID userId, UUID orderId, String transactionId) {
        PaymentNotification notification = new PaymentNotification();
        notification.setStatus("SUCCESS");
        notification.setOrderId(orderId);
        notification.setTransactionId(transactionId);
        notification.setMessage("Payment successful!");
        notification.setTimestamp(LocalDateTime.now());
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/payment",
            notification
        );
    }
    
    public void notifyPaymentFailure(UUID userId, UUID orderId, String reason) {
        PaymentNotification notification = new PaymentNotification();
        notification.setStatus("FAILED");
        notification.setOrderId(orderId);
        notification.setReason(reason);
        notification.setMessage("Payment failed: " + reason);
        notification.setTimestamp(LocalDateTime.now());
        
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/payment",
            notification
        );
    }
}
```

#### WebSocketConfig.java

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("http://localhost:5173") // Your frontend URL
            .withSockJS();
    }
}
```

---

## 💻 FRONTEND IMPLEMENTATION

### 1. WebSocket Connection Hook

```javascript
// src/hooks/usePaymentWebSocket.js
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const usePaymentWebSocket = (userId) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Create WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect(
      {},
      (frame) => {
        console.log('Connected to WebSocket:', frame);
        setIsConnected(true);

        // Subscribe to payment notifications for this user
        client.subscribe(`/user/${userId}/queue/payment`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('Payment notification received:', notification);
          setPaymentStatus(notification);
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      }
    );

    stompClient.current = client;

    // Cleanup on unmount
    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, [userId]);

  return { paymentStatus, isConnected };
};
```

### 2. Payment Component

```javascript
// src/components/Payment/WalletPayment.jsx
import React, { useState, useEffect } from 'react';
import { usePaymentWebSocket } from '../../hooks/usePaymentWebSocket';
import axios from 'axios';

const WalletPayment = ({ orderId, amount, userId, onSuccess, onFailure }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { paymentStatus, isConnected } = usePaymentWebSocket(userId);

  // Listen for real-time payment updates
  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus.status === 'SUCCESS') {
      setIsProcessing(false);
      onSuccess(paymentStatus);
    } else if (paymentStatus.status === 'FAILED') {
      setIsProcessing(false);
      setError(paymentStatus.reason);
      onFailure(paymentStatus);
    }
  }, [paymentStatus, onSuccess, onFailure]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call backend to initiate payment
      const response = await axios.post(
        '/api/payments/initiate',
        {
          orderId,
          userId,
          amount
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // WebSocket will handle the real-time response
      // No need to process response here
      console.log('Payment initiated:', response.data);

    } catch (err) {
      setIsProcessing(false);
      setError(err.response?.data?.message || 'Payment failed');
      onFailure({ reason: err.message });
    }
  };

  return (
    <div className="wallet-payment">
      <div className="payment-info">
        <h3>Pay with Wallet</h3>
        <p className="amount">₹{amount}</p>
        
        {!isConnected && (
          <div className="warning">
            ⚠️ Connecting to payment service...
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing || !isConnected}
        className="pay-button"
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="loader"></div>
          <p>Transferring coins from your wallet...</p>
        </div>
      )}
    </div>
  );
};

export default WalletPayment;
```

### 3. Payment Success/Failure Modals

```javascript
// src/components/Payment/PaymentResult.jsx
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentResult = ({ status, transactionId, reason, onClose }) => {
  const isSuccess = status === 'SUCCESS';

  return (
    <div className="payment-result-modal">
      <div className="modal-content">
        {isSuccess ? (
          <>
            <CheckCircle size={64} color="#10b981" />
            <h2>Payment Successful!</h2>
            <p>Your event booking is confirmed</p>
            <p className="transaction-id">
              Transaction ID: {transactionId}
            </p>
          </>
        ) : (
          <>
            <XCircle size={64} color="#ef4444" />
            <h2>Payment Failed</h2>
            <p className="error-reason">{reason}</p>
            {reason === 'INSUFFICIENT_BALANCE' && (
              <p className="suggestion">
                Please add funds to your wallet and try again
              </p>
            )}
          </>
        )}

        <button onClick={onClose} className="close-button">
          {isSuccess ? 'View Booking' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;
```

---

## 🔒 SECURITY MODEL

### 1. API Key Authentication (Server-to-Server)

```java
// WalletApiKeyValidator.java
@Component
public class WalletApiKeyValidator {
    
    @Value("${wallet.api.keys}")
    private List<String> validApiKeys;
    
    public boolean validateApiKey(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            return false;
        }
        return validApiKeys.contains(apiKey);
    }
}
```

### 2. Rate Limiting

```java
// RateLimitingFilter.java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    
    private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        String userId = extractUserId(request);
        RateLimiter limiter = limiters.computeIfAbsent(
            userId,
            k -> RateLimiter.create(5.0) // 5 requests per second
        );
        
        if (!limiter.tryAcquire()) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Rate limit exceeded");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 3. Transaction Idempotency

```java
// Prevent duplicate transactions
@Service
public class IdempotencyService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isRequestProcessed(String idempotencyKey) {
        return redisTemplate.hasKey("idempotency:" + idempotencyKey);
    }
    
    public void markRequestProcessed(String idempotencyKey, String result) {
        redisTemplate.opsForValue().set(
            "idempotency:" + idempotencyKey,
            result,
            24,
            TimeUnit.HOURS
        );
    }
}
```

---

## 🎬 USER FLOW

### Step-by-Step Experience

1. **User selects event and seats**
   - Frontend: Event selection page
   - Action: User clicks "Book Now"

2. **Order creation**
   - Frontend: Sends booking request
   - Backend: Creates order with status `PENDING`
   - Response: Order ID returned

3. **Payment page**
   - Frontend: Shows payment options
   - User: Clicks "Pay with Wallet"
   - Frontend: Establishes WebSocket connection

4. **Payment initiation**
   - Frontend: Calls `/api/payments/initiate`
   - Backend: Updates order status to `INITIATED`
   - Backend: Calls Wallet Service `/api/wallet/transfer`

5. **Wallet processing (INSTANT)**
   - Wallet Service: Locks wallets
   - Wallet Service: Checks balance
   - Wallet Service: Transfers funds (or fails)
   - Wallet Service: Returns response (< 500ms)

6. **Real-time update**
   - Backend: Receives wallet response
   - Backend: Updates order status
   - Backend: Sends WebSocket notification to user
   - Frontend: Receives notification (< 1 second total)

7. **UI update**
   - Frontend: Shows success/failure modal
   - Frontend: Redirects to booking confirmation (if success)

---

## 📡 API SPECIFICATIONS

### Website A APIs

#### POST /api/payments/initiate
```json
Request:
{
  "orderId": "uuid",
  "userId": "uuid",
  "amount": 300.00
}

Response (Success):
{
  "status": "PROCESSING",
  "message": "Payment initiated",
  "orderId": "uuid"
}

Response (Failure):
{
  "status": "FAILED",
  "message": "Invalid order",
  "orderId": "uuid"
}
```

### Wallet Service APIs

#### POST /api/wallet/transfer
```json
Request:
Headers: {
  "X-API-Key": "secret_key_here"
}
Body: {
  "fromUserId": "uuid",
  "toWalletId": "EVENT_WALLET_001",
  "amount": 300.00,
  "reference": "order_uuid"
}

Response (Success):
{
  "status": "SUCCESS",
  "reason": null,
  "transactionId": "TXN_1234567890_abcd1234",
  "newBalance": 700.00
}

Response (Insufficient Balance):
{
  "status": "FAILED",
  "reason": "INSUFFICIENT_BALANCE",
  "transactionId": null,
  "newBalance": null
}
```

#### GET /api/wallet/balance/{userId}
```json
Request:
Headers: {
  "X-API-Key": "secret_key_here"
}

Response:
{
  "userId": "uuid",
  "balance": 1000.00,
  "currency": "INR",
  "status": "ACTIVE"
}
```

---

## 🔌 WEBSOCKET EVENTS

### Client → Server
```javascript
// Connect
CONNECT /ws
Headers: {
  Authorization: "Bearer jwt_token"
}

// Subscribe to payment updates
SUBSCRIBE /user/{userId}/queue/payment
```

### Server → Client
```javascript
// Payment success notification
{
  "status": "SUCCESS",
  "orderId": "uuid",
  "transactionId": "TXN_xxx",
  "message": "Payment successful!",
  "timestamp": "2026-01-26T08:30:00"
}

// Payment failure notification
{
  "status": "FAILED",
  "orderId": "uuid",
  "reason": "INSUFFICIENT_BALANCE",
  "message": "Payment failed: Insufficient balance",
  "timestamp": "2026-01-26T08:30:00"
}
```

---

## ⚠️ ERROR HANDLING

### Error Types

| Error Code | Reason | User Message | Action |
|------------|--------|--------------|--------|
| INSUFFICIENT_BALANCE | Balance < amount | "Insufficient wallet balance" | Show "Add Funds" button |
| WALLET_NOT_FOUND | User has no wallet | "Wallet not found" | Redirect to wallet creation |
| WALLET_INACTIVE | Wallet frozen/closed | "Wallet is inactive" | Contact support |
| SERVICE_UNAVAILABLE | Wallet service down | "Service temporarily unavailable" | Retry button |
| INVALID_AMOUNT | Amount <= 0 | "Invalid payment amount" | Contact support |
| ORDER_NOT_FOUND | Invalid order ID | "Order not found" | Redirect to home |
| DUPLICATE_TRANSACTION | Already processed | "Payment already processed" | Show order status |

### Frontend Error Handling

```javascript
const handlePaymentError = (error) => {
  switch (error.reason) {
    case 'INSUFFICIENT_BALANCE':
      showModal({
        title: 'Insufficient Balance',
        message: 'You don\'t have enough coins in your wallet',
        actions: [
          { label: 'Add Funds', onClick: () => navigate('/wallet/add-funds') },
          { label: 'Cancel', onClick: closeModal }
        ]
      });
      break;
      
    case 'SERVICE_UNAVAILABLE':
      showModal({
        title: 'Service Unavailable',
        message: 'Payment service is temporarily unavailable',
        actions: [
          { label: 'Retry', onClick: retryPayment },
          { label: 'Cancel', onClick: closeModal }
        ]
      });
      break;
      
    default:
      showModal({
        title: 'Payment Failed',
        message: error.message || 'An unexpected error occurred',
        actions: [
          { label: 'Contact Support', onClick: () => navigate('/support') },
          { label: 'Close', onClick: closeModal }
        ]
      });
  }
};
```

---

## 🧪 TESTING STRATEGY

### 1. Unit Tests

```java
// WalletServiceTest.java
@Test
public void testSuccessfulTransfer() {
    // Given
    UUID userId = UUID.randomUUID();
    Wallet wallet = createWalletWithBalance(userId, 1000.00);
    TransferRequest request = new TransferRequest(userId, EVENT_WALLET_ID, 300.00, "ORDER_123");
    
    // When
    TransferResponse response = walletService.processTransfer(request);
    
    // Then
    assertEquals("SUCCESS", response.getStatus());
    assertEquals(700.00, wallet.getBalance());
}

@Test
public void testInsufficientBalance() {
    // Given
    UUID userId = UUID.randomUUID();
    Wallet wallet = createWalletWithBalance(userId, 100.00);
    TransferRequest request = new TransferRequest(userId, EVENT_WALLET_ID, 300.00, "ORDER_123");
    
    // When & Then
    assertThrows(InsufficientBalanceException.class, () -> {
        walletService.processTransfer(request);
    });
}
```

### 2. Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
public class PaymentIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testEndToEndPayment() throws Exception {
        // Create order
        // Initiate payment
        // Verify wallet transfer
        // Verify WebSocket notification
        // Verify order status updated
    }
}
```

### 3. Load Testing

```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function() {
  let payload = JSON.stringify({
    orderId: 'test-order-id',
    userId: 'test-user-id',
    amount: 300.00
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
  };

  let res = http.post('http://localhost:8080/api/payments/initiate', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

---

## 📊 MONITORING & METRICS

### Key Metrics to Track

1. **Payment Success Rate**
   - Target: > 99%
   - Alert if < 95%

2. **Average Payment Time**
   - Target: < 1 second
   - Alert if > 3 seconds

3. **WebSocket Connection Success**
   - Target: > 99.5%
   - Alert if < 98%

4. **Insufficient Balance Rate**
   - Track for user experience improvements

5. **Service Availability**
   - Target: 99.9% uptime

### Logging

```java
@Slf4j
@Service
public class PaymentService {
    
    public PaymentResponse initiatePayment(UUID userId, UUID orderId) {
        log.info("Payment initiated - User: {}, Order: {}", userId, orderId);
        
        try {
            TransferResponse response = callWalletService(request);
            
            if ("SUCCESS".equals(response.getStatus())) {
                log.info("Payment successful - User: {}, Order: {}, TxnId: {}", 
                    userId, orderId, response.getTransactionId());
            } else {
                log.warn("Payment failed - User: {}, Order: {}, Reason: {}", 
                    userId, orderId, response.getReason());
            }
            
            return processResponse(response);
            
        } catch (Exception e) {
            log.error("Payment error - User: {}, Order: {}, Error: {}", 
                userId, orderId, e.getMessage(), e);
            throw e;
        }
    }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Going Live

- [ ] Database migrations applied
- [ ] API keys generated and secured
- [ ] WebSocket endpoints configured
- [ ] CORS settings updated
- [ ] Rate limiting enabled
- [ ] Monitoring dashboards set up
- [ ] Error tracking configured (Sentry/etc)
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Backup and recovery tested
- [ ] Documentation updated
- [ ] Team trained on support procedures

### Environment Variables

```properties
# Website A Backend (.env)
WALLET_SERVICE_URL=http://wallet-service:8081
WALLET_API_KEY=your_secret_api_key_here
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Wallet Service (.env)
DATABASE_URL=jdbc:postgresql://localhost:5432/wallet_db
API_KEYS=key1,key2,key3
REDIS_URL=redis://localhost:6379
```

---

## 🎯 SUMMARY

### What You Get

✅ **Real-time payment processing** (< 1 second)
✅ **Instant user feedback** via WebSocket
✅ **Secure server-to-server** communication
✅ **Atomic transactions** (no partial transfers)
✅ **Proper error handling** with user-friendly messages
✅ **Scalable architecture** (can handle high volume)
✅ **Complete audit trail** (all transactions logged)

### What Makes This Strong

1. **Single Source of Truth**: Wallet service controls everything
2. **Atomic Operations**: Database transactions ensure consistency
3. **Real-time Updates**: WebSocket provides instant feedback
4. **Security**: API keys + JWT + rate limiting
5. **Simplicity**: No QR, no scanning, no manual steps
6. **User Experience**: Feels like in-app purchases

---

## 📝 NEXT STEPS

1. **Review this architecture** - Ensure it matches your requirements
2. **Set up Wallet Service** - Create new Spring Boot project
3. **Implement database schemas** - Run migrations
4. **Build Wallet APIs** - Transfer, balance, refund endpoints
5. **Integrate with Website A** - Payment service + WebSocket
6. **Build frontend components** - Payment UI + WebSocket hooks
7. **Test thoroughly** - Unit, integration, load tests
8. **Deploy to staging** - Test end-to-end
9. **Go live** - Monitor closely

---

**Status**: ✅ Architecture Complete - Ready for Implementation
**Estimated Development Time**: 2-3 weeks (with testing)
**Complexity**: Medium (well-defined, proven patterns)
