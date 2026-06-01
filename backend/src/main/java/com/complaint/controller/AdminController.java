package com.complaint.controller;

import com.complaint.dto.AssignComplaintRequest;
import com.complaint.dto.ComplaintResponse;
import com.complaint.dto.UpdateStatusRequest;
import com.complaint.entity.Role;
import com.complaint.entity.User;
import com.complaint.service.ComplaintService;
import com.complaint.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserService userService;

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        List<ComplaintResponse> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    @PostMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        ComplaintResponse response = complaintService.assignComplaint(id, request.getEngineerId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        ComplaintResponse response = complaintService.updateComplaintStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        ComplaintResponse complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/engineers")
    public ResponseEntity<List<User>> getEngineers() {
        List<User> engineers = userService.findByRole(Role.ENGINEER);
        return ResponseEntity.ok(engineers);
    }
}
