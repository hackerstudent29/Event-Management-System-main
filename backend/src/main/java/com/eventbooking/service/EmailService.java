package com.eventbooking.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class EmailService {

    @Value("${spring.mail.password}")
    private String apiKey;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Remove JavaMailSender to force API usage
    // private final JavaMailSender mailSender;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public void sendHtmlOtp(String to, String otp, String purpose) {
        System.out.println("=================================================");
        System.out.println("EMAILING OTP to " + to);
        System.out.println("Purpose: " + purpose);
        System.out.println("OTP: " + otp);
        System.out.println("=================================================");

        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Your OTP";
                String title = "Security Verification";
                String bodyText = "Please use the OTP below to continue:";

                if ("SIGNUP".equalsIgnoreCase(purpose)) {
                    subject = "Verify your email for ZENDRUMBOOKING";
                    title = "Welcome Aboard!";
                    bodyText = "We're excited to have you! To complete your registration and active your account, please verify your email address.";
                } else if ("RESET".equalsIgnoreCase(purpose)) {
                    subject = "Reset Your Password - ZENDRUMBOOKING";
                    title = "Password Reset Request";
                    bodyText = "You requested to reset your password. Use the secure Code below to proceed. If you didn't request this, please ignore this email.";
                }

                String htmlContent = String.format(
                        """
                                <!DOCTYPE html>
                                <html>
                                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                    <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
                                        <tr>
                                            <td align="center">
                                                <table width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                                                    <!-- Header -->
                                                    <tr>
                                                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                                                                <tr>
                                                                    <td style="background-color: #e11d48; color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 10px; border-radius: 6px; letter-spacing: 1px;">ZB</td>
                                                                    <td style="font-size: 18px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px; padding-left: 10px;">ZENDRUMBOOKING</td>
                                                                </tr>
                                                            </table>
                                                            <div style="width: 40px; h-px; background: #e11d48; margin: 0 auto 24px auto; height: 3px; border-radius: 2px;"></div>
                                                            <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">%s</div>
                                                            <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">%s</p>
                                                        </td>
                                                    </tr>

                                                    <!-- OTP Box -->
                                                    <tr>
                                                        <td style="padding: 0 40px 30px 40px;">
                                                            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; border: 1px dashed #cbd5e1;">
                                                                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Verification Code</div>
                                                                <div style="font-size: 32px; font-weight: 800; color: #e11d48; letter-spacing: 8px; margin-bottom: 8px;">%s</div>
                                                                <div style="font-size: 11px; color: #94a3b8;">Valid for 5 minutes</div>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <!-- Sign Section -->
                                                    <tr>
                                                        <td style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                                                            <div style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Regards,</div>
                                                            <table border="0" cellspacing="0" cellpadding="0">
                                                                <tr>
                                                                    <td style="border-left: 3px solid #e11d48; padding-left: 12px;">
                                                                        <div style="font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">Authorized Signatory</div>
                                                                        <div style="font-size: 10px; color: #94a3b8;">ZENDRUMBOOKING Verification System</div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </body>
                                </html>
                                """,
                        title, bodyText, otp);

                sendBrevoEmail(to, subject, htmlContent);

            } catch (Exception e) {
                System.err.println("FAILED TO SEND OTP EMAIL API to " + to + ": " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    public void sendTicketEmail(String to, com.eventbooking.model.Booking booking) {
        CompletableFuture.runAsync(() -> {
            try {
                com.eventbooking.model.EventCategory category = booking.getEventCategory();
                com.eventbooking.model.Event event = category.getEvent();

                // Pricing Math
                int qty = booking.getSeatsBooked();
                double subtotal = category.getPrice().doubleValue() * qty;
                double convenienceFee = qty > 0 ? (30.00 + Math.max(0, qty - 1) * 15.00) : 0.00;
                double igstAmount = convenienceFee * 0.18;
                double grandTotal = subtotal + convenienceFee + igstAmount;
                double totalConvAndTax = convenienceFee + igstAmount;

                java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                        .ofPattern("EEE, dd MMM yyyy");
                java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter
                        .ofPattern("hh:mm a");

                String eventDate = event.getEventDate() != null ? event.getEventDate().format(dateFormatter) : "TBD";
                String eventTime = event.getEventDate() != null ? event.getEventDate().format(timeFormatter) : "TBD";
                String bookingIdShort = booking.getId().toString().substring(0, 8).toUpperCase();

                String subject = "Booking Confirmed: " + event.getName() + " [#" + bookingIdShort + "]";

                // Images
                String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + booking.getId();
                // This Unsplash image is a placeholder, usually ideally we use
                // event.getImageUrl() if exists
                String eventImageUrl = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&h=300";

                // Safe user name
                String userName = "Valued Customer";
                if (booking.getUser() != null && booking.getUser().getName() != null) {
                    userName = booking.getUser().getName();
                }

                String location = event.getLocationName() != null ? event.getLocationName() : "Venue TBD";

                String htmlContent = String.format(
                        """
                                <html>
                                <body style="font-family: sans-serif; color: #333;">
                                    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                                        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                                            <h1 style="margin: 0;">Booking Confirmed!</h1>
                                            <p style="margin: 5px 0 0 0;">Transaction ID: %s</p>
                                        </div>
                                        <div style="padding: 20px;">
                                            <h2>Hi %s,</h2>
                                            <p>Your tickets for <strong>%s</strong> are confirmed.</p>

                                            <img src="%s" width="100%%" style="border-radius: 8px; margin-bottom: 20px;" />

                                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                                <p><strong>Date:</strong> %s</p>
                                                <p><strong>Time:</strong> %s</p>
                                                <p><strong>Venue:</strong> %s</p>
                                                <p><strong>Category:</strong> %s</p>
                                                <p><strong>Seats:</strong> %d</p>
                                            </div>

                                            <h3>Payment Summary</h3>
                                            <table style="width: 100%%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Ticket Price (%d x ₹%.2f)</td>
                                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₹%.2f</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Convenience Fee & Tax</td>
                                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₹%.2f</td>
                                                </tr>
                                                <tr style="font-weight: bold;">
                                                    <td style="padding: 12px 0;">Grand Total</td>
                                                    <td style="padding: 12px 0; text-align: right;">₹%.2f</td>
                                                </tr>
                                            </table>

                                            <div style="text-align: center; margin-top: 30px;">
                                                 <img src="%s" alt="QR Code" style="width: 150px; height: 150px;"/>
                                                 <p style="font-size: 12px; color: #888;">Scan to Enter</p>
                                            </div>
                                        </div>
                                        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                                            <p>Need help? Contact support@zendrum.com</p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                                """,
                        booking.getTransactionId(),
                        userName,
                        event.getName(),
                        eventImageUrl,
                        eventDate,
                        eventTime,
                        location,
                        category.getCategoryName(),
                        qty,
                        qty, category.getPrice().doubleValue(), subtotal,
                        totalConvAndTax,
                        grandTotal,
                        qrUrl);

                sendBrevoEmail(to, subject, htmlContent);

            } catch (Exception e) {
                System.err.println("FAILED TO SEND TICKET EMAIL API: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    public void sendHtmlOtp(String to, String otp) {
        sendHtmlOtp(to, otp, "RESET");
    }

    public void sendCancellationEmail(String to, com.eventbooking.model.Booking booking, String reason) {
        CompletableFuture.runAsync(() -> {
            try {
                com.eventbooking.model.EventCategory category = booking.getEventCategory();
                com.eventbooking.model.Event event = category.getEvent();

                int qty = booking.getSeatsBooked();
                double subtotal = category.getPrice().doubleValue() * qty;
                double refundAmount = subtotal;

                java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                        .ofPattern("EEE, dd MMM yyyy");
                String eventDateStr = event.getEventDate() != null ? event.getEventDate().format(dateFormatter) : "TBD";
                String bookingIdShort = booking.getId().toString().substring(0, 8).toUpperCase();
                String subject = "Event Cancelled: " + event.getName();

                String htmlContent = String.format(
                        "<html><body><h1>Event Cancelled</h1><p>Your booking #%s for %s on %s has been cancelled.</p><p>Reason: %s</p><p>Refund of ₹%.2f initiated.</p></body></html>",
                        bookingIdShort, event.getName(), eventDateStr, reason, refundAmount);

                sendBrevoEmail(to, subject, htmlContent);

            } catch (Exception e) {
                System.err.println("FAILED TO SEND CANCELLATION EMAIL: " + e.getMessage());
            }
        });
    }

    private void sendBrevoEmail(String toEmail, String subject, String htmlContent) throws Exception {
        ObjectNode payload = objectMapper.createObjectNode();
        ObjectNode sender = payload.putObject("sender");
        sender.put("name", "Zendrum Booking");
        sender.put("email", senderEmail); // Must be a verified sender in Brevo

        ArrayNode to = payload.putArray("to");
        ObjectNode recipient = to.addObject();
        recipient.put("email", toEmail);

        payload.put("subject", subject);
        payload.put("htmlContent", htmlContent);

        String jsonBody = objectMapper.writeValueAsString(payload);

        // Debug Log
        System.out.println("Sending Email via Brevo API to: " + toEmail + " with Key suffix: ..."
                + (apiKey != null && apiKey.length() > 5 ? apiKey.substring(apiKey.length() - 5) : "null"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", apiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            System.out.println("EMAIL SENT SUCCESSFULLY (API). Response: " + response.body());
        } else {
            // System.err is better for failure
            System.err.println("FAILED Brevo API Response: " + response.statusCode() + " " + response.body());
            throw new RuntimeException(
                    "Brevo API failed with status " + response.statusCode() + " Body: " + response.body());
        }
    }
}
