package com.complaint.dto;

import jakarta.validation.constraints.NotNull;

public class AssignComplaintRequest {

    @NotNull(message = "Engineer ID is required")
    private Long engineerId;

    public AssignComplaintRequest() {
    }

    public AssignComplaintRequest(Long engineerId) {
        this.engineerId = engineerId;
    }

    public Long getEngineerId() {
        return engineerId;
    }

    public void setEngineerId(Long engineerId) {
        this.engineerId = engineerId;
    }
}
