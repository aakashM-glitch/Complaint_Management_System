package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@complaintmanagement.com}")
    private String fromEmail;

    public void sendComplaintResolvedEmail(Complaint complaint) {
        try {
            User user = complaint.getUser();
            User engineer = complaint.getEngineer();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Your Complaint #" + complaint.getId() + " Has Been Resolved");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "We are pleased to inform you that your complaint has been successfully resolved.\n\n" +
                            "Complaint Details:\n" +
                            "- Complaint ID: #%d\n" +
                            "- Title: %s\n" +
                            "- Description: %s\n" +
                            "- Resolved By: %s\n" +
                            "- Resolved Date: %s\n\n" +
                            "Please proceed with the payment to complete the process.\n\n" +
                            "Thank you for using our Complaint Management System.\n\n" +
                            "Best Regards,\n" +
                            "Complaint Management Team",
                    user.getName(),
                    complaint.getId(),
                    complaint.getTitle(),
                    complaint.getDescription(),
                    engineer != null ? engineer.getName() : "N/A",
                    complaint.getUpdatedDate());

            message.setText(emailBody);
            mailSender.send(message);

            System.out.println("Email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            // Log error but don't fail the complaint resolution
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendPaymentConfirmationEmail(User user, Complaint complaint, String transactionId, Double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Payment Confirmation for Complaint #" + complaint.getId());

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Thank you for your payment. Your transaction has been successfully completed.\n\n" +
                            "Payment Details:\n" +
                            "- Transaction ID: %s\n" +
                            "- Complaint ID: #%d\n" +
                            "- Amount Paid: $%.2f\n" +
                            "- Payment Date: %s\n\n" +
                            "Your complaint has been fully processed and closed.\n\n" +
                            "Thank you for using our Complaint Management System.\n\n" +
                            "Best Regards,\n" +
                            "Complaint Management Team",
                    user.getName(),
                    transactionId,
                    complaint.getId(),
                    amount,
                    java.time.LocalDateTime.now());

            message.setText(emailBody);
            mailSender.send(message);

            System.out.println("Payment confirmation email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendAdminNotificationEmail(String adminEmail, Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("Complaint Status Update - #" + complaint.getId());

            String emailBody = String.format(
                    "Complaint Status Update:\n\n" +
                            "- Complaint ID: #%d\n" +
                            "- Title: %s\n" +
                            "- Status: %s\n" +
                            "- User: %s\n" +
                            "- Engineer: %s\n\n" +
                            "Please check the system for more details.",
                    complaint.getId(),
                    complaint.getTitle(),
                    complaint.getStatus(),
                    complaint.getUser().getName(),
                    complaint.getEngineer() != null ? complaint.getEngineer().getName() : "Not Assigned");

            message.setText(emailBody);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send admin notification email: " + e.getMessage());
        }
    }

    public void sendComplaintAssignedEmail(User engineer, Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(engineer.getEmail());
            message.setSubject("New Task Assigned: Complaint #" + complaint.getId());

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "A new complaint has been assigned to you. Please review and resolve it as per the deadline.\n\n"
                            +
                            "Complaint Details:\n" +
                            "- ID: #%d\n" +
                            "- Title: %s\n" +
                            "- Priority: %s\n" +
                            "- Customer: %s\n" +
                            "- Address: %s\n\n" +
                            "Best Regards,\n" +
                            "Complaint Management Team",
                    engineer.getName(),
                    complaint.getId(),
                    complaint.getTitle(),
                    complaint.getPriority(),
                    complaint.getUser() != null ? complaint.getUser().getName() : "N/A",
                    complaint.getAddress() != null ? complaint.getAddress() : "No address provided");

            message.setText(emailBody);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send assignment email: " + e.getMessage());
        }
    }

    public void sendEngineerReminderEmail(User engineer, Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(engineer.getEmail());
            message.setSubject("URGENT: Reminder for Complaint #" + complaint.getId());

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "This is a reminder that the following complaint has been assigned to you for more than 2 days and is still not resolved.\n\n"
                            +
                            "Complaint Details:\n" +
                            "- ID: #%d\n" +
                            "- Title: %s\n" +
                            "- Priority: %s\n" +
                            "- Status: %s\n" +
                            "- Reported On: %s\n\n" +
                            "Please complete the work as soon as possible. Once finished, click 'RESOLVED' in your dashboard to generate the bill for the user.\n\n"
                            +
                            "Best Regards,\n" +
                            "Complaint Management Team",
                    engineer.getName(),
                    complaint.getId(),
                    complaint.getTitle(),
                    complaint.getPriority(),
                    complaint.getStatus(),
                    complaint.getCreatedDate());

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("Reminder email sent to engineer: " + engineer.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send engineer reminder: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request");

            String emailBody = String.format(
                    "Hello,\n\n" +
                            "You have requested to reset your password. Please click the link below to set a new password:\n\n"
                            +
                            "%s\n\n" +
                            "If you did not request this, please ignore this email.\n\n" +
                            "Best Regards,\n" +
                            "Complaint Management Team",
                    resetLink);

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("Password reset email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }
}
