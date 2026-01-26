package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.service.PaymentService;
import com.razorpay.RazorpayException;
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
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).build();
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
    private com.eventbooking.service.SocketIOService socketIOService;

    @Autowired
    private com.eventbooking.service.BookingService bookingService;

    @PostMapping("/initiate-wallet-transfer")
    public ResponseEntity<Dtos.WalletTransferResponse> initiateWalletTransfer(
            @RequestBody Dtos.ProcessWalletPaymentRequest request) {
        // 1. Prepare initiation request for Wallet Backend
        Dtos.WalletTransferInitiationRequest walletRequest = new Dtos.WalletTransferInitiationRequest();
        walletRequest.setFromUserId(request.getFromUserId());
        walletRequest.setToWalletId(request.getToWalletId());
        walletRequest.setAmount(request.getAmount());
        walletRequest.setReference(request.getReference());

        // 2. Call Wallet Backend
        Dtos.WalletTransferResponse response = paymentService.initiateWalletTransfer(walletRequest);

        // 3. If Successful, process bookings in Website A DB
        if ("SUCCESS".equals(response.getStatus())) {
            if (request.getBookings() != null) {
                for (Dtos.BookingRequest br : request.getBookings()) {
                    bookingService.bookSeats(br);
                }
            }
        }

        // 4. Push real-time update to Frontend
        socketIOService.sendPaymentUpdate(request.getReference(), response);

        return ResponseEntity.ok(response);
    }
}
