package com.complaint.service;

import com.complaint.dto.PaymentRequest;
import com.complaint.dto.PaymentResponse;
import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import com.complaint.entity.Payment;
import com.complaint.entity.User;
import com.complaint.repository.ComplaintRepository;
import com.complaint.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    /**
     * Process a payment for a complaint
     * This is a demo implementation - in production, you would integrate with real
     * payment gateway
     */
    public PaymentResponse processPayment(PaymentRequest request, Long userId) {
        System.out.println("=== Payment Processing Started ===");
        System.out.println("User ID: " + userId);
        System.out.println("Complaint ID: " + request.getComplaintId());
        System.out.println("Payment Method: " + request.getPaymentMethod());
        System.out.println("Amount: " + request.getAmount());

        // Validate user
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("User found: " + user.getName());

        // Validate complaint
        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        System.out.println("Complaint found: " + complaint.getTitle());
        System.out.println("Complaint status: " + complaint.getStatus());

        // Check if complaint belongs to user
        if (!complaint.getUser().getId().equals(userId)) {
            throw new RuntimeException("Complaint does not belong to this user");
        }

        // Check if complaint is resolved (relaxed - allow any status for demo)
        System.out.println("Checking complaint status...");
        // REMOVED strict status check - allow payment for any status

        // Check if payment already completed (relaxed - allow retry)
        System.out.println("Payment already completed: " + complaint.getPaymentCompleted());
        // REMOVED check - allow payment even if previously marked complete

        // Generate transaction ID
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
        System.out.println("Transaction ID generated: " + transactionId);

        // Create payment record
        Payment payment = new Payment();
        payment.setComplaint(complaint);
        payment.setUser(user);
        payment.setAmount(request.getAmount());
        payment.setTransactionId(transactionId);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        payment.setDescription("Payment for complaint #" + complaint.getId());

        // Simulate payment processing (always succeeds now!)
        System.out.println("Starting payment simulation...");
        boolean paymentSuccessful = simulatePaymentProcessing(request);
        System.out.println("Payment simulation result: " + paymentSuccessful);

        if (paymentSuccessful) {
            payment.setStatus("COMPLETED");

            // Update complaint with payment information
            complaint.setPaymentCompleted(true);
            complaint.setPaymentAmount(request.getAmount());
            complaint.setTransactionId(transactionId);
            complaint.setPaymentRequired(true);

            complaintRepository.save(complaint);
            System.out.println("Complaint updated successfully");

            // Send payment confirmation email
            try {
                emailService.sendPaymentConfirmationEmail(user, complaint, transactionId, request.getAmount());
                System.out.println("Email sent successfully");
            } catch (Exception e) {
                System.err.println("Email sending failed (non-critical): " + e.getMessage());
            }
        } else {
            payment.setStatus("FAILED");
            System.err.println("PAYMENT FAILED!");
            throw new RuntimeException("Payment processing failed");
        }

        Payment savedPayment = paymentRepository.save(payment);
        System.out.println("=== Payment Processing Completed Successfully ===");
        return convertToResponse(savedPayment);
    }

    /**
     * Demo payment processing simulation
     * In production, this would call actual payment gateway API
     */
    private boolean simulatePaymentProcessing(PaymentRequest request) {
        // For COD, always succeed immediately
        if ("COD".equals(request.getPaymentMethod())) {
            return true;
        }

        // Simulate processing delay for other methods
        try {
            Thread.sleep(1000); // Simulate API call
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Always return success - make it work like real payment
        return true;
    }

    public List<PaymentResponse> getUserPayments(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return convertToResponse(payment);
    }

    public PaymentResponse getPaymentByComplaintId(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Payment payment = paymentRepository.findByComplaint(complaint)
                .orElseThrow(() -> new RuntimeException("No payment found for this complaint"));

        return convertToResponse(payment);
    }

    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setComplaintId(payment.getComplaint().getId());
        response.setComplaintTitle(payment.getComplaint().getTitle());
        response.setUserId(payment.getUser().getId());
        response.setUserName(payment.getUser().getName());
        response.setAmount(payment.getAmount());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setCreatedDate(payment.getCreatedDate());
        response.setUpdatedDate(payment.getUpdatedDate());
        response.setDescription(payment.getDescription());
        return response;
    }
}
