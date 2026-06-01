package com.complaint.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public class LocationUpdateRequest {

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private Boolean locationEnabled = false;

    public LocationUpdateRequest() {
    }

    public LocationUpdateRequest(Double latitude, Double longitude, String address, Boolean locationEnabled) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.locationEnabled = locationEnabled;
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
