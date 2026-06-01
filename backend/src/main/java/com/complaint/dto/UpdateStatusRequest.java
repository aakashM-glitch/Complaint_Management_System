package com.complaint.dto;

import com.complaint.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    public UpdateStatusRequest() {
    }

    public UpdateStatusRequest(ComplaintStatus status) {
        this.status = status;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }
}
