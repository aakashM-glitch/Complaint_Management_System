package com.complaint.controller;

import com.complaint.dto.PaymentRequest;
import com.complaint.dto.PaymentResponse;
import com.complaint.service.PaymentService;
import com.complaint.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/public-test")
    public ResponseEntity<?> publicTest(@RequestBody Map<String, Object> data) {
        System.out.println("=== PUBLIC TEST ENDPOINT HIT ===");
        System.out.println("Data received: " + data);
        return ResponseEntity.ok(Map.of("received", data, "message", "Public test successful - no auth required"));
    }

    @PostMapping("/test")
    public ResponseEntity<?> testPayment(@RequestBody Map<String, Object> data) {
        System.out.println("=== TEST ENDPOINT HIT ===");
        System.out.println("Data received: " + data);
        return ResponseEntity.ok(Map.of("received", data, "message", "Test successful"));
    }

    @PostMapping("/process")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> processPayment(
            @RequestBody PaymentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("=== Payment Request Received ===");
            System.out.println("Request class: " + (request != null ? request.getClass().getName() : "NULL"));
            System.out.println("Request toString: " + request);
            System.out.println("Complaint ID (raw): " + request.getComplaintId());
            System.out.println("Complaint ID type: "
                    + (request.getComplaintId() != null ? request.getComplaintId().getClass().getName() : "NULL"));
            System.out.println("Amount (raw): " + request.getAmount());
            System.out.println("Amount type: "
                    + (request.getAmount() != null ? request.getAmount().getClass().getName() : "NULL"));
            System.out.println("Payment Method (raw): " + request.getPaymentMethod());
            System.out.println("Payment Method type: "
                    + (request.getPaymentMethod() != null ? request.getPaymentMethod().getClass().getName() : "NULL"));

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            PaymentResponse response = paymentService.processPayment(request, userId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Payment processed successfully");
            result.put("payment", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("=== Payment Processing Error ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<?> getUserPayments(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<PaymentResponse> payments = paymentService.getUserPayments(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching payments: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllPayments() {
        try {
            List<PaymentResponse> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching payments: " + e.getMessage());
        }
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<?> getPaymentByTransactionId(@PathVariable String transactionId) {
        try {
            PaymentResponse payment = paymentService.getPaymentByTransactionId(transactionId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Payment not found: " + e.getMessage());
        }
    }

    @GetMapping("/complaint/{complaintId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'ENGINEER')")
    public ResponseEntity<?> getPaymentByComplaintId(@PathVariable Long complaintId) {
        try {
            PaymentResponse payment = paymentService.getPaymentByComplaintId(complaintId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Payment not found: " + e.getMessage());
        }
    }
}
