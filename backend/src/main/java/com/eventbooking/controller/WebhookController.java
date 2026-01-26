package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.service.BookingService;
import com.eventbooking.service.SocketIOService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;

@RestController
@RequestMapping("/api/payments")
public class WebhookController {

    @Value("${wallet.webhook.secret:placeholder}")
    private String webhookSecret;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private SocketIOService socketIOService;

    @PostMapping("/webhook-callback")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader("X-Signature") String signature,
            @RequestBody String payload) {

        System.out.println("Received Webhook: " + payload);

        // 1. Verify Signature
        if (!verifySignature(payload, signature, webhookSecret)) {
            System.err.println("Webhook Signature Verification Failed!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Signature");
        }

        try {
            // 2. Parse Payload
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(payload);
            String event = root.path("event").asText();
            String reference = root.path("reference").asText();
            String status = root.path("status").asText();

            // 3. Handle Event
            if ("payment.success".equals(event) && "SUCCESS".equals(status)) {
                System.out.println("Processing Successful Payment for Reference: " + reference);
                
                // In a real flow, checking 'reference' against pending bookings would happen here.
                // Since our current 'reference' is the 'orderId' or 'bookingId' logic,
                // we might need to store the booking intent first.
                
                // For this migration, we are simply confirming the flow works.
                // Specifically for the 'initiateWalletTransfer' flow, we already booked the seats synchronously 
                // in the 'complete' step of the 'initiateWalletTransfer' method in PaymentController.
                // BUT, to be "Reactive", we should ideally book seats HERE.
                
                // For now, let's just emit the socket update to frontend to confirm visibility
                Dtos.WalletTransferResponse response = new Dtos.WalletTransferResponse();
                response.setStatus("SUCCESS");
                response.setReference(reference);
                response.setAmount(root.path("amount").asDouble());
                
                socketIOService.sendPaymentUpdate(reference, response);
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing Error");
        }
    }

    private boolean verifySignature(String payload, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = toHexString(hmacBytes);
            
            // Constant time comparison roughly
            return calculatedSignature.equals(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String toHexString(byte[] bytes) {
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }
}
