package com.eventbooking.service;

import java.util.Objects;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendHtmlOtp(String to, String otp, String purpose) {
        // Log OTP to console for development/debugging
        System.out.println("=================================================");
        System.out.println("EMAILING OTP to " + to);
        System.out.println("Purpose: " + purpose);
        System.out.println("OTP: " + otp);
        System.out.println("=================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

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

            helper.setFrom(Objects.requireNonNull(senderEmail));
            helper.setTo(Objects.requireNonNull(to));
            helper.setSubject(subject);

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

                                                <!-- Footer -->
                                                <tr>
                                                    <td style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                                                        <div style="font-size: 11px; color: #94a3b8;">
                                                            &copy; 2026 ZENDRUMBOOKING PVT LTD. All rights reserved.
                                                        </div>
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

            helper.setText(Objects.requireNonNull(htmlContent), true);
            mailSender.send(message);

        } catch (Exception e) {
            // Log error but don't stop the flow in DEV, or throw?
            // User needs to know if it failed.
            System.err.println("FAILED TO SEND EMAIL: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void sendTicketEmail(String to, com.eventbooking.model.Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            com.eventbooking.model.EventCategory category = booking.getEventCategory();
            com.eventbooking.model.Event event = category.getEvent();

            // Pricing Math (Standardized Tiered Logic)
            int qty = booking.getSeatsBooked();
            double subtotal = category.getPrice().doubleValue() * qty;
            double convenienceFee = qty > 0 ? (30.00 + Math.max(0, qty - 1) * 15.00) : 0.00;
            double igstAmount = convenienceFee * 0.18; // Flat 18% on total fee
            double grandTotal = subtotal + convenienceFee + igstAmount;
            double totalConvAndTax = convenienceFee + igstAmount;

            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                    .ofPattern("EEE, dd MMM yyyy");
            String eventDateStr = event.getEventDate() != null ? event.getEventDate().format(dateFormatter) : "TBD";
            String bookingIdShort = booking.getId().toString().substring(0, 8).toUpperCase();

            // Generate QR Code URL
            String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + booking.getId();
            // Fallback image
            String eventImageUrl = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&h=300";

            String subject = "Booking Confirmed! " + event.getName() + " [#" + bookingIdShort + "]";

            helper.setFrom(Objects.requireNonNull(senderEmail));
            helper.setTo(Objects.requireNonNull(to));
            helper.setSubject(subject);

            String htmlContent = String.format(
                    """
                            <!DOCTYPE html>
                            <html>
                            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                                                <!-- Header Brand -->
                                                <tr>
                                                    <td align="center" style="padding: 30px 0;">
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td style="background-color: #0f172a; color: #ffffff; font-weight: 900; font-size: 16px; padding: 5px 8px; border-radius: 4px;">ZB</td>
                                                                <td style="padding-left: 10px; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">ZENDRUMBOOKING</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Success Banner -->
                                                <tr>
                                                    <td align="center" style="background-color: #0f172a; padding: 25px 40px;">
                                                        <div style="font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">Your order is confirmed!</div>
                                                        <div style="font-size: 12px; color: #94a3b8;">Booking ID: <span style="color: #ffffff; font-weight: bold;">#%s</span></div>
                                                    </td>
                                                </tr>

                                                <!-- Event Image -->
                                                <tr>
                                                    <td style="padding: 20px;">
                                                        <img src="%s" width="560" style="display: block; border-radius: 12px; height: auto;" alt="Event" />
                                                    </td>
                                                </tr>

                                                <!-- Event Details -->
                                                <tr>
                                                    <td style="padding: 10px 40px 30px 40px;">
                                                        <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">%s</div>
                                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td width="24" valign="top" style="padding-top: 2px;">📍</td>
                                                                <td style="font-size: 14px; color: #475569; padding-left: 8px;">%s, Chennai</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-top: 8px;">🕒</td>
                                                                <td style="font-size: 14px; color: #475569; padding-left: 8px; padding-top: 8px;">%s | 06:00 PM</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Order Summary -->
                                                <tr>
                                                    <td style="padding: 0 40px 30px 40px;">
                                                        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px;">
                                                            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px;">Order Summary</div>
                                                            <table width="100%%" border="0" cellspacing="0" cellpadding="5">
                                                                <tr>
                                                                    <td style="font-size: 13px; color: #475569;">%s (%d Tickets)</td>
                                                                    <td align="right" style="font-size: 13px; font-weight: 600; color: #1e293b;">Rs. %.2f</td>
                                                                </tr>
                                                                <tr>
                                                            <td style="font-size: 13px; color: #64748b;">Conv. Fee & Taxes</td>
                                                            <td align="right" style="font-size: 13px; color: #64748b;">Rs. %.2f</td>
                                                        </tr>
                                                                <tr style="border-top: 1px solid #e2e8f0;">
                                                                    <td style="padding-top: 15px; font-size: 16px; font-weight: 800; color: #0f172a;">Total Amount</td>
                                                                    <td align="right" style="padding-top: 15px; font-size: 16px; font-weight: 900; color: #e11d48;">Rs. %.2f</td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <!-- QR Entry -->
                                                <tr>
                                                    <td align="center" style="padding-bottom: 40px;">
                                                        <div style="padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; display: inline-block; margin-bottom: 12px;">
                                                            <img src="%s" width="140" height="140" alt="QR" />
                                                        </div>
                                                        <div style="font-size: 11px; font-weight: 600; color: #64748b;">SCAN TO ENTER AT VENUE</div>
                                                    </td>
                                                </tr>

                                                <!-- Signature -->
                                                <tr>
                                                    <td style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                                                        <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Authorized by,</div>
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td style="background-color: #0f172a; padding: 10px; border-radius: 4px;">
                                                                    <div style="color: #ffffff; font-weight: 900; font-size: 14px;">ZB</div>
                                                                </td>
                                                                <td style="padding-left: 12px;">
                                                                    <div style="font-size: 11px; font-weight: bold; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">ZENDRUMBOOKING TEAM</div>
                                                                    <div style="font-size: 10px; color: #94a3b8;">Official Ticketing Partner</div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Footer -->
                                                <tr>
                                                    <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                                                        <div style="font-size: 11px; color: #94a3b8;">&copy; 2026 ZENDRUMBOOKING PVT LTD.</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>
                            """,
                    bookingIdShort, eventImageUrl, event.getName(), event.getLocationName(), eventDateStr,
                    category.getCategoryName(), booking.getSeatsBooked(), subtotal, totalConvAndTax, grandTotal, qrUrl);

            helper.setText(Objects.requireNonNull(htmlContent), true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("FAILED TO SEND TICKET EMAIL: " + e.getMessage());
            throw new RuntimeException("Failed to send ticket email: " + e.getMessage(), e);
        }
    }

    // Overload for backward compatibility
    public void sendHtmlOtp(String to, String otp) {
        sendHtmlOtp(to, otp, "RESET");
    }

    public void sendCancellationEmail(String to, com.eventbooking.model.Booking booking, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            com.eventbooking.model.EventCategory category = booking.getEventCategory();
            com.eventbooking.model.Event event = category.getEvent();

            // Pricing Math for Refund (Standardized Tiered Logic)
            int qty = booking.getSeatsBooked();
            double subtotal = category.getPrice().doubleValue() * qty;
            // Note: Per user rule, refund is ONLY the original ticket price (subtotal)
            double refundAmount = subtotal;

            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                    .ofPattern("EEE, dd MMM yyyy");
            String eventDateStr = event.getEventDate() != null ? event.getEventDate().format(dateFormatter) : "TBD";
            String bookingIdShort = booking.getId().toString().substring(0, 8).toUpperCase();

            String subject = "Event Cancelled: " + event.getName();
            String cancellationReason = (reason != null && !reason.trim().isEmpty()) ? reason
                    : "Venue unavailability/Technical issues";

            helper.setFrom(Objects.requireNonNull(senderEmail));
            helper.setTo(Objects.requireNonNull(to));
            helper.setSubject(subject);

            String htmlContent = String.format(
                    """
                            <!DOCTYPE html>
                            <html>
                            <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Segoe UI', Arial, sans-serif;">
                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <table width="550" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                                                <!-- Header -->
                                                <tr>
                                                    <td align="center" style="padding: 40px 40px 10px 40px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                                            <tr>
                                                                <td style="background-color: #b91c1c; color: #ffffff; font-weight: 900; font-size: 16px; padding: 5px 8px; border-radius: 4px;">ZB</td>
                                                                <td style="padding-left: 10px; font-size: 18px; font-weight: 900; color: #334155; letter-spacing: -0.5px;">ZENDRUMBOOKING</td>
                                                            </tr>
                                                        </table>
                                                        <div style="font-size: 26px; font-weight: 800; color: #b91c1c; margin-bottom: 10px;">Event Cancelled</div>
                                                        <div style="height: 4px; width: 50px; background: #ef4444; border-radius: 2px; margin: 0 auto 20px auto;"></div>
                                                    </td>
                                                </tr>

                                                <!-- Main Text -->
                                                <tr>
                                                    <td style="padding: 0 45px 30px 45px; text-align: center;">
                                                        <p style="font-size: 15px; line-height: 1.6; color: #64748b; margin: 0;">
                                                            We regret to inform you that your upcoming event has been cancelled. Below are the details regarding your booking and refund status.
                                                        </p>
                                                    </td>
                                                </tr>

                                                <!-- Details Box -->
                                                <tr>
                                                    <td style="padding: 0 40px 30px 40px;">
                                                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0;">
                                                            <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 15px;">%s</div>
                                                            <table width="100%%" border="0" cellspacing="0" cellpadding="2">
                                                                <tr>
                                                                    <td style="font-size: 13px; color: #64748b; width: 100px;">Date:</td>
                                                                    <td style="font-size: 13px; font-weight: 600; color: #334155;">%s</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="font-size: 13px; color: #64748b;">Booking ID:</td>
                                                                    <td style="font-size: 13px; font-weight: 600; color: #334155;">#%s</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="font-size: 13px; color: #64748b;">Reason:</td>
                                                                    <td style="font-size: 13px; font-weight: 600; color: #b91c1c;">%s</td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <!-- Refund Info -->
                                                <tr>
                                                    <td style="padding: 0 40px 40px 40px;">
                                                        <div style="border-radius: 12px; border: 2px solid #ecfdf5; background: #f0fdf4; padding: 20px;">
                                                            <div style="font-size: 14px; font-weight: 800; color: #065f46; margin-bottom: 8px;">Refund Initiated</div>
                                                            <p style="font-size: 13px; color: #065f46; margin: 0; line-height: 1.5;">
                                                                A refund of the original ticket price <strong>Rs. %.2f</strong> has been processed to your original payment method. (Convenience fees and taxes are non-refundable). Please allow 5-7 business days for it to reflect in your account.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <!-- Signature -->
                                                <tr>
                                                    <td style="padding: 0 40px 40px 40px;">
                                                        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 15px;">Sincerely,</div>
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td style="border-left: 3px solid #b91c1c; padding-left: 12px;">
                                                                    <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px;">Authorized Signatory</div>
                                                                    <div style="font-size: 10px; color: #94a3b8;">ZENDRUMBOOKING Corporate Support</div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Footer -->
                                                <tr>
                                                    <td align="center" style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                                                        <div style="font-size: 11px; color: #94a3b8;">ZENDRUMBOOKING PVT LTD</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>
                            """,
                    event.getName(), eventDateStr, bookingIdShort, cancellationReason, refundAmount);

            helper.setText(Objects.requireNonNull(htmlContent), true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("FAILED TO SEND CANCELLATION EMAIL: " + e.getMessage());
        }
    }
}
