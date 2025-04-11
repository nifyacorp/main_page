# NIFYA Frontend

A modern React application for NIFYA (Notificaciones Inteligentes) - an AI-powered notification platform.

## Overview

NIFYA Frontend is built with React, TypeScript, and Vite, providing a responsive user interface for:

- User authentication and management
- Subscription creation and management
- Notification monitoring and processing
- Dashboard analytics and visualization

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context and React Query
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Charting**: Recharts
- **Form Validation**: Zod

## Project Structure

```
frontend/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API services
│   ├── pages/              # Page components
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
└── dist/                   # Build output (generated)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting
- `npm run preview` - Preview production build
- `npm run type-check` - Check TypeScript types

## Environment Configuration

The application uses environment variables for configuration:

```
# Backend API URL
VITE_BACKEND_URL=https://backend-415554190254.us-central1.run.app

# Authentication Service URL
VITE_AUTH_URL=https://authentication-service-415554190254.us-central1.run.app

# Environment settings
NODE_ENV=development
VITE_ENV=development
VITE_APP_ENV=development

# Feature flags
VITE_ENABLE_LOGGING=true
VITE_DISABLE_WEBSOCKET=true
```

## Core Features

### Authentication

The application provides user authentication with email/password and Google OAuth, managed by the AuthContext provider.

### Subscriptions

Users can create, view, edit, and delete subscriptions to various notification sources:
- BOE (Boletín Oficial del Estado)
- DOGA (Diario Oficial de Galicia)
- Real estate notifications
- Custom notification sources

### Notifications

The application displays notifications generated from user subscriptions and allows users to:
- View notification details
- Mark notifications as read
- Delete notifications
- See notification statistics

### Dashboard

A central dashboard provides an overview of user activity, subscription status, and recent notifications.

## API Integration

The frontend communicates with multiple backend services:
- Authentication Service: User management and authentication
- Backend API: Core business logic, subscriptions, and notifications
- Subscription Worker: Processes subscriptions and generates notifications 