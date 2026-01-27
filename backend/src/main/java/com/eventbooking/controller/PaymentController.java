package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.service.PaymentService;
// import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<Dtos.OrderResponse> createOrder(@RequestBody Dtos.OrderRequest request) {
        try {
            Dtos.OrderResponse response = paymentService.createOrder(request.getAmount(), request.getCurrency());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            return ResponseEntity.status(500).header("X-Error-Message", e.getMessage()).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyPayment(@RequestBody Dtos.PaymentVerificationRequest request) {
        boolean isValid = paymentService.verifySignature(request);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/verify-wallet")
    public ResponseEntity<Object> verifyWallet(@RequestBody Dtos.WalletVerificationRequest request) {
        Object response = paymentService.verifyWalletPayment(request);
        return ResponseEntity.ok(response);
    }

    @Autowired
    private com.eventbooking.service.BookingService bookingService;

    @PostMapping("/initiate-wallet-transfer")
    public ResponseEntity<Dtos.WalletTransferResponse> initiateWalletTransfer(
            @RequestBody Dtos.ProcessWalletPaymentRequest request) {

        try {
            // 1. Initiate Hosted Payment Session
            Dtos.WalletTransferInitiationRequest walletRequest = new Dtos.WalletTransferInitiationRequest();
            walletRequest.setFromUserId(request.getFromUserId());
            walletRequest.setAmount(request.getAmount());
            walletRequest.setReference(request.getReference());

            // Pass bookings to service to store them pending
            Dtos.WalletTransferResponse response = paymentService.initiateWalletTransfer(walletRequest,
                    request.getBookings());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error initiating wallet transfer: " + e.getMessage());
            Dtos.WalletTransferResponse errorResponse = new Dtos.WalletTransferResponse();
            errorResponse.setStatus("FAILED");
            errorResponse.setReason("INTERNAL_ERROR: " + e.toString());
            // Return 200 so frontend can handle it gracefully, or 500?
            // Frontend expects status='REDIRECT' or error.
            // Let's return 200 with FAILED status DTO.
            return ResponseEntity.ok(errorResponse);
        }
    }

    @PostMapping("/finalize-wallet")
    public ResponseEntity<?> finalizeWalletPayment(@RequestBody java.util.Map<String, String> payload) {
        String referenceId = payload.get("referenceId");

        if (paymentService.finalizeWalletPayment(referenceId)) {
            // Retrieve pending bookings
            java.util.List<Dtos.BookingRequest> requests = paymentService.getPendingBookings(referenceId);
            if (requests != null) {
                for (Dtos.BookingRequest br : requests) {
                    bookingService.bookSeats(br);
                }
                paymentService.removePendingBooking(referenceId);
                return ResponseEntity.ok(java.util.Collections.singletonMap("success", true));
            } else {
                return ResponseEntity.badRequest().body("No pending booking found for this payment reference.");
            }
        }

        return ResponseEntity.badRequest().body("Payment verification failed.");
    }
}
