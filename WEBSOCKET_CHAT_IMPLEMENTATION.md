# WebSocket Chat Implementation Guide

## Overview
This document describes the real-time chat implementation using SockJS and STOMP for the Emoji Sphere application.

## Frontend Implementation ✅

### Dependencies Installed
```bash
npm install sockjs-client @stomp/stompjs
```

### Architecture

#### 1. WebSocket Service (`src/services/websocketService.ts`)
Centralized service that handles:
- SockJS/STOMP connection management
- Automatic reconnection with exponential backoff
- Subscription management for conversations
- Message sending and receiving
- Typing indicators
- Read receipts
- Connection status notifications

**Key Features:**
- Singleton pattern for single connection across app
- Event-based callback system for messages, typing, and receipts
- Automatic conversation subscription/unsubscription
- Heartbeat support for connection keepalive
- User authentication via connect headers

#### 2. Chat Component (`src/pages/Chat.tsx`)
Updated to use WebSocket for real-time communication:
- Establishes WebSocket connection on mount
- Subscribes to selected conversation
- Sends messages via WebSocket (falls back to HTTP if disconnected)
- Receives messages in real-time
- Displays connection status indicator
- Sends/receives typing indicators
- Automatic read receipts

**UI Enhancements:**
- Live connection status badge (green = connected, orange = offline)
- Real-time typing indicators
- Instant message delivery
- No polling delays

### WebSocket Flow

```
Frontend                    WebSocket Server
   |                              |
   |--- Connect (SockJS) -------->|
   |<-- Connected ----------------|
   |                              |
   |--- Subscribe /user/{userId}/queue/messages -->|
   |--- Subscribe /topic/conversation/{convId} --->|
   |                              |
   |--- Send Message ------------>|
   |    (to /app/chat.send)       |
   |                              |
   |<-- Receive Message ----------|
   |    (from /user/queue or      |
   |     /topic/conversation)     |
   |                              |
   |--- Send Typing Indicator --->|
   |    (to /app/chat.typing)     |
   |                              |
   |<-- Receive Typing ----------|
   |    (from /user/queue/typing) |
   |                              |
   |--- Send Read Receipt ------->|
   |    (to /app/chat.read)       |
```

## Backend Requirements ❗

### Required WebSocket Configuration

#### 1. WebSocket Endpoint
```java
// Configure STOMP over SockJS
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue", "/user");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:8080", "http://localhost:5173")
                .withSockJS();
    }
}
```

#### 2. Chat Message Controller
```java
@Controller
public class ChatWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ChatService chatService;
    
    /**
     * Handle incoming chat messages
     * Destination: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message, 
                           SimpMessageHeaderAccessor headerAccessor) {
        // Save message to database
        ChatMessage savedMessage = chatService.saveMessage(message);
        
        // Send to recipient's personal queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(message.getReceiverId()),
            "/queue/messages",
            savedMessage
        );
        
        // Also broadcast to conversation topic
        messagingTemplate.convertAndSend(
            "/topic/conversation/" + message.getConversationId(),
            savedMessage
        );
    }
    
    /**
     * Handle typing indicators
     * Destination: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload TypingIndicator typing) {
        // Get the other user in conversation
        Conversation conv = chatService.getConversation(typing.getConversationId());
        int recipientId = conv.getUserOneId() == typing.getUserId() 
            ? conv.getUserTwoId() 
            : conv.getUserOneId();
        
        // Send typing indicator to recipient
        messagingTemplate.convertAndSendToUser(
            String.valueOf(recipientId),
            "/queue/typing",
            typing
        );
    }
    
    /**
     * Handle read receipts
     * Destination: /app/chat.read
     */
    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload MessageReadReceipt receipt) {
        // Mark messages as read in database
        chatService.markMessagesAsRead(receipt.getMessageIds());
        
        // Notify sender about read receipt
        List<ChatMessage> messages = chatService.getMessagesByIds(receipt.getMessageIds());
        for (ChatMessage msg : messages) {
            messagingTemplate.convertAndSendToUser(
                String.valueOf(msg.getSenderId()),
                "/queue/read",
                receipt
            );
        }
    }
}
```

#### 3. Required Data Models

**ChatMessage.java**
```java
public class ChatMessage {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    private String messageText;
    private MessageType messageType; // TEXT, EMOJI, IMAGE, FILE
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // getters, setters
}
```

**TypingIndicator.java**
```java
public class TypingIndicator {
    private Long userId;
    private Long conversationId;
    private Boolean isTyping;
    // getters, setters
}
```

**MessageReadReceipt.java**
```java
public class MessageReadReceipt {
    private Long conversationId;
    private Long userId;
    private List<Long> messageIds;
    // getters, setters
}
```

