package com.complaint.controller;

import com.complaint.entity.Complaint;
import com.complaint.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    @Autowired
    private ComplaintRepository complaintRepository;

    private static final String UPLOAD_DIR = "uploads/complaint-images/";

    @PostMapping("/upload/complaint/{complaintId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> uploadComplaintImage(
            @PathVariable Long complaintId,
            @RequestParam("image") MultipartFile file) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }

            // Check if file is an image
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Find complaint
            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            // Create upload directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = "complaint_" + complaintId + "_" + UUID.randomUUID() + fileExtension;

            // Save file
            Path filepath = Paths.get(UPLOAD_DIR, filename);
            Files.write(filepath, file.getBytes());

            // Update complaint with image path
            complaint.setProblemImagePath(filepath.toString());
            complaintRepository.save(complaint);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
            response.put("filename", filename);
            response.put("path", filepath.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/image/{complaintId}")
    public ResponseEntity<byte[]> getComplaintImage(@PathVariable Long complaintId) {
        try {
            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            if (complaint.getProblemImagePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path imagePath = Paths.get(complaint.getProblemImagePath());
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageBytes = Files.readAllBytes(imagePath);

            return ResponseEntity.ok()
                    .header("Content-Type", Files.probeContentType(imagePath))
                    .body(imageBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
