package com.eventbooking.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
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
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${wallet.service.url:http://localhost:5000}")
    private String walletServiceUrl;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        this.client = new RazorpayClient(keyId, keySecret);
    }

    public Dtos.OrderResponse createOrder(double amount, String currency) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); // amount in the smallest currency unit (paise)
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(orderRequest);

        Dtos.OrderResponse response = new Dtos.OrderResponse();
        response.setId(order.get("id"));
        response.setCurrency(order.get("currency"));
        response.setAmount(order.get("amount"));
        response.setStatus(order.get("status"));

        return response;
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

    public Object verifyWalletPayment(Dtos.WalletVerificationRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = walletServiceUrl + "/api/external/verify-reference";

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("merchantId", request.getMerchantId())
                .queryParam("referenceId", request.getReferenceId());

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", "your-api-key");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            return restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity, Object.class).getBody();
        } catch (Exception e) {
            return "{\"received\": false, \"message\": \"External Wallet Service Error\"}";
        }
    }

    public Dtos.WalletTransferResponse initiateWalletTransfer(Dtos.WalletTransferInitiationRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = walletServiceUrl + "/api/wallet/transfer";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        // In a real app, add API Key or JWT authentication here
        // headers.set("Authorization", "Bearer " + walletApiKey);

        HttpEntity<Dtos.WalletTransferInitiationRequest> entity = new HttpEntity<>(request, headers);

        try {
            return restTemplate.postForObject(url, entity, Dtos.WalletTransferResponse.class);
        } catch (Exception e) {
            Dtos.WalletTransferResponse failedResponse = new Dtos.WalletTransferResponse();
            failedResponse.setStatus("FAILED");
            failedResponse.setReason("WALLET_SERVICE_UNAVAILABLE");
            return failedResponse;
        }
    }
}
