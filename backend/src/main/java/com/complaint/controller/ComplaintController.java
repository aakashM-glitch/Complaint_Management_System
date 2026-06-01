package com.complaint.controller;

import com.complaint.dto.LocationResponse;
import com.complaint.dto.LocationUpdateRequest;
import com.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:3000")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PutMapping("/{id}/location")
    public ResponseEntity<LocationResponse> updateComplaintLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationUpdateRequest request) {
        LocationResponse response = complaintService.updateComplaintLocation(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/location")
    public ResponseEntity<LocationResponse> getComplaintLocation(@PathVariable Long id) {
        LocationResponse response = complaintService.getComplaintLocation(id);
        return ResponseEntity.ok(response);
    }
}
