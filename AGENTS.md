# Project Context

This is an Admin Dashboard for a mobile car wash platform (Glow Fix style).
Stack: React + Vite + Tailwind CSS + react-router-dom + @tanstack/react-query + axios + recharts + zustand.

## Folder conventions
- `src/api/endpoints/*.api.js` → functions that call the backend (or mocks if VITE_USE_MOCK_DATA=true)
- `src/features/<name>/` → one folder per page, contains the Page component + its hooks
- `src/components/ui/` → generic reusable components (no business logic)
- `src/components/charts/` → recharts wrapper components

## Code style
- Functional components only, no class components
- Every component must be commented clearly enough for any developer to follow
- Use Tailwind utility classes directly, no inline styles
- Data fetching always goes through a custom hook using react-query, never inside the component body
- Never hardcode data inside a Page component — always pull from a hook

## Domain roles
- Platform Admin manages: users, provider approval, services, cancellation rules, commission rules, promotions (owner_type=platform)
- Provider Admin (company) manages their own team and pricing
- Customers book services either by choosing a provider directly or auto-matching to nearest one

When asked to build a new page, always create:
1. api/endpoints/<feature>.api.js
2. mocks/<feature>.mock.js
3. features/<feature>/use<Feature>.js
4. features/<feature>/<Feature>Page.jsx