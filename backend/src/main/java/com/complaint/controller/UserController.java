package com.complaint.controller;

import com.complaint.dto.ComplaintRequest;
import com.complaint.dto.ComplaintResponse;
import com.complaint.service.ComplaintService;
import com.complaint.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromToken(String token) {
        String jwt = token.substring(7);
        return jwtUtil.getUserIdFromToken(jwt);
    }

    @PostMapping("/complaints")
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        ComplaintResponse response = complaintService.createComplaint(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getUserComplaints(
            @RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        List<ComplaintResponse> complaints = complaintService.getUserComplaints(userId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        ComplaintResponse complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(complaint);
    }
}