### Required Dependencies (Spring Boot)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-messaging</artifactId>
</dependency>
```

### CORS Configuration
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## API Endpoints Summary

### WebSocket Destinations

#### Client → Server (Message Mapping)
- `/app/chat.send` - Send chat message
- `/app/chat.typing` - Send typing indicator
- `/app/chat.read` - Send read receipt

#### Server → Client (Subscriptions)
- `/user/{userId}/queue/messages` - Personal message queue
- `/user/{userId}/queue/typing` - Typing indicators for user
- `/user/{userId}/queue/read` - Read receipts for user
- `/topic/conversation/{conversationId}` - Broadcast to all in conversation

### HTTP REST API (Fallback)
These existing endpoints remain for fallback when WebSocket is unavailable:
- `POST /api/chat/send` - Send message via HTTP
- `GET /api/chat/conversations` - Get conversation list
- `GET /api/chat/conversation/{id}/messages` - Get message history
- `POST /api/chat/conversation/{id}/mark-read` - Mark messages as read
- `POST /api/chat/start/{friendId}` - Start new conversation

## Testing the Implementation

### Prerequisites
1. Backend server must be running on `http://localhost:8081`
2. WebSocket endpoint `/ws` must be accessible
3. Spring WebSocket configuration must be complete

### Test Checklist
- [ ] WebSocket connection establishes successfully
- [ ] Connection status indicator shows "Live" when connected
- [ ] Messages send instantly via WebSocket
- [ ] Messages receive in real-time
- [ ] Typing indicators work bidirectionally
- [ ] Read receipts update message status
- [ ] Reconnection works after disconnect
- [ ] Fallback to HTTP works when WebSocket unavailable
- [ ] Multiple conversations can be subscribed simultaneously

### Debug Console Logs
Look for these in browser console:
```
✅ WebSocket Connected
📡 Subscribing to conversation {id}
📤 Sent message: {...}
📨 Received real-time message: {...}
⌨️ Typing indicator: {...}
✓✓ Read receipt: {...}
```

## Connection States

### Connected (✅ Live)
- Green badge in chat header
- Real-time message delivery
- Sub-second latency
- Typing indicators active

### Disconnected (⚠️ Offline)
- Orange badge in chat header
- Falls back to HTTP API
- No real-time updates
- Automatic reconnection attempts

## Reconnection Strategy

The WebSocket service implements exponential backoff:
1. First attempt: 3 seconds delay
2. Second attempt: 6 seconds delay
3. Third attempt: 9 seconds delay
4. Maximum 5 attempts before giving up

Connection will automatically retry on:
- Network disconnection
- Server restart
- STOMP errors
- WebSocket closure

## Performance Considerations

### Message Batching
Currently sends each message individually. Consider implementing:
- Message queuing for offline messages
- Batch delivery for multiple messages
- Message deduplication

### Subscription Management
- Automatically unsubscribes from conversations when not viewing
- Maintains subscription state for reconnection
- Limits concurrent subscriptions

### Memory Management
- Cleanup on component unmount
- Remove callbacks on unsubscribe
- Clear timeout references

## Security Considerations

### Required Backend Security
1. **Authentication**: Verify user identity on connect
2. **Authorization**: Validate conversation access
3. **Message validation**: Sanitize and validate content
4. **Rate limiting**: Prevent message spam
5. **CSRF protection**: Enable for WebSocket handshake

### Example Security Filter
```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    
    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/user/queue/**").authenticated()
            .simpSubscribeDestMatchers("/topic/**").authenticated();
    }
}
```

## Troubleshooting

### Connection Fails
1. Check backend WebSocket configuration
2. Verify CORS settings allow frontend origin
3. Check browser console for errors
4. Test SockJS endpoint directly: `http://localhost:8081/ws/info`

### Messages Not Received
1. Verify subscription destinations match backend
2. Check conversation ID is correct
3. Ensure user is authenticated
4. Review backend message mapping annotations

### Typing Indicators Not Working
1. Check recipient is subscribed to conversation
2. Verify typing timeout is reasonable
3. Test with browser console logs

### Reconnection Not Working
1. Check max reconnection attempts not exceeded
2. Verify network connectivity
3. Test backend is accepting new connections
4. Review reconnection delay settings

## Future Enhancements

### Potential Features
- [ ] Message delivery confirmation
- [ ] Offline message queue
- [ ] File/image upload via WebSocket
- [ ] Voice message support
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] Group chat support
- [ ] End-to-end encryption
- [ ] Message search via WebSocket
- [ ] Presence broadcasting (who's online)

### Performance Optimizations
- [ ] Message compression
- [ ] Binary message format
- [ ] Connection pooling
- [ ] Load balancing with sticky sessions
- [ ] Redis pub/sub for horizontal scaling

## References

- [SockJS Documentation](https://github.com/sockjs/sockjs-client)
- [STOMP Protocol](https://stomp.github.io/)
- [Spring WebSocket Guide](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
