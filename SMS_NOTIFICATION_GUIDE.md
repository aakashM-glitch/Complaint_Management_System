# SMS Notification Implementation Guide

## 📱 How to Check/Test SMS Notifications

This guide shows you how to implement and test SMS notifications for your Complaint Management System using **Twilio**.

---

## 🚀 Option 1: Twilio SMS (Recommended - Free Trial Available)

### Step 1: Sign Up for Twilio

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. You'll get **$15 credit** and a free phone number
4. Complete phone verification

### Step 2: Get Your Credentials

After signing up, get these from your Twilio Console:
- **Account SID** - Your account identifier
- **Auth Token** - Your authentication token
- **Twilio Phone Number** - Your messaging number (e.g., +1234567890)

---

## 💻 Implementation Steps

### Step 1: Add Twilio Dependency to `pom.xml`

Add this dependency to your `backend/pom.xml`:

```xml
<!-- Twilio SMS -->
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.1</version>
</dependency>
```

### Step 2: Update `application.properties`

Add these properties to `backend/src/main/resources/application.properties`:

```properties
# Twilio SMS Configuration
twilio.account.sid=your_account_sid_here
twilio.auth.token=your_auth_token_here
twilio.phone.number=your_twilio_phone_number_here

# Enable/Disable SMS
sms.enabled=true
```

### Step 3: Create SMS Service

Create a new file: `backend/src/main/java/com/complaint/service/SmsService.java`

```java
package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.User;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @PostConstruct
    public void init() {
        if (smsEnabled) {
            Twilio.init(accountSid, authToken);
            System.out.println("✅ Twilio SMS Service initialized successfully");
        } else {
            System.out.println("⚠️ SMS Service is disabled");
        }
    }

    /**
     * Send SMS when complaint is resolved
     */
    public void sendComplaintResolvedSMS(Complaint complaint) {
        if (!smsEnabled) {
            System.out.println("SMS disabled - would have sent to: " + complaint.getUser().getPhone());
            return;
        }

        try {
            User user = complaint.getUser();
            User engineer = complaint.getEngineer();

            String messageBody = String.format(
                "Hi %s! Your complaint #%d '%s' has been RESOLVED by %s. " +
                "Please proceed with payment of $%.2f. Thank you! - CMS Team",
                user.getName(),
                complaint.getId(),
                complaint.getTitle(),
                engineer != null ? engineer.getName() : "Engineer",
                complaint.getPaymentAmount() != null ? complaint.getPaymentAmount() : 50.0
            );

            Message message = Message.creator(
                new PhoneNumber(user.getPhone()),  // To
                new PhoneNumber(twilioPhoneNumber), // From
                messageBody
            ).create();

            System.out.println("✅ SMS sent successfully!");
            System.out.println("   Message SID: " + message.getSid());
            System.out.println("   Status: " + message.getStatus());
            System.out.println("   To: " + user.getPhone());

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
            System.out.println("SMS disabled - would have sent payment confirmation to: " + user.getPhone());
            return;
        }

        try {
            String messageBody = String.format(
                "Hi %s! Payment confirmed for complaint #%d. " +
                "Transaction ID: %s. Amount: $%.2f. Thank you! - CMS Team",
                user.getName(),
                complaint.getId(),
                transactionId,
                amount
            );

            Message message = Message.creator(
                new PhoneNumber(user.getPhone()),
                new PhoneNumber(twilioPhoneNumber),
                messageBody
            ).create();

            System.out.println("✅ Payment confirmation SMS sent!");
            System.out.println("   Message SID: " + message.getSid());

        } catch (Exception e) {
            System.err.println("❌ Failed to send payment SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send generic SMS (for testing)
     */
    public void sendTestSMS(String toPhoneNumber, String message) {
        if (!smsEnabled) {
            System.out.println("SMS disabled - Test message would be: " + message);
            return;
        }

        try {
            Message twilioMessage = Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                message
            ).create();

            System.out.println("✅ Test SMS sent!");
            System.out.println("   Message SID: " + twilioMessage.getSid());
            System.out.println("   Status: " + twilioMessage.getStatus());

        } catch (Exception e) {
            System.err.println("❌ Failed to send test SMS: " + e.getMessage());
            e.printStackTrace();
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
            return message.getStatus().toString();
        } catch (Exception e) {
            System.err.println("Failed to fetch SMS status: " + e.getMessage());
            return "ERROR";
        }
    }
}
```

### Step 4: Update User Entity to Include Phone Number

Edit `backend/src/main/java/com/complaint/entity/User.java` and add:

```java
@Column(name = "phone", length = 20)
private String phone;

// Add getter and setter
public String getPhone() {
    return phone;
}

public void setPhone(String phone) {
    this.phone = phone;
}
```

### Step 5: Update Database Schema

Run this SQL to add phone column:

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;

-- Update existing users with test phone numbers
UPDATE users SET phone = '+1234567890' WHERE phone IS NULL;
```

### Step 6: Integrate SMS in ComplaintService

Update your `ComplaintService.java` to send SMS when complaint is resolved:

```java
@Autowired
private SmsService smsService;

@Autowired
private EmailService emailService;

// In your resolve complaint method, add:
public void resolveComplaint(Long complaintId) {
    // ... existing code ...
    
    // Send email notification
    emailService.sendComplaintResolvedEmail(complaint);
    
    // Send SMS notification
    smsService.sendComplaintResolvedSMS(complaint);
}
```

### Step 7: Update PaymentService for SMS

Update your `PaymentService.java`:

```java
@Autowired
private SmsService smsService;

