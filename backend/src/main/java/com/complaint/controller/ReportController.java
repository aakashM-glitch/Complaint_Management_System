package com.complaint.controller;

import com.complaint.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private PdfService pdfService;

    /**
     * Download complaint details as PDF
     * Accessible by ADMIN, ENGINEER, and the USER who created it
     */
    @GetMapping("/complaint/{complaintId}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'USER')")
    public ResponseEntity<byte[]> downloadComplaintPdf(@PathVariable Long complaintId) {
        try {
            byte[] pdfBytes = pdfService.generateComplaintPdf(complaintId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "complaint_" + complaintId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Download monthly report as PDF
     * Accessible by ADMIN only
     */
    @GetMapping("/monthly/{year}/{month}/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadMonthlyReportPdf(
            @PathVariable int year,
            @PathVariable int month) {
        try {
            // Validate month
            if (month < 1 || month > 12) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            byte[] pdfBytes = pdfService.generateMonthlyReportPdf(year, month);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "monthly_report_" + year + "_" + String.format("%02d", month) + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Download current month report as PDF
     * Accessible by ADMIN only
     */
    @GetMapping("/monthly/current/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadCurrentMonthReportPdf() {
        YearMonth currentMonth = YearMonth.now();
        return downloadMonthlyReportPdf(currentMonth.getYear(), currentMonth.getMonthValue());
    }
}
