# NIFYA Frontend

![NIFYA](https://ik.imagekit.io/appraisily/NYFIA/logo.png)

NIFYA is a modern platform that leverages artificial intelligence to provide personalized notifications about relevant information from BOE, real estate market, and more.

## 🌟 Key Features

- **📰 BOE Monitoring**: Automated monitoring of official publications with intelligent filtering based on your interests
- **🏠 Real Estate Alerts**: Track Idealista and Fotocasa with customized filters and real-time alerts
- **🧠 Adaptive AI**: Learning system that improves with use and refines search criteria automatically
- **📊 Comprehensive Dashboard**: Overview of all active subscriptions and recent notifications
- **📱 Responsive Design**: Interface adaptable to all devices with optimized mobile navigation

## 🚀 New Feature-Based Architecture

The frontend has been completely rebuilt with a feature-based architecture for better organization, maintainability, and scalability. Key improvements include:

- **📂 Feature-based folder structure** for better code organization
- **🔄 Enhanced API client** with automatic token refresh and error handling
- **🔐 Improved authentication** with secure token management
- **📊 Standardized design system** for consistent UI components
- **⚡ Performance optimizations** with code splitting and lazy loading
- **📱 Mobile-first responsive design** for all screen sizes
- **♿ Improved accessibility** following WCAG guidelines

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Query and Context API
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Radix UI
- **Form Validation**: Zod
- **Testing**: React Testing Library (in progress)

## 📂 New Project Structure

```
frontend/
├── src/
│   ├── api/               # API client and hooks
│   │   ├── clients/       # API client implementation
│   │   ├── hooks/         # React Query hooks
│   │   ├── schemas/       # Zod validation schemas
│   │   └── utils/         # API utilities
│   ├── assets/            # Static assets
│   ├── components/        # Shared UI components
│   ├── design-system/     # Design system
│   │   ├── components/    # Base design components
│   │   ├── themes/        # Theme management
│   │   └── tokens/        # Design tokens
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard feature
│   │   ├── notifications/ # Notifications feature
│   │   ├── settings/      # User settings feature
│   │   ├── subscriptions/ # Subscription management
│   │   └── templates/     # Template management
│   ├── store/             # State management
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── routes.tsx         # Routing configuration
└── tests/                 # Test utilities
```

## ✨ Key Architectural Improvements

### 1. Enhanced API Layer

The new API client provides:

- Centralized request handling
- Automatic token refresh
- Standardized error handling
- Type-safe responses with Zod validation
- Request/response interceptors
- Retry mechanisms for failed requests

### 2. Authentication Improvements

- Secure token storage
- Automatic token refresh
- Session management with expiry
- Improved error handling for auth failures
- Multi-provider authentication support

### 3. Feature Organization

Each feature module includes:

- Components specific to the feature
- Custom hooks for feature functionality
- Feature-specific services
- Pages and layouts
- Feature-specific types and utilities

### 4. Design System

The new design system provides:

- Consistent color tokens
- Typography system
- Spacing standards
- Responsive breakpoints
- Animation guidelines
- Theme switching (light/dark)

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
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run analyze` - Analyze bundle size

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

## 🤝 Contributing

When contributing to this codebase:
1. Follow the feature-based architecture
2. Maintain TypeScript type safety
3. Add appropriate documentation for new features
4. Test all changes thoroughly before submitting

---

Developed with ❤️ by the NIFYA Team