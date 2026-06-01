package com.complaint.dto;

import java.time.LocalDateTime;

public class NotificationMessage {
    private String type;
    private String message;
    private Long complaintId;
    private String complaintTitle;
    private LocalDateTime timestamp;
    private String recipientRole;
    private Long recipientId;

    public NotificationMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public NotificationMessage(String type, String message, Long complaintId, String complaintTitle) {
        this.type = type;
        this.message = message;
        this.complaintId = complaintId;
        this.complaintTitle = complaintTitle;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getComplaintTitle() {
        return complaintTitle;
    }

    public void setComplaintTitle(String complaintTitle) {
        this.complaintTitle = complaintTitle;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }
}
