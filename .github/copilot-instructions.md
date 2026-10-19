# Workspace Guide

## Project
- Nhịp is a Vietnamese team task workspace built with Next.js App Router, TypeScript, and Auth.js v5.
- Authentication uses the Auth.js Google provider configured with `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- Protected task dashboard is at `/`; sign-in is at `/login`; Auth.js callback routes are under `/api/auth/[...nextauth]`.
- Task interactions currently use client-side sample data only. Do not describe them as persistent or database-backed.

## Development
- Install dependencies with `npm install`.
- Copy `.env.example` to `.env.local` and configure Google OAuth credentials before running the app.
- Use `npm run dev` for development, `npm run build` for production build, `npm start` to serve a build, `npm run lint` for ESLint, and `npm run typecheck` for TypeScript.
- Register `http://localhost:3000/api/auth/callback/google` as the Google OAuth redirect URI for local development.
- Keep secrets server-side. Never use `NEXT_PUBLIC_` for authentication secrets.
- No extra VS Code extensions or workspace tasks are required.

## Completion Checklist
- [x] Verify workspace instructions exist.
- [x] Clarify project requirements.
- [x] Scaffold and customize the app.
- [x] Check extension requirements; none were specified.
- [x] Install dependencies and verify lint, typecheck, and production build.
- [x] Document setup and OIDC configuration in README.md.
- [ ] Launch the app after OIDC environment values are configured and the user confirms.
