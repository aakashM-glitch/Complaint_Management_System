package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import com.complaint.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    // Runs every 24 hours (86400000 ms)
    @Scheduled(fixedRate = 86400000)
    public void sendRemindersToEngineers() {
        System.out.println("Running scheduled reminder check...");

        List<ComplaintStatus> activeStatuses = Arrays.asList(
                ComplaintStatus.ASSIGNED,
                ComplaintStatus.IN_PROGRESS);

        // Find complaints that are assigned but not resolved, and are more than 2 days
        // old
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);

        List<Complaint> overdueComplaints = complaintRepository.findAll().stream()
                .filter(c -> activeStatuses.contains(c.getStatus()))
                .filter(c -> c.getEngineer() != null)
                .filter(c -> c.getUpdatedDate().isBefore(twoDaysAgo))
                .toList();

        System.out.println("Found " + overdueComplaints.size() + " overdue complaints for reminders.");

        for (Complaint complaint : overdueComplaints) {
            emailService.sendEngineerReminderEmail(complaint.getEngineer(), complaint);
        }
    }
}
