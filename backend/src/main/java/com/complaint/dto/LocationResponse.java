package com.complaint.dto;

public class LocationResponse {
    private Long complaintId;
    private Double latitude;
    private Double longitude;
    private String address;
    private Boolean locationEnabled;

    public LocationResponse() {
    }

    public LocationResponse(Long complaintId, Double latitude, Double longitude, String address, Boolean locationEnabled) {
        this.complaintId = complaintId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.locationEnabled = locationEnabled;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
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
}
