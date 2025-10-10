# 🚀 Zoom Portal Auto-Sync Setup Guide

## Overview
Your application can now automatically fetch meetings from your Zoom portal! No more manual entry - just create meetings in Zoom and they'll appear in your web app automatically.

## 🎯 What's New

### ✅ **Automatic Meeting Sync**
- **Create meetings in Zoom portal** → **Automatically appear in your app**
- **Real-time sync** with your Zoom account
- **All meeting details** fetched automatically (name, time, password, etc.)
- **No manual entry needed**

### 🔧 **New Backend Features**
- `ZoomApiService.java` - Handles Zoom API communication
- `ZoomPortalController.java` - Provides API endpoints for frontend
- JWT authentication for Zoom API calls
- Automatic meeting data parsing and formatting

### 🎨 **Updated Frontend**
- **Admin Portal**: Auto-synced meeting list with refresh button
- **Participant View**: Shows only today's auto-synced meetings
- **Connection Status**: Shows if Zoom API is properly connected
- **Real-time Updates**: Sync button to refresh meetings instantly

## 📋 **Setup Instructions**

### Step 1: Get Zoom API Credentials

1. **Go to [Zoom Marketplace](https://marketplace.zoom.us/)**
2. **Sign in** with your Zoom account
3. **Click "Develop" → "Build App"**
4. **Choose "JWT" app type**
5. **Fill in app details**:
   - App Name: `Emoji Sphere Meeting Manager`
   - Description: `Auto-sync meetings for web app`
   - Developer Name: Your name
6. **Get credentials**:
   - Copy **API Key** 
   - Copy **API Secret**

### Step 2: Configure Backend

Update `d:\CodeBase\emoji-sphere-backend\src\main\resources\application.properties`:

```properties
# Replace with your actual Zoom API credentials
zoom.api.key=YOUR_ACTUAL_API_KEY_HERE
zoom.api.secret=YOUR_ACTUAL_API_SECRET_HERE
zoom.api.base.url=https://api.zoom.us/v2
```

### Step 3: Test the Integration

1. **Start Backend**:
   ```bash
   cd d:\CodeBase\emoji-sphere-backend
   mvn spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   cd d:\CodeBase\emoji-sphere
   npm run dev
   ```

3. **Test Admin Portal**:
   - Go to `http://localhost:5173/zoom-portal`
   - Should show "Connected" status
   - Should display your Zoom meetings automatically

4. **Test Participant View**:
   - Go to `http://localhost:5173/onlinemeeting`
   - Should show today's meetings only

## 🎯 **How It Works**

### For Admins:
1. **Create meeting in Zoom portal** (zoom.us)
2. **Go to Admin Dashboard → Zoom Portal Manager**
3. **Click "Sync Meetings"** (or wait for auto-refresh)
4. **Meeting appears automatically** with all details
5. **Click "Start as Host"** to join with host privileges

### For Participants:
1. **Admin shares participant link** 
2. **Students go to Meeting section**
3. **Only today's meetings are visible**
4. **Click "Join Meeting"** when available

## 🔧 **API Endpoints Created**

### Backend Endpoints:
- `GET /api/zoom-portal/meetings` - Fetch all meetings from Zoom
- `GET /api/zoom-portal/meetings/{id}` - Get specific meeting details
- `GET /api/zoom-portal/sync` - Force sync meetings
- `GET /api/zoom-portal/status` - Check API connection status

### Frontend Hooks:
- `useGetZoomPortalMeetingsQuery()` - Fetch meetings
- `useSyncZoomPortalMeetingsMutation()` - Trigger sync
- `useGetZoomPortalStatusQuery()` - Check connection

## 🚀 **Benefits**

✅ **No Manual Entry** - Meetings sync automatically  
✅ **Real-time Updates** - Always current meeting list  
✅ **Complete Details** - Name, time, password, duration all included  
✅ **Role-based Access** - Admins see all, participants see today's only  
✅ **One-click Join** - Easy access for both hosts and participants  
✅ **Error Handling** - Clear status indicators and error messages  

## 🔍 **Troubleshooting**

### "Disconnected" Status:
- Check API credentials in `application.properties`
- Verify credentials are valid in Zoom Marketplace
- Restart backend server after updating credentials

### No Meetings Showing:
- Check if you have scheduled meetings in Zoom portal
- Click "Sync Meetings" to refresh
- Verify meeting dates (only shows scheduled meetings)

### API Errors:
- Check backend logs for detailed error messages
- Verify Zoom API rate limits (500 requests/day for free)
- Ensure JWT app is activated in Zoom Marketplace

## 📱 **Testing with Your Demo Meeting**

Your existing meeting from the screenshot:
- **Meeting ID**: 990 076 9545  
- **Topic**: demo
- **Time**: Oct 8, 2025 03:00 PM Singapore

This should automatically appear in your admin portal once API is configured!

## 🎉 **Next Steps**

1. **Configure API credentials** as shown above
2. **Test with your existing demo meeting**
3. **Create new meetings in Zoom portal**
4. **Watch them auto-sync to your web app**
5. **Share participant links with students**

Your Zoom integration is now fully automated! 🚀