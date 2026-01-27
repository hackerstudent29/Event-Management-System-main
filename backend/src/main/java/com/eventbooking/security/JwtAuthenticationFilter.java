package com.eventbooking.security;

import com.eventbooking.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@org.springframework.stereotype.Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(@org.springframework.lang.NonNull HttpServletRequest request)
            throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Always skip OPTIONS preflight requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        if (path.startsWith("/api/auth/") || path.startsWith("/api/admin-setup/")
                || path.startsWith("/api/admin-check/")) {
            return true;
        }

        // Allow public GET events and occupied seats
        if ((path.startsWith("/api/events") || path.startsWith("/api/bookings/occupied"))
                && "GET".equalsIgnoreCase(method)) {
            return true;
        }

        // Allow websocket handshake
        if (path.startsWith("/ws-payment")) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain chain)
            throws ServletException, IOException {

        final String path = request.getRequestURI();
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7).trim();
            try {
                username = jwtUtil.getUsernameFromToken(jwt);
                System.out.println("[JWT FILTER] Extracted user: " + username + " for " + path);
            } catch (Exception e) {
                System.err.println("[JWT FILTER] Token Parse Error: " + e.getMessage());
            }
        } else {
            System.out.println("[JWT FILTER] No token found for: " + path);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                System.err.println("[JWT FILTER] Context Setup Error: " + e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }
}
