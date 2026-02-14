package com.eventbooking.service;

import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.eventbooking.dto.Dtos;

import jakarta.annotation.PostConstruct;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.eventbooking.model.PendingPayment;
import com.eventbooking.repository.PendingPaymentRepository;
import java.util.Arrays;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${wallet.service.url:http://localhost:5000}")
    private String walletServiceUrl;

    @Value("${wallet.api.key}")
    private String walletApiKey;

    @Value("${wallet.merchant.id}")
    private String walletMerchantId;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private PendingPaymentRepository pendingPaymentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory storage for pending bookings (ReferenceId -> BookingRequest List)
    private final Map<String, List<Dtos.BookingRequest>> pendingBookings = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        logger.info("PaymentService initialized with Wallet URL: {}", walletServiceUrl);
        logger.info("Merchant ID: {}", walletMerchantId);
    }

    /**
     * Fallback/Legacy generic order creation.
     * Prioritizes the specific initiateWalletTransfer flow for Wallet payments.
     */
    public Dtos.OrderResponse createOrder(double amount, String currency) throws RazorpayException {
        // This method seems to be partially repurposed for Wallet in the previous code.
        // Keeping it compatible but suggesting use of ensure specific flow.
        return null; // Simplified for this refactor to focus on requested flows
    }

    // ============================================
    // RAZORPAY VERIFICATION
    // ============================================
    public boolean verifySignature(Dtos.PaymentVerificationRequest request) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            return Utils.verifyPaymentSignature(attributes, keySecret);
        } catch (RazorpayException e) {
            logger.error("Razorpay signature verification failed", e);
            return false;
        }
    }

    // ============================================
    // ZENWALLET INTEGRATION
    // ============================================

    /**
     * 1. Initiate Payment
     * Endpoint: POST /api/external/create-request
     */
    public Dtos.WalletTransferResponse initiateWalletTransfer(Dtos.WalletTransferInitiationRequest request,
            List<Dtos.BookingRequest> bookings) {

        RestTemplate restTemplate = new RestTemplate();
        Dtos.WalletTransferResponse response = new Dtos.WalletTransferResponse();

        try {
            // 1. Store bookings locally and in DB to claim later
            if (bookings != null) {
                pendingBookings.put(request.getReference(), bookings);
                try {
                    String payloadJson = objectMapper.writeValueAsString(bookings);
                    pendingPaymentRepository.save(new PendingPayment(request.getReference(), payloadJson));
                    logger.info("Saved pending booking to DB for ref: {}", request.getReference());
                } catch (JsonProcessingException e) {
                    logger.error("Failed to serialize booking payload", e);
                }
            }

            // 2. Prepare External API Request
            String createUrl = walletServiceUrl + "/api/external/create-request";

            // Cleanup old pending payments (e.g., > 24 hours) as a maintenance step
            try {
                pendingPaymentRepository.deleteByCreatedAtBefore(java.time.LocalDateTime.now().minusDays(1));
            } catch (Exception e) {
                logger.error("Maintenance: Failed to cleanup old pending payments", e);
            }

            JSONObject payload = new JSONObject();
            payload.put("amount", request.getAmount()); // Amount in cents/smallest unit
            payload.put("merchantId", walletMerchantId);
            payload.put("referenceId", request.getReference());

            // Construct Success and Cancel Callback URLs
            String successUrl = frontendUrl + "/payment-success?ref=" + request.getReference();
            String cancelUrl = frontendUrl + "/events/" + request.getReference().split("-")[0]; // Return to event page

            payload.put("callbackUrl", successUrl);
            payload.put("cancelUrl", cancelUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("x-api-key", walletApiKey); // Lowercase as per requirement

            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            logger.info("Initiating Wallet Payment: {} for Reference: {}", createUrl, request.getReference());

            // 3. Execute Request with simple retry logic
            String responseStr = null;
            int maxRetries = 2;
            for (int i = 0; i <= maxRetries; i++) {
                try {
                    responseStr = restTemplate.postForObject(createUrl, entity, String.class);
                    break;
                } catch (Exception ex) {
                    if (i == maxRetries) {
                        logger.error("Failed to connect to Wallet Gateway after retries: {}", ex.getMessage());
                        throw ex;
                    }
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                    }
                }
            }

            // 4. Parse Response
            JSONObject jsonRes = new JSONObject(responseStr);
            if (jsonRes.optBoolean("success")) {
                JSONObject data = jsonRes.getJSONObject("data");

                response.setStatus("REDIRECT");
                String token = response.getTransactionId();
                if (token == null || token.isEmpty()) {
                    token = data.optString("token", "");
                }
                String paymentUrl = walletServiceUrl + \"/scan?token=\" + token;
                logger.info(\"Payment URL generated: {}\", paymentUrl);

                response.setPaymentUrl(paymentUrl);
                response.setTransactionId(data.optString("token", ""));

                logger.info("Wallet Payment Initiated Successfully. Token: {}", response.getTransactionId());
            } else {
                logger.warn("Wallet Gateway returned failure: {}", jsonRes.optString("message"));
                response.setStatus("FAILED");
                response.setReason(jsonRes.optString("message", "Gateway returned failure"));
            }

        } catch (Exception e) {
            logger.error("Error initiating wallet transfer", e);
            response.setStatus("FAILED");
            response.setReason("Internal Server Error: " + e.getMessage());
        }

        return response;
    }

    /**
     * 1b. Process Direct Wallet Transfer (Card/ID)
     */
    public Dtos.WalletTransferResponse processDirectWalletTransfer(Dtos.ProcessWalletPaymentRequest request) {
        Dtos.WalletTransferResponse response = new Dtos.WalletTransferResponse();
        RestTemplate restTemplate = new RestTemplate();

        String referenceId = request.getReference();
        double amount = request.getAmount();

        try {
            // 1. Save bookings as pending
            if (request.getBookings() != null) {
                pendingBookings.put(referenceId, request.getBookings());
                try {
                    String payloadJson = objectMapper.writeValueAsString(request.getBookings());
                    pendingPaymentRepository.save(new PendingPayment(referenceId, payloadJson));
                } catch (Exception e) {
                    logger.error("Failed to persist pending booking", e);
                }
            }

            // 2. Call ZenWallet Direct API
            String transferUrl = walletServiceUrl + "/api/external/transfer";

            JSONObject payload = new JSONObject();
            if (request.getZenWalletUserId() != null) {
                payload.put("fromUserId", request.getZenWalletUserId());
            }
            if (request.getWalletPassword() != null) {
                payload.put("cardNumber", request.getCardNumber());
                payload.put("cardCvv", request.getCardCvv());
                payload.put("cardExpiry", request.getCardExpiry());
                payload.put("password", request.getWalletPassword());
            }

            payload.put("toWalletId", walletMerchantId);
            payload.put("amount", amount);
            payload.put("referenceId", referenceId);
            payload.put("orderId", referenceId);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("x-api-key", walletApiKey);

            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            String responseStr = restTemplate.postForObject(transferUrl, entity, String.class);
            JSONObject jsonRes = new JSONObject(responseStr);

            if (jsonRes.optBoolean("success")) {
                // Payment success! Now finalize booking.
                // We reuse processSuccessfulPayment which verifies and books.
                if (processSuccessfulPayment(referenceId)) {
                    response.setStatus("SUCCESS");
                    response.setTransactionId(jsonRes.optString("transactionId"));
                } else {
                    response.setStatus("FAILED_AT_BOOKING");
                    response.setReason("Payment successful but booking failed. Ref: " + referenceId);
                }
            } else {
                response.setStatus("FAILED");
                response.setReason(jsonRes.optString("message", "Payment Denied"));
            }

        } catch (Exception e) {
            // Handle 402/404 from RestTemplate errors
            if (e instanceof org.springframework.web.client.HttpClientErrorException) {
                org.springframework.web.client.HttpClientErrorException he = (org.springframework.web.client.HttpClientErrorException) e;
                try {
                    JSONObject errJson = new JSONObject(he.getResponseBodyAsString());
                    response.setReason(errJson.optString("message", he.getStatusText()));
                } catch (Exception ignore) {
                    response.setReason(he.getMessage());
                }
            } else {
                response.setReason(e.getMessage());
            }
            response.setStatus("FAILED");
            logger.error("Direct transfer error", e);
        }
        return response;
    }

    /**
     * 2. Verify Transaction
     * Endpoint: GET /api/external/verify-reference
     */
    public boolean finalizeWalletPayment(String referenceId) {
        RestTemplate restTemplate = new RestTemplate();
        String verifyUrl = walletServiceUrl + "/api/external/verify-reference";

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(verifyUrl)
                    .queryParam("merchantId", walletMerchantId)
                    .queryParam("referenceId", referenceId);

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", walletApiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            logger.info("Verifying Wallet Payment: {} (Ref: {})", verifyUrl, referenceId);

            ResponseEntity<String> res = restTemplate.exchange(builder.toUriString(),
                    Objects.requireNonNull(HttpMethod.GET), entity,
                    String.class);

            if (res.getBody() != null) {
                JSONObject jsonRes = new JSONObject(res.getBody());
                // Expecting { "received": true, ... }
                if (jsonRes.optBoolean("received", false)) {
                    logger.info("Payment Verified Successfully for Ref: {}", referenceId);
                    return true;
                }
            }
            logger.warn("Payment Verification Failed for Ref: {} - Body: {}", referenceId, res.getBody());
            return false;

        } catch (Exception e) {
            logger.error("Error verifying wallet payment", e);
            return false;
        }
    }

    // Helper for Controller (View-only)
    public Object verifyWalletPayment(Dtos.WalletVerificationRequest request) {
        // Pass-through for manual checks if needed
        return finalizeWalletPayment(request.getReferenceId());
    }

    public List<Dtos.BookingRequest> getPendingBookings(String referenceId) {
        if (referenceId == null)
            return Collections.emptyList();
        List<Dtos.BookingRequest> inMemory = pendingBookings.get(referenceId);
        if (inMemory != null)
            return inMemory;

        // Fallback to DB
        return pendingPaymentRepository.findById(referenceId).map(p -> {
            try {
                return Arrays.asList(objectMapper.readValue(p.getBookingPayload(), Dtos.BookingRequest[].class));
            } catch (JsonProcessingException e) {
                logger.error("Failed to deserialize booking payload from DB", e);
                return null;
            }
        }).orElse(Collections.emptyList());
    }

    public void removePendingBooking(String referenceId) {
        pendingBookings.remove(referenceId);
        if (referenceId != null) {
            pendingPaymentRepository.deleteById(referenceId);
        }
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.eventbooking.repository.BookingRepository bookingRepository;

    @Transactional
    public boolean processSuccessfulPayment(String referenceId) {
        // Idempotency check: Have we already booked this reference?
        if (bookingRepository.existsByPaymentId(referenceId)) {
            logger.info("Payment already processed for reference: {}", referenceId);
            return true;
        }

        if (finalizeWalletPayment(referenceId)) {
            List<Dtos.BookingRequest> requests = getPendingBookings(referenceId);
            if (requests != null && !requests.isEmpty()) {
                for (Dtos.BookingRequest br : requests) {
                    br.setPaymentId(referenceId); // Link reference for idempotency and tracking
                    bookingService.bookSeats(br);
                }
                removePendingBooking(referenceId);
                return true;
            }
            logger.warn("No pending bookings found for reference: {}", referenceId);
        }
        return false;
    }
}
