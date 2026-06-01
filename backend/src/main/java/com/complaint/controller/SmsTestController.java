package com.complaint.controller;

import com.complaint.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class SmsTestController {

    @Autowired
    private SmsService smsService;

    /**
     * Test endpoint to send SMS
     * Example: POST /api/test/send-sms?phoneNumber=+1234567890&message=Hello
     */
    @PostMapping("/send-sms")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'USER')")
    public ResponseEntity<Map<String, Object>> sendTestSms(
            @RequestParam String phoneNumber,
            @RequestParam String message) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("📱 Sending test SMS...");
            System.out.println("   To: " + phoneNumber);
            System.out.println("   Message: " + message);

            String messageSid = smsService.sendTestSMS(phoneNumber, message);

            response.put("success", true);
            response.put("messageSid", messageSid);
            response.put("phoneNumber", phoneNumber);
            response.put("message", "SMS sent successfully! Check your phone and backend console logs.");
            response.put("smsEnabled", smsService.isSmsEnabled());

            if (!smsService.isSmsEnabled()) {
                response.put("note",
                        "SMS is in DEMO mode. Set sms.enabled=true in application.properties to send real SMS.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("phoneNumber", phoneNumber);
            response.put("smsEnabled", smsService.isSmsEnabled());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get SMS delivery status
     * Example: GET /api/test/sms-status/SM123456789
     */
    @GetMapping("/sms-status/{messageSid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'USER')")
    public ResponseEntity<Map<String, Object>> getSmsStatus(@PathVariable String messageSid) {
        Map<String, Object> response = new HashMap<>();

        try {
            String status = smsService.getSmsStatus(messageSid);

            response.put("success", true);
            response.put("messageSid", messageSid);
            response.put("status", status);
            response.put("smsEnabled", smsService.isSmsEnabled());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check SMS service configuration
     * Example: GET /api/test/sms-config
     */
    @GetMapping("/sms-config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSmsConfig() {
        Map<String, Object> config = new HashMap<>();

        config.put("smsEnabled", smsService.isSmsEnabled());
        config.put("service", "Twilio");

        if (smsService.isSmsEnabled()) {
            config.put("status", "✅ SMS Service is ACTIVE");
            config.put("message", "Real SMS messages will be sent via Twilio");
        } else {
            config.put("status", "⚠️ SMS Service is in DEMO MODE");
            config.put("message", "SMS messages are simulated. Enable in application.properties to send real SMS.");
            config.put("howToEnable", "Set sms.enabled=true and add Twilio credentials in application.properties");
        }

        return ResponseEntity.ok(config);
    }

    /**
     * Send test SMS to your own number (quick test)
     * Example: POST /api/test/quick-sms-test?myPhone=+1234567890
     */
    @PostMapping("/quick-sms-test")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'USER')")
    public ResponseEntity<Map<String, Object>> quickSmsTest(@RequestParam String myPhone) {
        Map<String, Object> response = new HashMap<>();

        try {
            String testMessage = "🎉 CMS Test SMS! If you receive this, SMS notifications are working perfectly!";

            System.out.println("🚀 Quick SMS Test initiated...");
            String messageSid = smsService.sendTestSMS(myPhone, testMessage);

            response.put("success", true);
            response.put("messageSid", messageSid);
            response.put("phoneNumber", myPhone);
            response.put("message", "Test SMS sent! Check your phone.");
            response.put("smsEnabled", smsService.isSmsEnabled());

            if (!smsService.isSmsEnabled()) {
                response.put("mode", "DEMO");
                response.put("note",
                        "Check backend console to see the demo message. Enable real SMS by configuring Twilio.");
            } else {
                response.put("mode", "LIVE");
                response.put("note", "Real SMS sent via Twilio! Check your phone in a few seconds.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
