package com.eventbooking.service;

import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
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

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${wallet.service.url:http://localhost:5000}")
    private String walletServiceUrl;

    @Value("${wallet.api.key}")
    private String walletApiKey;

    @Value("${wallet.merchant.id:f294121c-2340-4e91-bf65-b550a6e0d81a}")
    private String walletMerchantId;

    // In-memory storage for pending bookings (ReferenceId -> BookingRequest List)
    private final Map<String, List<Dtos.BookingRequest>> pendingBookings = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
    }

    public Dtos.OrderResponse createOrder(double amount, String currency) throws RazorpayException {
        // [New Payment Gateway Integration]
        // Updated to use the correct ZenWallet endpoints as per the integration guide

        RestTemplate restTemplate = new RestTemplate();
        String url = walletServiceUrl + "/api/external/create-request";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("X-API-Key", walletApiKey);

        // Map Dtos.OrderRequest to Gateway Request
        JSONObject gatewayRequest = new JSONObject();
        gatewayRequest.put("amount", amount);
        gatewayRequest.put("merchantId", walletMerchantId);
        gatewayRequest.put("referenceId", "Book-" + System.currentTimeMillis());
        // For generic orders, we can't easily set a callback here without more context,
        // but let's provide a sensible default if it's called.
        gatewayRequest.put("callbackUrl", "https://zendrumbooking.vercel.app/payment-success");

        HttpEntity<String> entity = new HttpEntity<>(gatewayRequest.toString(), headers);

        try {
            // Call Gateway
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JSONObject jsonRes = new JSONObject(responseStr);

            if (jsonRes.getBoolean("success")) {
                JSONObject data = jsonRes.getJSONObject("data");
                Dtos.OrderResponse orderResponse = new Dtos.OrderResponse();
                orderResponse.setId(data.getString("token")); // Use token as ID
                orderResponse.setAmount(amount);
                orderResponse.setCurrency(currency);
                orderResponse.setStatus("CREATED");
                // We'd ideally want to return the paymentUrl here, but OrderResponse doesn't
                // have it.
                // However, if the old frontend used this, it would expect Razorpay format.
                return orderResponse;
            } else {
                throw new RuntimeException("Gateway creation failed: " + jsonRes.optString("message"));
            }

        } catch (Exception e) {
            System.err.println("Gateway creation failed: " + e.getMessage());
            throw new RuntimeException("Payment Gateway Error: " + e.getMessage());
        }
    }

    public boolean verifySignature(Dtos.PaymentVerificationRequest request) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            return Utils.verifyPaymentSignature(attributes, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }

    @SuppressWarnings("null")
    public Object verifyWalletPayment(Dtos.WalletVerificationRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = walletServiceUrl + "/api/external/verify-reference";

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("merchantId", request.getMerchantId())
                .queryParam("referenceId", request.getReferenceId());

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", walletApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            return restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity, Object.class).getBody();
        } catch (Exception e) {
            return "{\"received\": false, \"message\": \"External Wallet Service Error\"}";
        }
    }

    public Dtos.WalletTransferResponse initiateWalletTransfer(Dtos.WalletTransferInitiationRequest request,
            List<Dtos.BookingRequest> bookings) {
        RestTemplate restTemplate = new RestTemplate();
        Dtos.WalletTransferResponse response = new Dtos.WalletTransferResponse();

        try {
            // Store bookings for later retrieval
            pendingBookings.put(request.getReference(), bookings);

            // Call ZenWallet to create payment request
            String createUrl = walletServiceUrl + "/api/external/create-request";

            JSONObject payload = new JSONObject();
            payload.put("amount", request.getAmount());
            payload.put("merchantId", walletMerchantId);
            payload.put("referenceId", request.getReference());
            // Callback URL points to Frontend Success Page
            // IMPORTANT: This URL must be accessible by the user's browser.
            // Assuming default Vercel deployment structure for now.
            payload.put("callbackUrl",
                    "https://zendrumbooking.vercel.app/payment-success?ref=" + request.getReference());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-API-Key", walletApiKey);

            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            String responseStr = null;
            int maxRetries = 3;
            for (int i = 0; i < maxRetries; i++) {
                try {
                    responseStr = restTemplate.postForObject(createUrl, entity, String.class);
                    break; // Success
                } catch (Exception ex) {
                    if (i == maxRetries - 1)
                        throw ex; // Re-throw on last attempt
                    System.err.println("Wallet Request Failed (Attempt " + (i + 1) + "): " + ex.getMessage());
                    try {
                        Thread.sleep(1000 * (i + 1)); // Backoff: 1s, 2s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }

            JSONObject jsonRes = new JSONObject(responseStr);

            if (jsonRes.getBoolean("success")) {
                JSONObject data = jsonRes.getJSONObject("data");
                response.setStatus("REDIRECT");
                response.setPaymentUrl(data.getString("paymentUrl"));
                response.setTransactionId(data.getString("token"));
            } else {
                response.setStatus("FAILED");
                response.setReason("Gateway returned false detail");
            }

            return response;

        } catch (Exception e) {
            System.err.println("Wallet Initiation Failed: " + e.getMessage());
            e.printStackTrace();
            response.setStatus("FAILED");
            response.setReason("GATEWAY_ERROR: " + e.getMessage());
            return response;
        }
    }

    @SuppressWarnings("null")
    public boolean finalizeWalletPayment(String referenceId) {
        try {
            // 1. Verify with ZenWallet
            RestTemplate restTemplate = new RestTemplate();
            String verifyUrl = walletServiceUrl + "/api/external/verify-reference"
                    + "?merchantId=" + walletMerchantId
                    + "&referenceId=" + referenceId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-API-Key", walletApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(verifyUrl, HttpMethod.GET, entity, String.class);
            JSONObject jsonRes = new JSONObject(res.getBody());

            if (jsonRes.has("received") && jsonRes.getBoolean("received")) {
                return true;
            }
        } catch (Exception e) {
            System.err.println("Verification Failed: " + e.getMessage());
        }
        return false;
    }

    public List<Dtos.BookingRequest> getPendingBookings(String referenceId) {
        return pendingBookings.get(referenceId);
    }

    public void removePendingBooking(String referenceId) {
        pendingBookings.remove(referenceId);
    }
}
