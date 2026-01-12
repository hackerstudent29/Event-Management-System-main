package com.eventbooking.dto;

import lombok.Data;

public class OtpDtos {
    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    public static class ResetPasswordRequest {
        private String email;
        private String newPassword;
        private String otp; // Optional validation again if needed
    }
}
