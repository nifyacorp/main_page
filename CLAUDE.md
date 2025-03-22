# NIFYA Project Guidelines

## Build Commands
- Development: `npm run dev` (local Vite server), `npm run hybrid` (mixed environment)
- Production: `npm run build` (type-check + build), `npm run build:netlify` (Netlify deployment)
- Validation: `npm run lint` (ESLint), `npm run type-check` (TypeScript verification)
- Testing: No specific test commands found. Add to package.json as needed.

## Code Style Guidelines
- **TypeScript**: Use strict mode, proper type annotations, avoid `any`, use Zod for validation
- **Imports**: External imports first, then internal with path aliases (@/*)
- **Naming**: PascalCase for components/interfaces, camelCase for functions/variables
- **Formatting**: 2-space indentation, ES6+ syntax, consistent trailing commas
- **React**: Functional components with hooks, typed props using interfaces
- **Error Handling**: Try/catch blocks, Error Boundaries, Zod validation
- **API**: Axios-based with interceptors, typed request/response interfaces
- **State**: Context API for global state, custom hooks for shared logic

## Important Architecture Notes
- UI components use Shadcn/Radix primitives with Tailwind
- React Router for navigation and protected routes
- React Query for data fetching and caching
- Socket.io for real-time notifications