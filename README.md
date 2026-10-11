# Luma — Secure Note-Taking Application

Frontend for the Secure Note-Taking Application interview assignment.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand for session and UI state
- Next.js Server Actions for backend API queries and mutations

## Setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

On macOS/Linux:

```bash
cp .env.example .env.local
npm run dev
```

The backend must be running at the URL configured by `NEXT_PUBLIC_API_URL`.

## Feature coverage

- Public landing page with public post discovery
- User registration and JWT login
- Private note create, list, update, and delete flows
- Public post list, detail, and user-specific lookup flows
- Authenticated post create, update, and delete flows
- Ownership-aware post controls with admin override
- Admin user list, create, update, and delete flows
- Admin interest aggregation dashboard
- Responsive desktop/mobile workspace navigation
- Loading, empty, validation, and API error states

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```
