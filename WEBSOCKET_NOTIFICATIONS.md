# WebSocket Notifications

## Overview

The Complaint Management System now includes real-time WebSocket notifications for complaint updates. Notifications are automatically sent when:
- Complaints are assigned to engineers
- Complaint status changes
- Complaints are resolved
- Any complaint update occurs

## WebSocket Configuration

### Endpoint
- **WebSocket URL**: `ws://localhost:5173/ws`
- **SockJS Fallback**: Enabled for browser compatibility

### Message Destinations

#### Admin Notifications
- **Topic**: `/topic/admin/notifications`
- **Recipients**: All admins
- **Usage**: Subscribe to receive all admin notifications

#### User Notifications
- **Queue**: `/queue/user/{userId}/notifications`
- **Recipients**: Specific user by ID
- **Usage**: Subscribe with user ID to receive personal notifications

#### Engineer Notifications
- **Queue**: `/queue/engineer/{engineerId}/notifications`
- **Recipients**: Specific engineer by ID
- **Usage**: Subscribe with engineer ID to receive assigned complaint notifications

#### Broadcast Notifications
- **Topic**: `/topic/notifications`
- **Recipients**: All connected clients
- **Usage**: Subscribe for system-wide announcements

## Notification Message Format

```json
{
  "type": "COMPLAINT_UPDATE",
  "message": "Complaint 'Network Issue' status changed from PENDING to ASSIGNED",
  "complaintId": 1,
  "complaintTitle": "Network Issue",
  "timestamp": "2024-01-15T10:30:00",
  "recipientRole": "ADMIN",
  "recipientId": 2
}
```

### Notification Types
- `COMPLAINT_UPDATE` - General complaint update
- `COMPLAINT_ASSIGNED` - Complaint assigned to engineer
- `COMPLAINT_RESOLVED` - Complaint marked as resolved
- `BROADCAST` - System-wide announcement

## Frontend Integration Example

### Using SockJS and STOMP (JavaScript)

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Connect to WebSocket
const socket = new SockJS('http://localhost:5173/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

// Connect
stompClient.activate();

// Subscribe to admin notifications
stompClient.onConnect = () => {
  // Admin notifications
  stompClient.subscribe('/topic/admin/notifications', (message) => {
    const notification = JSON.parse(message.body);
    console.log('Admin notification:', notification);
    // Display notification to user
  });

  // User-specific notifications (replace {userId} with actual user ID)
  const userId = getCurrentUserId(); // Your function to get user ID
  stompClient.subscribe(`/queue/user/${userId}/notifications`, (message) => {
    const notification = JSON.parse(message.body);
    console.log('User notification:', notification);
    // Display notification to user
  });

  // Engineer notifications (replace {engineerId} with actual engineer ID)
  const engineerId = getCurrentEngineerId(); // Your function to get engineer ID
  stompClient.subscribe(`/queue/engineer/${engineerId}/notifications`, (message) => {
    const notification = JSON.parse(message.body);
    console.log('Engineer notification:', notification);
    // Display notification to user
  });
};
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useWebSocketNotifications = (userId, userRole) => {
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:5173/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      // Subscribe based on role
      if (userRole === 'ADMIN') {
        client.subscribe('/topic/admin/notifications', (message) => {
          const notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev]);
        });
      } else if (userRole === 'USER' && userId) {
        client.subscribe(`/queue/user/${userId}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev]);
        });
      } else if (userRole === 'ENGINEER' && userId) {
        client.subscribe(`/queue/engineer/${userId}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev]);
        });
      }
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [userId, userRole]);

  return { notifications, stompClient };
};
```

## Automatic Notifications

The system automatically sends notifications for:

1. **Complaint Assignment**
   - Notifies engineer when complaint is assigned
   - Notifies admin about assignment

2. **Status Changes**
   - Notifies admin, user, and engineer (if assigned) when status changes
   - Tracks old and new status

3. **Complaint Resolution**
   - Notifies admin and user when complaint is resolved
   - Includes complaint details

## Security

- WebSocket endpoint (`/ws/**`) is permitted for all (can be secured with JWT if needed)
- Notifications are role-based and user-specific
- Only authorized users receive relevant notifications

## Testing

### Using Browser Console

```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:5173/ws');
const stomp = Stomp.over(socket);

stomp.connect({}, function(frame) {
  console.log('Connected: ' + frame);
  
  // Subscribe to admin notifications
  stomp.subscribe('/topic/admin/notifications', function(notification) {
    console.log('Notification:', JSON.parse(notification.body));
  });
});
```

## Dependencies

### Backend
- `spring-boot-starter-websocket` (already in pom.xml)

### Frontend (if using React)
```bash
npm install sockjs-client @stomp/stompjs
```

## Notes

- WebSocket connection is automatically established when client connects
- Notifications are sent in real-time without polling
- Old notification methods (console.log) are preserved for backward compatibility
- All existing code continues to work as before
