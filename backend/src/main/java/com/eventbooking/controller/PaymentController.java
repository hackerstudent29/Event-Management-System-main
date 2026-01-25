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
}
