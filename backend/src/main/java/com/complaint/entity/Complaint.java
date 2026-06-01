package com.complaint.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 1000, message = "Description must be between 1 and 1000 characters")
    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.NORMAL;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private LocalDateTime updatedDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "engineer_id")
    private User engineer;

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Column(length = 500)
    private String address;

    @Column(nullable = false)
    private Boolean locationEnabled = false;

    @Column(nullable = false)
    private Boolean paymentRequired = false;

    @Column(nullable = false)
    private Boolean paymentCompleted = false;

    @Column
    private Double paymentAmount;

    @Column(length = 255)
    private String transactionId;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String problemImagePath;

    @Column(length = 50)
    private String paymentMethod;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        if (status == null) {
            status = ComplaintStatus.PENDING;
        }
        if (priority == null) {
            priority = Priority.NORMAL;
        }
        if (deadline == null) {
            if (priority == Priority.HIGH) {
                deadline = createdDate.plusHours(24);
            } else {
                deadline = createdDate.plusDays(3);
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    public Complaint() {
    }

    public Complaint(String title, String description, User user) {
        this.title = title;
        this.description = description;
        this.user = user;
        this.status = ComplaintStatus.PENDING;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getEngineer() {
        return engineer;
    }

    public void setEngineer(User engineer) {
        this.engineer = engineer;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getLocationEnabled() {
        return locationEnabled;
    }

    public void setLocationEnabled(Boolean locationEnabled) {
        this.locationEnabled = locationEnabled;
    }

    public Boolean getPaymentRequired() {
        return paymentRequired;
    }

    public void setPaymentRequired(Boolean paymentRequired) {
        this.paymentRequired = paymentRequired;
    }

    public Boolean getPaymentCompleted() {
        return paymentCompleted;
    }

    public void setPaymentCompleted(Boolean paymentCompleted) {
        this.paymentCompleted = paymentCompleted;
    }

    public Double getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getProblemImagePath() {
        return problemImagePath;
    }

    public void setProblemImagePath(String problemImagePath) {
        this.problemImagePath = problemImagePath;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Complaint complaint = (Complaint) o;
        return Objects.equals(id, complaint.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Complaint{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", createdDate=" + createdDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}
