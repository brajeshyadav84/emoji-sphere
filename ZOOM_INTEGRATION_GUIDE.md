# Zoom Meeting Integration - RTK Query Implementation

## Overview
This integration uses **RTK Query** for efficient API state management and allows users to join Zoom meetings directly within your application using the Zoom Meeting SDK. Both hosts and participants can join meetings without leaving your app.

## 🆕 **Updated Implementation with RTK Query**

### ✅ **RTK Query Benefits**
- Automatic caching and background updates
- Loading and error states management
- Optimistic updates and data synchronization
- TypeScript-first API definitions
- Built-in request deduplication

## Features
- ✅ Join Zoom meetings as host or participant
- ✅ Extract meeting info from Zoom URLs automatically  
- ✅ Embedded meeting experience within your app
- ✅ RTK Query for efficient API calls
- ✅ Support for both URL formats:
  - `https://us04web.zoom.us/j/MEETING_ID?pwd=PASSWORD`
  - `https://app.zoom.us/wc/MEETING_ID/start?pwd=PASSWORD`

## Backend Implementation

### New API Endpoints

#### 1. Join Meeting
- **URL**: `POST http://localhost:8081/api/onlinemeeting/join`
- **Purpose**: Generate Zoom SDK signature and join meeting
- **Request Body**:
```json
{
  "meetingUrl": "https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "role": 0,
  "password": "optional"
}
```

#### 2. Get Meeting Info
- **URL**: `GET http://localhost:8081/api/onlinemeeting/meeting-info?meetingUrl=ENCODED_URL`
- **Purpose**: Extract meeting ID and password from URL

## 🔥 **RTK Query Implementation**

### API Slice (`src/store/api/zoomApi.ts`)

```typescript
// New endpoints added:
export const {
  useJoinOnlineMeetingMutation,     // Join meeting with signature
  useGetOnlineMeetingInfoQuery,     // Extract meeting info from URL
  // ... existing hooks
} = zoomApi;
```

### Usage in Components

```typescript
// Import RTK Query hooks
import { 
  useJoinOnlineMeetingMutation, 
  useGetOnlineMeetingInfoQuery 
} from '@/store/api/zoomApi';

// In component:
const [joinOnlineMeeting, { isLoading: isJoining }] = useJoinOnlineMeetingMutation();
const { data: meetingInfo, error: meetingInfoError } = useGetOnlineMeetingInfoQuery(
  meetingUrl, 
  { skip: !meetingUrl.includes('zoom.us') }
);

// Join meeting:
const result = await joinOnlineMeeting({
  meetingUrl,
  userName,
  userEmail,
  role,
  password
}).unwrap();
```

### Benefits Over Direct Fetch
- ✅ **Automatic Loading States**: `isJoining`, `isFetchingInfo`
- ✅ **Error Handling**: Built-in error states
- ✅ **Caching**: Meeting info cached automatically
- ✅ **TypeScript**: Full type safety
- ✅ **DevTools**: Redux DevTools integration

### Configuration Required

Your `application.properties` already includes the Zoom SDK credentials:
```properties
# Zoom SDK Configuration
zoom.sdk.key=Ncy1XPnNSi6OZFgKmgbWog
zoom.sdk.secret=OlaE7QmcKVFbblyrfj67XIr2f4WbCD6y
```

## Frontend Implementation

### New Route Added
- **Path**: `/onlinemeeting`
- **Component**: `OnlineMeeting.tsx`
- **Navigation**: Added to header menu with 📹 icon

### Key Features
1. **Meeting URL Auto-parsing**: Automatically extracts meeting ID and password
2. **Role Selection**: Choose between Host (role: 1) or Participant (role: 0)
3. **Embedded Meeting**: Meeting runs within your app using Zoom SDK
4. **Error Handling**: Comprehensive error messages for troubleshooting

## Testing Instructions

### 1. Start Backend Server
```bash
cd d:\CodeBase\emoji-sphere-backend
mvn spring-boot:run
```
The server will start on `http://localhost:8081`

### 2. Start Frontend Development Server
```bash
cd d:\CodeBase\emoji-sphere
npm run dev
```
The frontend will be available at `http://localhost:5173`

### 3. Test the Integration

#### Option 1: Use Provided Test URLs
The component pre-fills with test URLs:
- `https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987`
- `https://app.zoom.us/wc/9900769545/start?omn=74633256987&fromPWA=1&pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1`

#### Option 2: Create Your Own Meeting
1. Go to [Zoom](https://zoom.us) and schedule a meeting
2. Copy the meeting URL
3. Paste it into the meeting URL field

#### Testing Steps:
1. Navigate to `http://localhost:5173/onlinemeeting`
2. Enter your name (required)
3. Enter email (optional)
4. Select role (Host or Participant)
5. Meeting URL should auto-populate with test URL
6. Click "Join Meeting"

### Expected Behavior
- Meeting info should auto-extract when you enter a valid Zoom URL
- Backend should generate a valid signature
- Zoom SDK should initialize and join the meeting
- Meeting should display within your app (not redirect to Zoom)

## Troubleshooting

### Common Issues

#### 1. CORS Errors
If you see CORS errors, verify:
- Backend is running on port 8081
- Frontend is running on port 5173
- CORS is configured for both ports in `OnlineMeetingController.java`

#### 2. Zoom SDK Errors
- Verify SDK credentials in `application.properties`
- Check that the Zoom meeting is valid and active
- Ensure network connectivity to Zoom servers

#### 3. API Connection Issues
- Check that backend server is running: `curl http://localhost:8081/api/onlinemeeting/meeting-info`
- Verify API endpoints in `src/lib/api.ts`

### Debug Steps
1. Open browser dev tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Verify backend logs for Java exceptions

## File Structure

### Backend Files Created/Modified:
- `OnlineMeetingController.java` - Main API controller
- `application.properties` - Updated server configuration

### Frontend Files Created/Modified:
- `src/pages/OnlineMeeting.tsx` - Main meeting component
- `src/lib/api.ts` - API configuration
- `src/App.tsx` - Added route
- `src/components/Header.tsx` - Added navigation

## Security Notes
- Zoom SDK credentials are stored in application properties
- JWT signatures have 2-hour expiration
- CORS is configured for local development
- For production, update CORS origins and secure credentials

## Next Steps
1. Test with actual Zoom meetings
2. Add user authentication integration
3. Store meeting history
4. Add meeting recording features
5. Implement meeting scheduling within the app

## Support
- Zoom SDK Documentation: https://developers.zoom.us/docs/meeting-sdk/web/
- Zoom Meeting SDK GitHub: https://github.com/zoom/meetingsdk-web