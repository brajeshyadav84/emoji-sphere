# User Online Status Implementation

This document explains how the online/offline status system works in Emoji Sphere.

## Current Implementation

### Frontend (Implemented ✅)

1. **Presence API** (`src/store/api/presenceApi.ts`)
   - RTK Query endpoints for online status management
   - Polling every 30 seconds to update friends' status
   - Heartbeat system to maintain online status

2. **Custom Hook** (`src/hooks/useUserPresence.ts`)
   - Automatically sets user online when app loads
   - Sends heartbeat every 2 minutes when active
   - Handles page visibility changes (reduces heartbeat when tab hidden)
   - Sets user offline when page closes/app unmounts

3. **UI Components**
   - `OnlineStatusIndicator.tsx` - Reusable component for showing online status
   - Visual indicators (green dot for online, gray for offline)
   - Text status with last seen time
   - Animation for online status

### Backend (Needs Implementation ❌)

The backend API endpoints still need to be implemented:

#### Required Database Changes

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN online_status VARCHAR(20) DEFAULT 'OFFLINE';
```

#### Required API Endpoints

1. **POST** `/api/user/status/online`
   - Set current user as online
   - Update `is_online = true` and `last_seen = now()`

2. **POST** `/api/user/status/offline`  
   - Set current user as offline
   - Update `is_online = false`

3. **POST** `/api/user/heartbeat`
   - Update user's `last_seen` timestamp
   - Keep user marked as online

4. **GET** `/api/user/status/{userId}`
   - Get specific user's online status
   - Return `isOnline`, `lastSeen`, `status`

5. **GET** `/api/friends/status`
   - Get online status of all user's friends
   - Return array of friend status objects

#### Required Backend Services

```java
@Service
public class UserPresenceService {
    
    public void setUserOnline(Long userId) {
        // Update is_online = true, last_seen = now()
    }
    
    public void setUserOffline(Long userId) {
        // Update is_online = false
    }
    
    public void updateHeartbeat(Long userId) {
        // Update last_seen = now()
    }
    
    public UserPresenceStatus getUserStatus(Long userId) {
        // Return user's online status
    }
    
    public List<UserPresenceStatus> getFriendsStatus(Long userId) {
        // Return online status of user's friends
    }
    
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkInactiveUsers() {
        // Set users offline if last_seen > 5 minutes ago
    }
}
```

## How It Works

### User Becomes Online
1. User opens the app
2. `useUserPresence` hook automatically calls `setUserOnline()`
3. Backend sets `is_online = true` and `last_seen = current_timestamp`
4. Other users see this user as online in their friends list

### Maintaining Online Status
1. Every 2 minutes, `sendHeartbeat()` is called
2. Backend updates `last_seen = current_timestamp`
3. User remains marked as online

### User Goes Offline
1. User closes app/tab → `beforeunload` event calls `setUserOffline()`
2. User inactive for 5+ minutes → Backend scheduled task marks offline
3. Backend sets `is_online = false`
4. Other users see this user as offline

### Visibility Changes
- User switches tabs → Reduces heartbeat frequency to 5 minutes
- User returns to tab → Resumes normal 2-minute heartbeat
- Prevents unnecessary API calls when user not actively using app

## UI Indicators

### OnlineStatusIndicator Component

**Props:**
- `isOnline: boolean` - Whether user is online
- `size: 'sm' | 'md' | 'lg'` - Size of indicator dot  
- `showText: boolean` - Whether to show "Online"/"Offline" text
- `lastSeen: string` - Last seen timestamp for offline users
- `className: string` - Additional CSS classes

**Usage:**
```tsx
// Just the dot indicator
<OnlineStatusIndicator isOnline={friend.online} size="md" />

// With text status
<OnlineStatusIndicator 
  isOnline={friend.online} 
  showText={true}
  lastSeen={friend.lastSeen}
/>
```

### Visual States
- **Online**: Green pulsing dot + "Online" text
- **Offline**: Gray dot + "2h ago" (time since last seen)

## Implementation Status

✅ **Completed:**
- Frontend presence API structure
- User presence management hook
- OnlineStatusIndicator component  
- Chat UI integration
- Automatic online/offline handling

❌ **Still Needed:**
- Backend API endpoints
- Database schema updates
- User presence service
- Scheduled task for inactive users
- Testing

## Next Steps

1. **Backend Implementation**
   - Add database columns for online status
   - Create UserPresenceService
   - Implement API endpoints
   - Add scheduled task for cleanup

2. **Testing**
   - Test online/offline transitions
   - Test heartbeat system
   - Test multiple users
   - Test edge cases (network issues, etc.)

3. **Enhancements**
   - Add "Away" status after 10 minutes inactive
   - Add "Busy" status option
   - Add last seen "typing..." indicators
   - Real-time updates via WebSocket

## Configuration

Current timing settings (can be adjusted):
- **Heartbeat interval**: 2 minutes (active tab)
- **Heartbeat interval (hidden)**: 5 minutes  
- **Auto-offline threshold**: 5 minutes of inactivity
- **Status polling**: 30 seconds (to get friends' status)

These can be modified in:
- `useUserPresence.ts` - Frontend timing
- Backend service - Auto-offline threshold
- `presenceApi.ts` - Polling interval