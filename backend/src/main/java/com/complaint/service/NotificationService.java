package com.complaint.service;

import com.complaint.dto.NotificationMessage;
import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyAdmin(Complaint complaint, String message) {
        NotificationMessage notification = new NotificationMessage(
            "COMPLAINT_UPDATE",
            message,
            complaint.getId(),
            complaint.getTitle()
        );
        notification.setRecipientRole("ADMIN");
        
        // Send to all admins
        messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
    }

    public void notifyUser(Complaint complaint, String message) {
        NotificationMessage notification = new NotificationMessage(
            "COMPLAINT_UPDATE",
            message,
            complaint.getId(),
            complaint.getTitle()
        );
        notification.setRecipientId(complaint.getUser().getId());
        notification.setRecipientRole("USER");
        
        // Send to specific user
        messagingTemplate.convertAndSend("/queue/user/" + complaint.getUser().getId() + "/notifications", notification);
    }

    public void notifyEngineer(Complaint complaint, String message) {
        if (complaint.getEngineer() != null) {
            NotificationMessage notification = new NotificationMessage(
                "COMPLAINT_ASSIGNED",
                message,
                complaint.getId(),
                complaint.getTitle()
            );
            notification.setRecipientId(complaint.getEngineer().getId());
            notification.setRecipientRole("ENGINEER");
            
            // Send to specific engineer
            messagingTemplate.convertAndSend("/queue/engineer/" + complaint.getEngineer().getId() + "/notifications", notification);
        }
    }

    public void notifyComplaintStatusChange(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus) {
        String message = String.format("Complaint '%s' status changed from %s to %s", 
            complaint.getTitle(), oldStatus, newStatus);
        
        // Notify admin
        notifyAdmin(complaint, message);
        
        // Notify user
        notifyUser(complaint, message);
        
        // Notify engineer if assigned
        if (complaint.getEngineer() != null) {
            notifyEngineer(complaint, message);
        }
    }

    public void notifyComplaintAssigned(Complaint complaint) {
        String message = String.format("Complaint '%s' has been assigned to you", complaint.getTitle());
        notifyEngineer(complaint, message);
        
        // Also notify admin
        String adminMessage = String.format("Complaint '%s' has been assigned to engineer", complaint.getTitle());
        notifyAdmin(complaint, adminMessage);
    }

    public void notifyComplaintResolved(Complaint complaint) {
        String message = String.format("Complaint '%s' has been resolved", complaint.getTitle());
        
        // Notify admin
        notifyAdmin(complaint, message);
        
        // Notify user
        notifyUser(complaint, message);
    }

    public void sendBroadcastNotification(String message) {
        NotificationMessage notification = new NotificationMessage(
            "BROADCAST",
            message,
            null,
            null
        );
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
}
