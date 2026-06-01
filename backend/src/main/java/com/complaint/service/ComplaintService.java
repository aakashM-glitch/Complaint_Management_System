package com.complaint.service;

import com.complaint.dto.*;
import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import com.complaint.entity.Priority;
import com.complaint.entity.Role;
import com.complaint.entity.User;
import com.complaint.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    public ComplaintResponse createComplaint(ComplaintRequest request, Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setUser(user);
        complaint.setStatus(ComplaintStatus.PENDING);

        if (request.getPriority() != null) {
            try {
                complaint.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
            } catch (IllegalArgumentException e) {
                complaint.setPriority(Priority.NORMAL);
            }
        } else {
            complaint.setPriority(Priority.NORMAL);
        }

        // Set deadline explicitly before saving
        LocalDateTime now = LocalDateTime.now();
        complaint.setCreatedDate(now);
        complaint.setUpdatedDate(now);
        if (complaint.getPriority() == Priority.HIGH) {
            complaint.setDeadline(now.plusHours(24));
        } else {
            complaint.setDeadline(now.plusDays(3));
        }

        // Set location fields if provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            complaint.setLatitude(request.getLatitude());
            complaint.setLongitude(request.getLongitude());
        }

        if (request.getAddress() != null) {
            complaint.setAddress(request.getAddress());
        }

        complaint.setLocationEnabled(
                request.getLocationEnabled() != null ? request.getLocationEnabled() : (request.getLatitude() != null));

        // Set phone number for SMS notifications
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            complaint.setPhone(request.getPhone());
            // Also update user's phone if not set
            if (user.getPhone() == null || user.getPhone().isEmpty()) {
                user.setPhone(request.getPhone());
            }
        }

        Complaint savedComplaint = complaintRepository.save(complaint);
        return convertToResponse(savedComplaint);
    }

    public List<ComplaintResponse> getUserComplaints(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return complaintRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getEngineerComplaints(Long engineerId) {
        User engineer = userService.findById(engineerId)
                .orElseThrow(() -> new RuntimeException("Engineer not found"));

        if (engineer.getRole() != Role.ENGINEER) {
            throw new RuntimeException("User is not an engineer");
        }

        return complaintRepository.findByEngineer(engineer)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse assignComplaint(Long complaintId, Long engineerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User engineer = userService.findById(engineerId)
                .orElseThrow(() -> new RuntimeException("Engineer not found"));

        if (engineer.getRole() != Role.ENGINEER) {
            throw new RuntimeException("User is not an engineer");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setEngineer(engineer);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        Complaint updated = complaintRepository.save(complaint);

        // Send WebSocket notifications
        notificationService.notifyComplaintAssigned(updated);
        notificationService.notifyComplaintStatusChange(updated, oldStatus, ComplaintStatus.ASSIGNED);

        // Send Email notification to Engineer
        emailService.sendComplaintAssignedEmail(engineer, updated);

        // Keep old method for backward compatibility
        notifyAdmin(updated);

        return convertToResponse(updated);
    }

    public ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(status);

        // If resolved, mark as requiring payment and send email
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setPaymentRequired(true);
            // Set a default payment amount (this can be customized)
            if (complaint.getPaymentAmount() == null) {
                complaint.setPaymentAmount(50.0); // Default amount
            }
        }

        Complaint updated = complaintRepository.save(complaint);

        // Send WebSocket notifications
        notificationService.notifyComplaintStatusChange(updated, oldStatus, status);

        // If resolved, notify admin and user via email
        if (status == ComplaintStatus.RESOLVED) {
            notificationService.notifyComplaintResolved(updated);
            notifyAdmin(updated);

            // Send email notification to user
            emailService.sendComplaintResolvedEmail(updated);
        }

        return convertToResponse(updated);
    }

    @Transactional
    public ComplaintResponse resolveWithPayment(Long complaintId, ResolveWithPaymentRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setPaymentRequired(true);
        complaint.setPaymentCompleted(true);
        complaint.setPaymentAmount(request.getAmount());
        complaint.setPaymentMethod(request.getPaymentMethod());
        complaint.setTransactionId(request.getTransactionId());

        Complaint saved = complaintRepository.save(complaint);

        // Notify user and admin
        notificationService.notifyComplaintStatusChange(saved, oldStatus, ComplaintStatus.RESOLVED);
        notificationService.notifyComplaintResolved(saved);
        emailService.sendComplaintResolvedEmail(saved);
        notifyAdmin(saved);

        return convertToResponse(saved);
    }

    public ComplaintResponse markAsResolved(Long complaintId, Long engineerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getEngineer() == null || !complaint.getEngineer().getId().equals(engineerId)) {
            throw new RuntimeException("Complaint is not assigned to this engineer");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);

        // Mark as requiring payment
        complaint.setPaymentRequired(true);
        if (complaint.getPaymentAmount() == null) {
            complaint.setPaymentAmount(50.0); // Default amount
        }

        Complaint updated = complaintRepository.save(complaint);

        // Send WebSocket notifications
        notificationService.notifyComplaintResolved(updated);
        notificationService.notifyComplaintStatusChange(updated, oldStatus, ComplaintStatus.RESOLVED);

        // Keep old method for backward compatibility
        notifyAdmin(updated);

        // Send email notification to user
        emailService.sendComplaintResolvedEmail(updated);

        // Send SMS notification to user
        smsService.sendComplaintResolvedSMS(updated);

        return convertToResponse(updated);
    }

    public ComplaintResponse updateEngineerComplaintStatus(Long complaintId, String status, Long engineerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Verify engineer is assigned to this complaint
        if (complaint.getEngineer() == null || !complaint.getEngineer().getId().equals(engineerId)) {
            throw new RuntimeException("Complaint is not assigned to this engineer");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = ComplaintStatus.valueOf(status);
        complaint.setStatus(newStatus);

        // If resolved, mark as requiring payment
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setPaymentRequired(true);
            if (complaint.getPaymentAmount() == null) {
                complaint.setPaymentAmount(50.0); // Default amount
            }
        }

        Complaint updated = complaintRepository.save(complaint);

        // Send WebSocket notifications
        notificationService.notifyComplaintStatusChange(updated, oldStatus, newStatus);

        // If resolved, send additional notifications
        if (newStatus == ComplaintStatus.RESOLVED) {
            notificationService.notifyComplaintResolved(updated);
            emailService.sendComplaintResolvedEmail(updated);
            smsService.sendComplaintResolvedSMS(updated);
        }

        notifyAdmin(updated);

        return convertToResponse(updated);
    }

    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return convertToResponse(complaint);
    }

    public LocationResponse updateComplaintLocation(Long complaintId, LocationUpdateRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (request.getLatitude() != null) {
            complaint.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            complaint.setLongitude(request.getLongitude());
        }
        if (request.getAddress() != null) {
            complaint.setAddress(request.getAddress());
        }
        if (request.getLocationEnabled() != null) {
            complaint.setLocationEnabled(request.getLocationEnabled());
        }

        Complaint updated = complaintRepository.save(complaint);
        return convertToLocationResponse(updated);
    }

    public LocationResponse getComplaintLocation(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return convertToLocationResponse(complaint);
    }

    private ComplaintResponse convertToResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setCreatedDate(complaint.getCreatedDate());
        response.setUpdatedDate(complaint.getUpdatedDate());
        response.setPriority(complaint.getPriority().name());
        response.setDeadline(complaint.getDeadline());
        response.setUserId(complaint.getUser().getId());
        response.setUserName(complaint.getUser().getName());

        if (complaint.getEngineer() != null) {
            response.setEngineerId(complaint.getEngineer().getId());
            response.setEngineerName(complaint.getEngineer().getName());
        }

        // Set location fields
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setAddress(complaint.getAddress());
        response.setLocationEnabled(complaint.getLocationEnabled());

        // Set payment fields
        response.setPaymentRequired(complaint.getPaymentRequired());
        response.setPaymentCompleted(complaint.getPaymentCompleted());
        response.setPaymentAmount(complaint.getPaymentAmount());
        response.setTransactionId(complaint.getTransactionId());
        response.setPaymentMethod(complaint.getPaymentMethod());

        return response;
    }

    private LocationResponse convertToLocationResponse(Complaint complaint) {
        LocationResponse response = new LocationResponse();
        response.setComplaintId(complaint.getId());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setAddress(complaint.getAddress());
        response.setLocationEnabled(complaint.getLocationEnabled());
        return response;
    }

    private void notifyAdmin(Complaint complaint) {
        // TODO: Implement AWS SNS notification to Admin
        // This is a placeholder for future implementation
        System.out.println(
                "Notification: Complaint " + complaint.getId() + " status changed to " + complaint.getStatus());
    }
}
