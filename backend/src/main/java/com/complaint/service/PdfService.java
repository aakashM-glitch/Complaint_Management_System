package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import com.complaint.repository.ComplaintRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PdfService {

    @Autowired
    private ComplaintRepository complaintRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy");

    /**
     * Generate PDF for a single complaint
     */
    public byte[] generateComplaintPdf(Long complaintId) throws Exception {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Add header
        DeviceRgb primaryColor = new DeviceRgb(41, 128, 185);
        Paragraph header = new Paragraph("COMPLAINT DETAILS REPORT")
                .setFontSize(20)
                .setBold()
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(header);

        // Add complaint details
        addComplaintDetails(document, complaint);

        // Add problem image if available
        if (complaint.getProblemImagePath() != null && !complaint.getProblemImagePath().isEmpty()) {
            addProblemImage(document, complaint.getProblemImagePath());
        }

        // Add footer
        Paragraph footer = new Paragraph("Generated on: " + LocalDateTime.now().format(DATE_FORMATTER))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setFontColor(ColorConstants.GRAY);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    /**
     * Generate monthly report PDF
     */
    public byte[] generateMonthlyReportPdf(int year, int month) throws Exception {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Complaint> complaints = complaintRepository.findByCreatedDateBetween(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Add header
        DeviceRgb primaryColor = new DeviceRgb(41, 128, 185);
        Paragraph header = new Paragraph("MONTHLY COMPLAINT REPORT")
                .setFontSize(20)
                .setBold()
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);

        Paragraph period = new Paragraph(yearMonth.format(MONTH_FORMATTER))
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(period);

        // Add statistics
        addMonthlyStatistics(document, complaints);

        // Add complaints table
        addComplaintsTable(document, complaints);

        // Add footer
        Paragraph footer = new Paragraph("Generated on: " + LocalDateTime.now().format(DATE_FORMATTER))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setFontColor(ColorConstants.GRAY);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addComplaintDetails(Document document, Complaint complaint) {
        DeviceRgb labelColor = new DeviceRgb(52, 73, 94);

        // Create a table for better layout
        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        // Add rows
        addDetailRow(table, "Complaint ID:", String.valueOf(complaint.getId()), labelColor);
        addDetailRow(table, "Title:", complaint.getTitle(), labelColor);
        addDetailRow(table, "Description:", complaint.getDescription(), labelColor);
        addDetailRow(table, "Status:", complaint.getStatus().toString(), labelColor);
        addDetailRow(table, "User Name:", complaint.getUser().getName(), labelColor);
        addDetailRow(table, "User Email:", complaint.getUser().getEmail(), labelColor);

        if (complaint.getPhone() != null) {
            addDetailRow(table, "Phone:", complaint.getPhone(), labelColor);
        }

        if (complaint.getAddress() != null) {
            addDetailRow(table, "Address:", complaint.getAddress(), labelColor);
        }

        if (complaint.getEngineer() != null) {
            addDetailRow(table, "Assigned Engineer:", complaint.getEngineer().getName(), labelColor);
        } else {
            addDetailRow(table, "Assigned Engineer:", "Not Assigned", labelColor);
        }

        addDetailRow(table, "Created Date:", complaint.getCreatedDate().format(DATE_FORMATTER), labelColor);
        addDetailRow(table, "Last Updated:", complaint.getUpdatedDate().format(DATE_FORMATTER), labelColor);

        if (complaint.getPaymentRequired()) {
            addDetailRow(table, "Payment Required:", "Yes", labelColor);
            addDetailRow(table, "Payment Amount:", "₹" + complaint.getPaymentAmount(), labelColor);
            addDetailRow(table, "Payment Status:",
                    complaint.getPaymentCompleted() ? "Completed" : "Pending", labelColor);
            if (complaint.getTransactionId() != null) {
                addDetailRow(table, "Transaction ID:", complaint.getTransactionId(), labelColor);
            }
        }

        document.add(table);
    }

    private void addDetailRow(Table table, String label, String value, DeviceRgb labelColor) {
        Cell labelCell = new Cell().add(new Paragraph(label).setBold().setFontColor(labelColor));
        Cell valueCell = new Cell().add(new Paragraph(value != null ? value : "N/A"));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addProblemImage(Document document, String imagePath) {
        try {
            File imageFile = new File(imagePath);
            if (imageFile.exists()) {
                Paragraph imageHeader = new Paragraph("Problem Image:")
                        .setBold()
                        .setMarginTop(20)
                        .setMarginBottom(10);
                document.add(imageHeader);

                Image image = new Image(ImageDataFactory.create(imagePath));
                // Scale image to fit page width
                image.setWidth(UnitValue.createPercentValue(80));
                image.setAutoScale(true);
                image.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
                document.add(image);
            }
        } catch (Exception e) {
            // If image cannot be loaded, just skip it
            Paragraph note = new Paragraph("Problem image could not be loaded")
                    .setFontColor(ColorConstants.RED)
                    .setMarginTop(20);
            document.add(note);
        }
    }

    private void addMonthlyStatistics(Document document, List<Complaint> complaints) {
        DeviceRgb accentColor = new DeviceRgb(52, 152, 219);

        Paragraph statsHeader = new Paragraph("Summary Statistics")
                .setFontSize(14)
                .setBold()
                .setFontColor(accentColor)
                .setMarginBottom(10);
        document.add(statsHeader);

        Table statsTable = new Table(2);
        statsTable.setWidth(UnitValue.createPercentValue(60));
        statsTable.setMarginBottom(20);

        // Calculate statistics
        long totalComplaints = complaints.size();
        Map<ComplaintStatus, Long> statusCounts = complaints.stream()
                .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));

        addStatsRow(statsTable, "Total Complaints:", String.valueOf(totalComplaints));
        addStatsRow(statsTable, "Pending:", String.valueOf(statusCounts.getOrDefault(ComplaintStatus.PENDING, 0L)));
        addStatsRow(statsTable, "In Progress:",
                String.valueOf(statusCounts.getOrDefault(ComplaintStatus.IN_PROGRESS, 0L)));
        addStatsRow(statsTable, "Resolved:", String.valueOf(statusCounts.getOrDefault(ComplaintStatus.RESOLVED, 0L)));

        long paymentsRequired = complaints.stream().filter(Complaint::getPaymentRequired).count();
        long paymentsCompleted = complaints.stream()
                .filter(c -> c.getPaymentRequired() && c.getPaymentCompleted()).count();

        addStatsRow(statsTable, "Payments Required:", String.valueOf(paymentsRequired));
        addStatsRow(statsTable, "Payments Completed:", String.valueOf(paymentsCompleted));

        document.add(statsTable);
    }

    private void addStatsRow(Table table, String label, String value) {
        DeviceRgb labelColor = new DeviceRgb(52, 73, 94);
        Cell labelCell = new Cell().add(new Paragraph(label).setBold().setFontColor(labelColor));
        Cell valueCell = new Cell().add(new Paragraph(value));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addComplaintsTable(Document document, List<Complaint> complaints) {
        DeviceRgb accentColor = new DeviceRgb(52, 152, 219);

        Paragraph tableHeader = new Paragraph("Complaint Details")
                .setFontSize(14)
                .setBold()
                .setFontColor(accentColor)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(tableHeader);

        if (complaints.isEmpty()) {
            Paragraph noData = new Paragraph("No complaints found for this period.")
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(noData);
            return;
        }

        // Create table
        float[] columnWidths = { 1, 3, 2, 2, 2 };
        Table table = new Table(columnWidths);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        // Add header row
        DeviceRgb headerColor = new DeviceRgb(41, 128, 185);
        addTableHeaderCell(table, "ID", headerColor);
        addTableHeaderCell(table, "Title", headerColor);
        addTableHeaderCell(table, "Status", headerColor);
        addTableHeaderCell(table, "Engineer", headerColor);
        addTableHeaderCell(table, "Created", headerColor);

        // Add data rows
        for (Complaint complaint : complaints) {
            table.addCell(new Cell().add(new Paragraph(String.valueOf(complaint.getId()))));
            table.addCell(new Cell().add(new Paragraph(complaint.getTitle())));
            table.addCell(new Cell().add(new Paragraph(complaint.getStatus().toString())));
            table.addCell(new Cell().add(new Paragraph(
                    complaint.getEngineer() != null ? complaint.getEngineer().getName() : "Not Assigned")));
            table.addCell(new Cell().add(new Paragraph(
                    complaint.getCreatedDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))));
        }

        document.add(table);
    }

    private void addTableHeaderCell(Table table, String text, DeviceRgb color) {
        Cell cell = new Cell().add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE));
        cell.setBackgroundColor(color);
        cell.setTextAlignment(TextAlignment.CENTER);
        table.addHeaderCell(cell);
    }
}
