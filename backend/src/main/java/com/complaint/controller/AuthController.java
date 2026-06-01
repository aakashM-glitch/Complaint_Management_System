package com.complaint.controller;

import com.complaint.dto.AuthResponse;
import com.complaint.dto.LoginRequest;
import com.complaint.dto.RegisterRequest;
import com.complaint.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authorization) {
        String token = authorization.substring(7);
        authService.logout(token);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(@RequestHeader("Authorization") String authorization) {
        String token = authorization.substring(7);
        authService.logoutAll(token);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out from all devices successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody com.complaint.dto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists with this email, a reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody com.complaint.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been successfully reset.");
        return ResponseEntity.ok(response);
    }
}
