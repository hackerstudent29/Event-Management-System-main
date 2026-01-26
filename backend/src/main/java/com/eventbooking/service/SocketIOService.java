package com.eventbooking.service;

import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SocketIOService {

    @Autowired
    private SocketIOServer server;

    @PostConstruct
    private void startServer() {
        server.addConnectListener(client -> {
            System.out.println("Client connected: " + client.getSessionId());
        });

        server.addDisconnectListener(client -> {
            System.out.println("Client disconnected: " + client.getSessionId());
        });

        // Event for joining a specific order room
        server.addEventListener("join_order", String.class, (client, orderId, ackRequest) -> {
            client.joinRoom(orderId);
            System.out.println("Client " + client.getSessionId() + " joined room: " + orderId);
        });

        server.start();
        System.out.println("Socket.IO Server started on port: " + server.getConfiguration().getPort());
    }

    @PreDestroy
    private void stopServer() {
        server.stop();
    }

    public void sendPaymentUpdate(String orderId, Object message) {
        server.getRoomOperations(orderId).sendEvent("payment_update", message);
    }
}
