# RTK Query Integration with Zoom API

This document describes the complete implementation of Redux Toolkit Query (RTK Query) for state management and API integration in the Emoji Sphere application, following the official Zoom Meeting SDK React sample patterns.

## 🚀 Features Implemented

### ✅ Redux Toolkit Query Setup
- Complete store configuration with RTK Query
- Type-safe API slice definitions
- Automated caching and state management
- Development tools integration

### ✅ Zoom API Integration
- `/api/zoom-signature` endpoint integration
- Meeting signature generation for Zoom SDK
- Real-time API state management
- Error handling and loading states

### ✅ Zoom Meeting SDK Implementation
- **Critical SDK Initialization**: `ZoomMtg.preLoadWasm()` and `ZoomMtg.prepareWebSDK()`
- **Component View**: Embedded meeting experience (`ZoomMtgEmbedded`)
- **Client View**: Full-screen meeting experience (`ZoomMtg`)
- **Proper CSS Setup**: Required `#zmmtg-root` element and styles
- **Error Handling**: Comprehensive error states and user feedback

### ✅ Advanced RTK Query Features
- **Caching**: Automatic response caching with configurable duration
- **Polling**: Interval-based data refetching
- **Refetching**: Manual and automatic refetch capabilities
- **Background Updates**: Refetch on focus, reconnect, and mount
- **Type Safety**: Full TypeScript support with auto-generated hooks

## 📁 Project Structure

```
src/
├── store/
│   ├── index.ts                    # Redux store configuration
│   ├── hooks.ts                    # Typed Redux hooks
│   └── api/
│       ├── apiSlice.ts             # Base API slice
│       └── zoomApi.ts              # Zoom API specific slice
├── components/
│   ├── ZoomMeeting.tsx             # Component View (Embedded)
│   ├── ZoomMeetingClient.tsx       # Client View (Full Screen)
│   ├── ZoomMeetingJoin.tsx         # Meeting join interface
│   └── NavigationDemo.tsx          # Navigation and demo component
└── pages/
    └── RTKQueryDemo.tsx            # Complete RTK Query demonstration
```

## 🔧 Critical Zoom SDK Setup

### Required SDK Initialization
Based on the official Zoom sample, these are **essential**:

```typescript
import { ZoomMtg } from '@zoom/meetingsdk';

// These MUST be called before any Zoom functionality
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
```

### Required CSS (in index.css)
```css
#zmmtg-root {
  display: none;
  min-width: 0 !important;
}

html, body {
  min-width: 0 !important;
}
```

### Required HTML Element (in index.html)
```html
<div id="zmmtg-root" style="width:100vw;height:100vh;"></div>
```

## 🎯 Available Routes

| Route | Component | Description | View Type |
|-------|-----------|-------------|-----------|
| `/nav-demo` | NavigationDemo | Navigation and overview | - |
| `/rtk-demo` | RTKQueryDemo | Complete RTK Query demonstration | - |
| `/zoom-test` | ZoomMeetingJoin | Simple API testing interface | - |
| `/zoom-meeting/:id` | ZoomMeeting | Embedded meeting view | Component View |
| `/zoom-client/:id` | ZoomMeetingClient | Full-screen meeting view | Client View |

## 🚀 Zoom SDK Implementation Patterns

### Component View (Embedded)
```typescript
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

const client = ZoomMtgEmbedded.createClient();
await client.init({
  zoomAppRoot: containerElement,
  language: 'en-US',
  patchJsMedia: true,
  leaveOnPageUnload: true,
});

await client.join({
  signature: signature,
  meetingNumber: meetingNumber,
  password: password,
  userName: userName,
  userEmail: userEmail,
});
```

### Client View (Full Screen)
```typescript
import { ZoomMtg } from '@zoom/meetingsdk';

// Must be called at module level
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

// Show the zoom root element
document.getElementById('zmmtg-root').style.display = 'block';

ZoomMtg.init({
  leaveUrl: leaveUrl,
  patchJsMedia: true,
  leaveOnPageUnload: true,
  success: () => {
    ZoomMtg.join({
      signature: signature,
      meetingNumber: meetingNumber,
      passWord: password,
      userName: userName,
      userEmail: userEmail,
    });
  },
});
```

## 🛠 Installation and Setup

### Dependencies Installed
```bash
npm install @reduxjs/toolkit react-redux
```

### Store Configuration
The Redux store is configured in `src/store/index.ts` with:
- RTK Query middleware
- DevTools integration
- Serializable check configuration
- Setup listeners for cache management

## 🔧 API Implementation

### Zoom API Slice (`src/store/api/zoomApi.ts`)

