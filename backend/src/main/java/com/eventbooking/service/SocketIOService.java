package com.eventbooking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class SocketIOService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendPaymentUpdate(String orderId, Object message) {
        if (message != null) {
            // Broadcast specifically to the topic for this order
            messagingTemplate.convertAndSend("/topic/payment/" + orderId, message);
            System.out.println("Sent STOMP update for order: " + orderId);
        }
    }
}
