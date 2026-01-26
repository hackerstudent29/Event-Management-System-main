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

    // In-memory storage for pending bookings (ReferenceId -> BookingRequest List)
    private final Map<String, List<Dtos.BookingRequest>> pendingBookings = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
    }

    public Dtos.OrderResponse createOrder(double amount, String currency) throws RazorpayException {
        // [New Payment Gateway Integration]
        // Instead of Razorpay, we now call our Wallet Payment Gateway create endpoint

        RestTemplate restTemplate = new RestTemplate();
        String url = walletServiceUrl + "/api/v1/payments/create";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", "Bearer " + walletApiKey);

        // Map Dtos.OrderRequest (which came from frontend) to Gateway Request
        JSONObject gatewayRequest = new JSONObject();
        gatewayRequest.put("amount", amount);
        gatewayRequest.put("currency", currency);
        gatewayRequest.put("reference", "Book-" + System.currentTimeMillis());

        HttpEntity<String> entity = new HttpEntity<>(gatewayRequest.toString(), headers);

        try {
            // Call Gateway
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JSONObject response = new JSONObject(responseStr);

            // Map Gateway Response back to Dtos.OrderResponse (to keep frontend happy)
            Dtos.OrderResponse orderResponse = new Dtos.OrderResponse();
            orderResponse.setId(response.getString("payment_id"));
            orderResponse.setAmount(response.getInt("amount") * 100);
            orderResponse.setCurrency(response.getString("currency"));
            orderResponse.setStatus(response.getString("status"));

            return orderResponse;

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
            payload.put("merchantId", "f294121c-2340-4e91-bf65-b550a6e0d81a"); // From Guide
            payload.put("referenceId", request.getReference());
            // Callback URL points to Frontend Success Page
            // IMPORTANT: This URL must be accessible by the user's browser.
            // Assuming default Vercel deployment structure for now.
            payload.put("callbackUrl",
                    "https://zendrumbooking.vercel.app/payment-success?ref=" + request.getReference());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("x-api-key", walletApiKey);

            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            String responseStr = restTemplate.postForObject(createUrl, entity, String.class);
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

    public boolean finalizeWalletPayment(String referenceId) {
        try {
            // 1. Verify with ZenWallet
            RestTemplate restTemplate = new RestTemplate();
            String verifyUrl = walletServiceUrl + "/api/external/verify-reference"
                    + "?merchantId=f294121c-2340-4e91-bf65-b550a6e0d81a"
                    + "&referenceId=" + referenceId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", walletApiKey);
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
