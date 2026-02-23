# Sellar

Sellar is an Eneba + Discord style marketplace with listings, protected deals, realtime rooms, guilds, shipping provider selection, and chess minigame support.

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind, TanStack Query, Zod, Socket.IO client
- Backend: Fastify (Node.js), TypeScript, Prisma, PostgreSQL, Redis, BullMQ, Socket.IO
- Security: JWT access+refresh cookie strategy, Argon2 hashing, optional TOTP 2FA, RBAC, rate limiting, audit logs on write actions

## Quick start
1. `corepack enable && pnpm install`
2. `docker compose up -d postgres redis`
3. `pnpm --filter @sellar/api prisma:migrate`
4. `pnpm --filter @sellar/api seed`
5. `pnpm dev`

## API docs
- Swagger UI: `http://localhost:4000/docs`

## Environment variables
See `.env.example`.

## Usable user journey
1. Open `/login` and register/login.
2. Create a listing at `/sell` and enable supported shipping providers.
3. Browse listings at `/marketplace` and click Buy.
4. In `/checkout`, buyer chooses provider (Omniva/LP Express) and locker pickup point.
5. Open `/deal-room/:id` to chat, update milestones, add evidence, and open disputes.
6. Use `/guilds` to create guilds/channels and chat with role-based permissions.
7. Admin users can inspect `/admin` audit logs and moderation actions.

## Core flows implemented
- Register/login/logout/refresh + TOTP setup endpoint
- Profile/storefront and completed-deal-only rating endpoint
- Listing create/search/update and seller-profile links
- Checkout creates Deal + escrow-hold ledger entry + shipping locker selection
- Deal state machine controls transition endpoint changes
- Immutable evidence append endpoint
- Dispute open and moderator/admin resolve flows
- Simulated Omniva and LP Express adapters + tracking worker
- Guild channels + message endpoints with RBAC checks
- Notifications feed endpoint and right-rail UI
- Chess game endpoints and board UI
- Audit logs on write endpoints

## Postman collection
- `docs/postman/Sellar.postman_collection.json`

## Deployment
- Web can deploy to Vercel.
- API can deploy to Fly/Render.
- Use managed Postgres and Redis.

## Program-scale planning
- Minimum-line full implementation target is defined in `docs/IMPLEMENTATION_PLAN_140K.md` (140,000 LOC target across Phases A–J).
- Track current line count with: `pnpm loc:report` (or `node tools/loc-report.mjs`).
