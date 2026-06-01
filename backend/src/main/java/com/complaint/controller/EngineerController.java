package com.complaint.controller;

import com.complaint.dto.*;
import com.complaint.entity.ComplaintStatus;
import com.complaint.service.ComplaintService;
import com.complaint.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/engineer")
@CrossOrigin(origins = "http://localhost:3000")
public class EngineerController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromToken(String token) {
        String jwt = token.substring(7);
        return jwtUtil.getUserIdFromToken(jwt);
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(
            @RequestHeader("Authorization") String token) {
        Long engineerId = getUserIdFromToken(token);
        List<ComplaintResponse> complaints = complaintService.getEngineerComplaints(engineerId);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/complaints/{id}/resolve-with-payment")
    public ResponseEntity<ComplaintResponse> resolveWithPayment(
            @PathVariable Long id,
            @RequestBody ResolveWithPaymentRequest request,
            @RequestHeader("Authorization") String token) {
        Long engineerId = getUserIdFromToken(token);
        // Basic validation: ensure engineer is assigned to this complaint
        ComplaintResponse current = complaintService.getComplaintById(id);
        if (current.getEngineerId() == null || !current.getEngineerId().equals(engineerId)) {
            return ResponseEntity.status(403).build();
        }
        ComplaintResponse response = complaintService.resolveWithPayment(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody com.complaint.dto.UpdateStatusRequest request,
            @RequestHeader("Authorization") String token) {
        Long engineerId = getUserIdFromToken(token);

        // Engineer can only update to PENDING or RESOLVED
        ComplaintStatus status = request.getStatus();
        if (status != ComplaintStatus.PENDING && status != ComplaintStatus.RESOLVED) {
            return ResponseEntity.badRequest().build();
        }

        ComplaintResponse response = complaintService.updateEngineerComplaintStatus(id, status.name(), engineerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        ComplaintResponse complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(complaint);
    }
}
