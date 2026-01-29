package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.eventbooking.service.BookingService bookingService;

    @PostMapping("/create-order")
    public ResponseEntity<Dtos.OrderResponse> createOrder(@RequestBody Dtos.OrderRequest request) {
        try {
            Dtos.OrderResponse response = paymentService.createOrder(request.getAmount(), request.getCurrency());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating order", e);
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

    @PostMapping("/initiate-wallet-transfer")
    public ResponseEntity<Dtos.WalletTransferResponse> initiateWalletTransfer(
            @RequestBody Dtos.ProcessWalletPaymentRequest request) {

        try {
            // Validate seat availability before initiating payment
            if (request.getBookings() != null) {
                for (Dtos.BookingRequest br : request.getBookings()) {
                    bookingService.validateSeatAvailability(br.getEventCategoryId(), br.getSeatIds(),
                            request.getFromUserId());
                }
            }

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
            logger.error("Error initiating wallet transfer", e);
            Dtos.WalletTransferResponse errorResponse = new Dtos.WalletTransferResponse();
            errorResponse.setStatus("FAILED");
            errorResponse.setReason("INTERNAL_ERROR: " + e.toString());
            return ResponseEntity.ok(errorResponse);
        }
    }

    @PostMapping("/finalize-wallet")
    public ResponseEntity<?> finalizeWalletPayment(@RequestBody Map<String, String> payload) {
        String referenceId = payload.get("referenceId");

        if (paymentService.finalizeWalletPayment(referenceId)) {
            // Retrieve pending bookings
            List<Dtos.BookingRequest> requests = paymentService.getPendingBookings(referenceId);
            if (requests != null && !requests.isEmpty()) {
                try {
                    for (Dtos.BookingRequest br : requests) {
                        bookingService.bookSeats(br);
                    }
                    paymentService.removePendingBooking(referenceId);
                    return ResponseEntity.ok(Collections.singletonMap("success", true));
                } catch (Exception e) {
                    logger.error("Error finalizing booking for ref: " + referenceId, e);
                    return ResponseEntity.internalServerError().body("Booking failed after payment");
                }
            } else {
                return ResponseEntity.badRequest().body("No pending booking found for this payment reference.");
            }
        }

        return ResponseEntity.badRequest().body("Payment verification failed.");
    }
}