// After successful payment, add:
smsService.sendPaymentConfirmationSMS(user, complaint, transactionId, amount);
```

---

## 🧪 Testing SMS Notifications

### Method 1: Direct Testing via Controller

Create a test endpoint in `backend/src/main/java/com/complaint/controller/SmsTestController.java`:

```java
package com.complaint.controller;

import com.complaint.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class SmsTestController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/send-sms")
    public ResponseEntity<String> sendTestSms(
            @RequestParam String phoneNumber,
            @RequestParam String message) {
        try {
            smsService.sendTestSMS(phoneNumber, message);
            return ResponseEntity.ok("SMS sent successfully! Check your phone.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send SMS: " + e.getMessage());
        }
    }

    @GetMapping("/sms-status/{messageSid}")
    public ResponseEntity<String> getSmsStatus(@PathVariable String messageSid) {
        String status = smsService.getSmsStatus(messageSid);
        return ResponseEntity.ok("SMS Status: " + status);
    }
}
```

**Test with Postman or curl:**

```bash
# Send test SMS
curl -X POST "http://localhost:8080/api/test/send-sms?phoneNumber=+1234567890&message=Hello from CMS!" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check SMS status
curl -X GET "http://localhost:8080/api/test/sms-status/SM123456789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Method 2: Integration Testing

Test the full flow:

1. **Create a complaint** (as USER)
2. **Assign to engineer** (as ADMIN)
3. **Mark as resolved** (as ENGINEER)
4. **Check your phone** - You should receive an SMS!
5. **Make payment** (as USER)
6. **Check your phone** - Payment confirmation SMS!

### Method 3: Check Twilio Console

1. Login to [Twilio Console](https://console.twilio.com)
2. Go to **Monitor** → **Logs** → **Messaging**
3. You'll see all sent messages with:
   - Status (sent, delivered, failed)
   - Timestamp
   - To/From numbers
   - Message body
   - Error codes (if any)

---

## 📊 Monitoring SMS Delivery

### Check Logs in Your Application

Watch your backend console for messages like:

```
✅ SMS sent successfully!
   Message SID: SM1234567890abcdef
   Status: queued
   To: +1234567890
```

### Check Twilio Dashboard

View detailed analytics:
- **Sent Messages**: Total count
- **Delivered Messages**: Successfully delivered
- **Failed Messages**: With error codes
- **Queued Messages**: Pending delivery

---

## 🌍 Option 2: AWS SNS (Alternative)

If you prefer AWS SNS instead of Twilio:

### Add AWS SDK Dependency:

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>sns</artifactId>
    <version>2.20.0</version>
</dependency>
```

### Configuration:

```properties
aws.sns.region=us-east-1
aws.sns.access.key=your_access_key
aws.sns.secret.key=your_secret_key
```

### Code Example:

```java
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

public void sendSMS(String phoneNumber, String message) {
    SnsClient snsClient = SnsClient.builder()
        .region(Region.US_EAST_1)
        .build();
        
    PublishRequest request = PublishRequest.builder()
        .message(message)
        .phoneNumber(phoneNumber)
        .build();
        
    snsClient.publish(request);
}
```

---

## 🔍 Troubleshooting

### SMS Not Sending?

1. **Check Twilio credentials** in `application.properties`
2. **Verify phone number format**: Must include country code (e.g., +1 for US)
3. **Check Twilio trial limitations**: 
   - Can only send to verified numbers during trial
   - Limited to verified destination numbers
4. **Check console logs** for error messages
5. **Verify account balance** in Twilio console

### Phone Number Format

❌ Wrong: `1234567890`, `(123) 456-7890`  
✅ Correct: `+11234567890`, `+919876543210`

### Twilio Trial Limitations

- Must verify recipient phone numbers first
- Add numbers at: [Twilio Console](https://console.twilio.com) → Verified Caller IDs
- Upgrade to paid account for unrestricted sending

---

## 💰 Cost Estimation

### Twilio Pricing (as of 2024):
- **SMS to US/Canada**: $0.0079 per message
- **SMS to India**: $0.0047 per message
- **Free Trial**: $15 credit (~1,800 messages to US)

### AWS SNS Pricing:
- **First 1,000 SMS**: $0.50
- **Additional SMS**: $0.00645 per message

---

## 🔐 Best Practices

1. **Environment Variables**: Store credentials in environment variables, not code
2. **Rate Limiting**: Implement rate limiting to prevent spam
3. **User Consent**: Only send SMS to users who opted in
4. **Message Length**: Keep messages under 160 characters to avoid splitting
5. **Error Handling**: Always handle exceptions gracefully
6. **Logging**: Log all SMS attempts for auditing
7. **Testing**: Use test numbers during development

---

## 📝 Testing Checklist

- [ ] Twilio account created and verified
- [ ] Dependencies added to `pom.xml`
- [ ] Configuration added to `application.properties`
- [ ] `SmsService` created
- [ ] User entity updated with phone field
- [ ] Database schema updated
- [ ] Integration added to `ComplaintService`
- [ ] Integration added to `PaymentService`
- [ ] Test endpoint created
- [ ] Test SMS sent successfully
- [ ] Full workflow tested (complaint → resolution → payment)
- [ ] SMS delivery confirmed in Twilio console
- [ ] Logs checked for errors

---

## 🎯 Quick Test Command

After implementation, test with:

```bash
# Using curl
curl -X POST "http://localhost:8080/api/test/send-sms" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "phoneNumber=+YOUR_PHONE_NUMBER&message=Test from CMS!"
```

---

## 📚 Additional Resources

- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart/java)
- [Twilio Java SDK](https://www.twilio.com/docs/libraries/java)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox.html)
- [Spring Boot + Twilio Tutorial](https://www.baeldung.com/spring-boot-twilio)

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: Complaint Management System Team