```typescript
export const zoomApi = createApi({
  reducerPath: 'zoomApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8081/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ZoomSignature'],
  endpoints: (builder) => ({
    getZoomSignature: builder.query<ZoomSignatureResponse, {
      meetingNumber: string;
      role: number;
    }>({
      query: ({ meetingNumber, role }) => ({
        url: `/zoom-signature`,
        params: { meetingNumber, role },
      }),
      providesTags: ['ZoomSignature'],
      keepUnusedDataFor: 300, // 5 minutes cache
    }),
  }),
});
```

### Component Usage

```typescript
const {
  data,
  error,
  isLoading,
  refetch,
  isFetching
} = useGetZoomSignatureQuery(
  { meetingNumber: 'math123', role: 0 },
  {
    skip: !meetingNumber,
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  }
);
```

## 🎯 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/nav-demo` | NavigationDemo | Navigation and overview |
| `/rtk-demo` | RTKQueryDemo | Complete RTK Query demonstration |
| `/zoom-test` | ZoomMeetingJoin | Simple API testing interface |
| `/zoom-meeting/:id` | ZoomMeeting | Zoom SDK integration |

## 🧪 Testing the Implementation

### 1. Start the Backend Server
```bash
cd emoji-sphere-backend
mvn spring-boot:run
```
The backend should be running on `http://localhost:8081`

### 2. Start the Frontend Server
```bash
cd emoji-sphere
npm run dev
```
The frontend should be running on `http://localhost:8080`

### 3. Test the API Integration

1. **Navigation Demo**: Visit `/nav-demo` for overview and navigation
2. **RTK Demo**: Visit `/rtk-demo` for complete feature demonstration
3. **API Testing**: Use the interface to test different meeting numbers and roles
4. **Real-time Features**: Enable polling to see automatic updates

## 🔍 RTK Query Features Demonstrated

### 1. Query Configuration Options
```typescript
useGetZoomSignatureQuery(params, {
  skip: boolean,              // Skip query execution
  pollingInterval: number,    // Auto-refetch interval
  refetchOnFocus: boolean,    // Refetch on window focus
  refetchOnReconnect: boolean,// Refetch on network reconnect
  refetchOnMountOrArgChange: boolean, // Refetch behavior
})
```

### 2. State Management
- **Loading States**: `isLoading`, `isFetching`
- **Success States**: `isSuccess`, `data`
- **Error States**: `isError`, `error`
- **Cache States**: Automatic caching and invalidation

### 3. Advanced Features
- **Manual Refetch**: `refetch()` function
- **Cache Management**: Automatic cache invalidation
- **Background Updates**: Smart refetching strategies
- **Type Safety**: Full TypeScript integration

## 🎨 UI Components

### ZoomMeetingJoin Component
- Input fields for meeting configuration
- Real-time API testing
- Visual feedback for API states
- Error handling and success indicators

### RTKQueryDemo Component
- Comprehensive demonstration of all RTK Query features
- Live state monitoring
- Multiple query examples
- Caching behavior demonstration

## 🔒 Security Considerations

- API endpoints are properly configured in Spring Security
- CORS settings allow frontend communication
- Environment-specific configuration support
- Error boundaries for graceful failure handling

## 📊 Performance Benefits

### Caching
- Reduces unnecessary API calls
- Configurable cache duration
- Automatic cache invalidation
- Memory-efficient storage

### Optimistic Updates
- Immediate UI feedback
- Background synchronization
- Rollback on failure
- Improved user experience

### Bundle Size
- Tree-shakable imports
- Minimal runtime overhead
- Efficient state updates
- Optimized re-renders

## 🐛 Error Handling

### API Level
```typescript
if (signatureError) {
  // Handle different error types
  if ('status' in signatureError) {
    // HTTP errors
  } else {
    // Network errors
  }
}
```

### Component Level
- Loading states with spinners
- Error alerts with descriptive messages
- Retry mechanisms
- Graceful degradation

## 🚀 Next Steps

### Potential Enhancements
1. **Authentication Integration**: Add JWT token handling
2. **Offline Support**: Implement offline-first capabilities
3. **Real-time Updates**: Add WebSocket integration
4. **Advanced Caching**: Implement custom cache strategies
5. **Testing**: Add unit and integration tests

### Additional API Endpoints
- Meeting creation/management
- User authentication
- Real-time chat integration
- File upload capabilities

## 📚 Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TypeScript Integration](https://redux-toolkit.js.org/tutorials/typescript)
- [Zoom Web SDK Documentation](https://marketplace.zoom.us/docs/sdk/native-sdks/web)

---

## 🏁 Conclusion

The RTK Query implementation provides a robust, type-safe, and efficient solution for API state management in the Emoji Sphere application. The integration with the Zoom API demonstrates real-world usage patterns and best practices for modern React applications.

**Key Benefits Achieved:**
- ✅ Simplified API state management
- ✅ Automatic caching and optimization
- ✅ Type-safe development experience
- ✅ Comprehensive error handling
- ✅ Real-time updates and polling
- ✅ Improved developer experience