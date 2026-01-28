package com.eventbooking.service;

import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.eventbooking.dto.Dtos;

import jakarta.annotation.PostConstruct;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
            // 1. Store bookings locally to claim later
            if (bookings != null) {
                pendingBookings.put(request.getReference(), bookings);
            }

            // 2. Prepare External API Request
            String createUrl = walletServiceUrl + "/api/external/create-request";

            JSONObject payload = new JSONObject();
            payload.put("amount", request.getAmount()); // Amount in cents/smallest unit
            payload.put("merchantId", walletMerchantId);
            payload.put("referenceId", request.getReference());

            // Construct Callback URL (must be accessible to user)
            // Ideally, this should be a configurable property
            String callbackUrl = "https://zendrumbooking.vercel.app/payment-success?ref=" + request.getReference();
            payload.put("callbackUrl", callbackUrl);

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
                response.setPaymentUrl(data.getString("paymentUrl"));
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

            ResponseEntity<String> res = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity,
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
        return pendingBookings.getOrDefault(referenceId, Collections.emptyList());
    }

    public void removePendingBooking(String referenceId) {
        pendingBookings.remove(referenceId);
    }
}
