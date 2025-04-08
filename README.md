# NIFYA Frontend

![NIFYA](https://ik.imagekit.io/appraisily/NYFIA/logo.png)

NIFYA is a modern platform that leverages artificial intelligence to provide personalized notifications about relevant information from BOE, real estate market, and more.

## 🌟 Key Features

- **📰 BOE Monitoring**: Automated monitoring of official publications with intelligent filtering based on your interests
- **🏠 Real Estate Alerts**: Track Idealista and Fotocasa with customized filters and real-time alerts
- **🧠 Adaptive AI**: Learning system that improves with use and refines search criteria automatically
- **📊 Comprehensive Dashboard**: Overview of all active subscriptions and recent notifications
- **📱 Responsive Design**: Interface adaptable to all devices with optimized mobile navigation

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API and React Query
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time Updates**: Socket.IO
- **Testing**: Vitest (in progress)

## 📂 Project Structure

```
frontend/
├── src/                        # Source code
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── notifications/      # Notification components
│   │   └── settings/           # Settings components
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── NotificationContext.tsx # Notification state management
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-auth.ts         # Authentication hook
│   │   ├── use-notifications.ts # Notifications hook
│   │   └── use-subscriptions.ts # Subscription management hook
│   ├── lib/                    # Utilities and helpers
│   │   ├── api/                # API services and types
│   │   └── utils/              # Utility functions
│   ├── pages/                  # Page components
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── public/                     # Static assets
└── dist/                       # Build output (generated)
```

## ✨ Core Components and Functions

### Authentication

#### `src/contexts/AuthContext.tsx`
Provides authentication state and methods across the application.

```typescript
// Key exported values:
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<User>;
  isLoading: boolean;
  error: string | null;
}
```

#### `src/hooks/use-auth.ts`
Custom hook for consuming the auth context.

```typescript
// Usage:
const { 
  isAuthenticated, 
  user, 
  login, 
  logout 
} = useAuth();
```

### Subscriptions

#### `src/lib/schemas/subscription/*.ts`
Standardized schemas for subscription data validation and type safety.

```typescript
// Available schemas:
import { 
  // Base schemas and types
  BaseSubscriptionSchema,
  SubscriptionType,
  SubscriptionFrequency,
  PromptsSchema,
  
  // Operation-specific schemas
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  
  // Response schemas
  SubscriptionResponseSchema,
  SubscriptionListResponseSchema,
  SubscriptionGetResponseSchema,
  SubscriptionCreateUpdateResponseSchema,
  SubscriptionDeleteResponseSchema,
  
  // Type definitions
  BaseSubscription,
  CreateSubscription,
  UpdateSubscription,
  SubscriptionResponse,
  SubscriptionListResponse,
  SubscriptionGetResponse,
  SubscriptionCreateUpdateResponse,
  SubscriptionDeleteResponse
} from '../../lib/schemas/subscription';
```

These schemas provide standardized validation for all subscription operations and ensure type safety across the application. See [Subscription Schema Documentation](../docs/subscription-schemas.md) for detailed usage.

#### `src/lib/api/services/subscriptions.ts`
API service for subscription management.

```typescript
// Main functions:
const subscriptionsService = {
  // Get all user subscriptions
  getSubscriptions: async () => {...},
  
  // Get subscription details
  getSubscription: async (id: string) => {...},
  
  // Create new subscription
  createSubscription: async (data: CreateSubscriptionDto) => {...},
  
  // Update subscription
  updateSubscription: async (id: string, data: UpdateSubscriptionDto) => {...},
  
  // Delete subscription
  deleteSubscription: async (id: string) => {...},
  
  // Process subscription
  processSubscription: async (id: string) => {...}
};
```

#### `src/hooks/use-subscriptions.ts`
Hook for subscription operations.

```typescript
// Usage:
const {
  subscriptions,
  isLoading,
  error,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  processSubscription
} = useSubscriptions();
```

#### `src/hooks/use-subscriptions-enhanced.ts`
Enhanced subscription hook with additional functionality.

```typescript
// Returns additional data:
interface EnhancedSubscriptionHook {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
  createSubscription: (data: CreateSubscriptionDto) => Promise<Subscription>;
  updateSubscription: (id: string, data: UpdateSubscriptionDto) => Promise<Subscription>;
  deleteSubscription: (id: string) => Promise<void>;
  processSubscription: (id: string) => Promise<ProcessingResult>;
  subscriptionsByType: Record<string, Subscription[]>;
  activeSubscriptions: Subscription[];
  pendingSubscriptions: Subscription[];
  processingSubscriptions: Subscription[];
  getSubscriptionStatus: (id: string) => SubscriptionStatus;
}
```

### Notifications

#### `src/lib/api/services/notifications.ts`
API service for notifications.

```typescript
// Main functions:
const notificationsService = {
  // Get all notifications
  getNotifications: async (params?: NotificationQueryParams) => {...},
  
  // Mark notification as read
  markAsRead: async (id: string) => {...},
  
  // Mark all notifications as read
  markAllAsRead: async () => {...},
  
  // Delete notification
  deleteNotification: async (id: string) => {...}
};
```

#### `src/hooks/use-notifications.ts`
Hook for notification operations.

```typescript
// Usage:
const {
  notifications,
  isLoading,
  error,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = useNotifications();
```

### WebSocket Connection

#### `src/lib/api/websocket.ts`
Manages real-time connections for notifications.

```typescript
// Main functions:
export const socketService = {
  // Connect to notification socket
  connect: (token: string) => {...},
  
  // Disconnect socket
  disconnect: () => {...},
  
  // Subscribe to notification events
  onNotification: (callback: (notification: Notification) => void) => {...},
  
  // Handle processing status updates
  onProcessingUpdate: (callback: (update: ProcessingUpdate) => void) => {...}
};
```

### Form Components

#### `src/components/subscriptions/SubscriptionForm.tsx`
Reusable form for creating and editing subscriptions.

```typescript
// Props:
interface SubscriptionFormProps {
  initialValues?: Partial<CreateSubscriptionDto>;
  onSubmit: (values: CreateSubscriptionDto) => Promise<void>;
  isEdit?: boolean;
  subscriptionTypes?: SubscriptionType[];
}
```

#### `src/components/ui/button.tsx`
Core button component with multiple variants.

```typescript
// Variants:
type ButtonVariant = 
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

// Sizes:
type ButtonSize = "default" | "sm" | "lg" | "icon";
```

## 🚀 Development Guide

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run hybrid` - Run with connections to production services but local frontend
- `npm run hybrid:wsl` - Hybrid mode for WSL environments
- `npm run build` - Build for production
- `npm run build:netlify` - Build specifically for Netlify
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Environment Configuration

Create a `.env` file in the project root:

```env
# Authentication Service URL
VITE_AUTH_URL=http://localhost:4000

# Backend API URL
VITE_BACKEND_URL=http://localhost:3000

# Subscription Worker URL
VITE_SUBSCRIPTION_WORKER=http://localhost:5000

# Enable detailed logging
VITE_ENABLE_LOGGING=true

# Environment type
VITE_ENV=development
VITE_APP_ENV=development

# Use Netlify redirects (set to false for local development)
VITE_USE_NETLIFY_REDIRECTS=false
```

### Docker Deployment

The application includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t nifya-frontend .

# Run the container
docker run -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app \
  -e BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  nifya-frontend
```

### Cloud Run Deployment

For Google Cloud Run deployment:

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/nifya-frontend
gcloud run deploy nifya-frontend \
  --image gcr.io/PROJECT_ID/nifya-frontend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app"
```

## 🔍 Troubleshooting

### CORS Issues

When encountering CORS errors:
- Verify that backend services have correct CORS configuration
- Check that environment URLs are properly set in `.env`
- Ensure authentication headers are formatted correctly

### Auth Token Issues

If authentication fails:
- Verify token storage and retrieval
- Check token expiration
- Ensure correct headers are included in requests
- Verify user synchronization between auth and backend services

### API Connection Problems

When API requests fail:
- Check network connectivity
- Verify environment variables are correctly set
- Confirm that backend services are running
- Check browser console for detailed error messages

## 🧪 Testing

For manual testing, use the built-in debugging tools:

```bash
# Start in development mode
npm run dev

# Access the debug page
# Navigate to: http://localhost:5173/debug
```

For API testing, consider using the testing tools from `/testing-tools` directory in the project root.

## 📋 Recent Updates

### WebSocket Connection Removal

- Removed WebSocket connection code as it's not needed in this project
- Replaced real-time updates with polling for notifications
- Added environment variable `VITE_DISABLE_WEBSOCKET=true` to explicitly disable WebSockets
- Fixed console errors related to WebSocket connection failures

### User Synchronization

Recent changes include improved user synchronization between the authentication service and backend database:

- Users authenticated with valid JWT tokens are now automatically created in the backend database if they don't exist
- This fixes foreign key constraint errors when creating subscriptions for users that exist in auth but not in backend
- CORS configuration has been updated to allow connections from all Cloud Run domains

## 🤝 Contributing

When contributing to this codebase:
1. Follow the existing code style and architecture
2. Maintain TypeScript type safety
3. Add appropriate documentation for new features
4. Test all changes thoroughly before submitting

---

Developed with ❤️ by the NIFYA Team