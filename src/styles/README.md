# Frontend Styling

All CSS styling for the NIFYA frontend has been consolidated into a single file:

`frontend/src/index.css`

## Styling Architecture

- We use TailwindCSS for utility-based styling
- Theme variables are defined in `index.css`
- We use a light theme design system

## UI Components

Reusable UI components are located in `src/components/ui/` and follow the shadcn/ui pattern:

- They use TailwindCSS for styling
- They are themeable via CSS variables

## Best Practices

1. Always use the Tailwind utility classes when possible
2. For custom styles, add them to `index.css` using `@layer` directives
3. Use the theme variables (e.g., `bg-background`, `text-foreground`) for consistent theming

This approach ensures we have a single source of truth for styling across the application. 