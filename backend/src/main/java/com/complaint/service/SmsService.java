package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.User;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @PostConstruct
    public void init() {
        if (smsEnabled && accountSid != null && !accountSid.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                System.out.println("✅ Twilio SMS Service initialized successfully");
                System.out.println("   Account SID: " + accountSid.substring(0, 10) + "...");
                System.out.println("   Phone Number: " + twilioPhoneNumber);
            } catch (Exception e) {
                System.err.println("❌ Failed to initialize Twilio: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ SMS Service is DISABLED (set sms.enabled=true to enable)");
        }
    }

    /**
     * Send SMS when complaint is resolved
     */
    public void sendComplaintResolvedSMS(Complaint complaint) {
        if (!smsEnabled) {
            System.out.println("📱 [SMS DISABLED] Would send to: " + getPhoneFromComplaint(complaint));
            System.out.println("   Message: Complaint #" + complaint.getId() + " resolved");
            return;
        }

        try {
            User user = complaint.getUser();
            String userPhone = getPhoneFromComplaint(complaint);

            if (userPhone == null || !isValidPhoneNumber(userPhone)) {
                System.err.println("❌ Invalid phone number for complaint #" + complaint.getId());
                return;
            }

            User engineer = complaint.getEngineer();
            String messageBody = String.format(
                    "Hi %s! Your complaint #%d '%s' has been RESOLVED by %s. " +
                            "Please proceed with payment of $%.2f. Thank you! - CMS Team",
                    user.getName(),
                    complaint.getId(),
                    truncate(complaint.getTitle(), 30),
                    engineer != null ? engineer.getName() : "Engineer",
                    complaint.getPaymentAmount() != null ? complaint.getPaymentAmount() : 50.0);

            Message message = Message.creator(
                    new PhoneNumber(userPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    messageBody).create();

            System.out.println("✅ SMS sent successfully!");
            System.out.println("   Message SID: " + message.getSid());
            System.out.println("   Status: " + message.getStatus());
            System.out.println("   To: " + maskPhone(userPhone));

        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send SMS when payment is confirmed
     */
    public void sendPaymentConfirmationSMS(User user, Complaint complaint, String transactionId, Double amount) {
        if (!smsEnabled) {
            System.out.println("📱 [SMS DISABLED] Payment confirmation would be sent to: " + getPhoneOrDefault(user));
            return;
        }

        try {
            String userPhone = getPhoneOrDefault(user);

            if (userPhone == null || !isValidPhoneNumber(userPhone)) {
                System.err.println("❌ Invalid phone number for user: " + user.getEmail());
                return;
            }

            String messageBody = String.format(
                    "Hi %s! Payment confirmed for complaint #%d. " +
                            "Transaction ID: %s. Amount: $%.2f. Thank you! - CMS Team",
                    user.getName(),
                    complaint.getId(),
                    transactionId,
                    amount);

            Message message = Message.creator(
                    new PhoneNumber(userPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    messageBody).create();

            System.out.println("✅ Payment confirmation SMS sent!");
            System.out.println("   Message SID: " + message.getSid());
            System.out.println("   To: " + maskPhone(userPhone));

        } catch (Exception e) {
            System.err.println("❌ Failed to send payment SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send generic SMS (for testing)
     */
    public String sendTestSMS(String toPhoneNumber, String message) {
        if (!smsEnabled) {
            String demoMessage = String.format(
                    "📱 [SMS DEMO MODE]\n" +
                            "   To: %s\n" +
                            "   Message: %s\n" +
                            "   Status: Would be sent if SMS was enabled\n" +
                            "   Tip: Set sms.enabled=true and add Twilio credentials to send real SMS",
                    toPhoneNumber, message);
            System.out.println(demoMessage);
            return "DEMO_MODE_" + System.currentTimeMillis();
        }

        try {
            if (!isValidPhoneNumber(toPhoneNumber)) {
                throw new IllegalArgumentException("Invalid phone number format. Use E.164 format (e.g., +1234567890)");
            }

            Message twilioMessage = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    message).create();

            System.out.println("✅ Test SMS sent!");
            System.out.println("   Message SID: " + twilioMessage.getSid());
            System.out.println("   Status: " + twilioMessage.getStatus());
            System.out.println("   To: " + maskPhone(toPhoneNumber));

            return twilioMessage.getSid();

        } catch (Exception e) {
            System.err.println("❌ Failed to send test SMS: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send SMS: " + e.getMessage());
        }
    }

    /**
     * Get SMS delivery status
     */
    public String getSmsStatus(String messageSid) {
        if (!smsEnabled) {
            return "SMS Service Disabled";
        }

        try {
            Message message = Message.fetcher(messageSid).fetch();
            System.out.println("📊 SMS Status for " + messageSid + ": " + message.getStatus());
            return message.getStatus().toString();
        } catch (Exception e) {
            System.err.println("Failed to fetch SMS status: " + e.getMessage());
            return "ERROR";
        }
    }

    // Helper methods
    private String getPhoneOrDefault(User user) {
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            return user.getPhone();
        }
        return "+1234567890"; // Default for demo
    }

    private String getPhoneFromComplaint(Complaint complaint) {
        // First try complaint phone
        if (complaint.getPhone() != null && !complaint.getPhone().isEmpty()) {
            return complaint.getPhone();
        }
        // Then try user phone
        if (complaint.getUser() != null && complaint.getUser().getPhone() != null &&
                !complaint.getUser().getPhone().isEmpty()) {
            return complaint.getUser().getPhone();
        }
        return "+1234567890"; // Default for demo
    }

    private boolean isValidPhoneNumber(String phone) {
        // E.164 format: +[country code][number]
        return phone != null && phone.matches("^\\+[1-9]\\d{1,14}$");
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4)
            return phone;
        return phone.substring(0, phone.length() - 4) + "****";
    }

    private String truncate(String text, int maxLength) {
        if (text == null)
            return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }

    public boolean isSmsEnabled() {
        return smsEnabled;
    }
}
