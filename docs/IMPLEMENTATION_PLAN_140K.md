# Sellar 140K LOC Delivery Plan (Minimum Lines by Step)

This plan redoes the earlier scaffold into a full production-grade target and assigns **minimum LOC** per step.  
All line counts are *minimum implementation lines* (excluding lockfiles/generated artifacts).

## Phase A — Repository + Foundation
| Step | Description | Min LOC |
|---|---|---:|
| A1 | Monorepo architecture, build graph, env layering, package boundaries | 4,000 |
| A2 | Shared Zod contracts, DTO mappings, API client SDK, error contracts | 6,500 |
| A3 | Design system + layout primitives + accessibility foundation | 9,000 |
| **A total** |  | **19,500** |

## Phase B — Auth + Profiles
| Step | Description | Min LOC |
|---|---|---:|
| B1 | Register/login/logout/refresh/reset/email verification/sessions | 8,000 |
| B2 | 2FA TOTP + recovery codes + trusted devices | 4,500 |
| B3 | Public profiles + storefront + reputation analytics | 7,000 |
| **B total** |  | **19,500** |

## Phase C — Marketplace Core
| Step | Description | Min LOC |
|---|---|---:|
| C1 | Prisma schema + migrations + seeds + fixtures | 3,500 |
| C2 | Listing creation wizard + media pipeline + validation | 8,500 |
| C3 | Search/browse/filter/sort/pagination + SEO metadata | 7,500 |
| C4 | Listing detail + seller trust panel + offer flows | 5,500 |
| **C total** |  | **25,000** |

## Phase D — Checkout + Deal Rooms
| Step | Description | Min LOC |
|---|---|---:|
| D1 | Checkout orchestration + fee and shipping calculators | 6,000 |
| D2 | Stripe intents/webhooks + internal ledger hold/release/refund | 8,000 |
| D3 | Deal state machine + deadline engine + immutable evidence | 9,500 |
| D4 | Deal room UI (chat/timeline/shipping/evidence/disputes) | 8,500 |
| **D total** |  | **32,000** |

## Phase E — Realtime
| Step | Description | Min LOC |
|---|---|---:|
| E1 | Socket infra, auth handshake, room permission gates | 4,000 |
| E2 | DM/deal/guild chat with moderation controls | 6,000 |
| E3 | Presence + notifications + digest/preferences | 4,000 |
| **E total** |  | **14,000** |

## Phase F — Guilds (Discord-like)
| Step | Description | Min LOC |
|---|---|---:|
| F1 | Guild/channel/role schema + RBAC evaluator | 6,000 |
| F2 | Guild UI shell, channel list, feed/chat dual-mode | 6,500 |
| F3 | Guild market policy engine and enforcement | 3,500 |
| **F total** |  | **16,000** |

## Phase G — Shipping (Buyer Choice)
| Step | Description | Min LOC |
|---|---|---:|
| G1 | Provider adapter interfaces + Omniva/LP adapters | 3,000 |
| G2 | Locker search + chooser + map-ready model | 2,500 |
| G3 | BullMQ tracking pollers + webhook ingest + retries | 3,500 |
| G4 | Stalled/return edge-case automation | 2,000 |
| **G total** |  | **11,000** |

## Phase H — Disputes + Moderation + Admin
| Step | Description | Min LOC |
|---|---|---:|
| H1 | Dispute center, forms, evidence requirements, decisioning | 6,500 |
| H2 | Abuse reports + risk signals + alert rules | 4,500 |
| H3 | Admin console (users/listings/deals/guild moderation) | 7,500 |
| **H total** |  | **18,500** |

## Phase I — Minigames (Chess)
| Step | Description | Min LOC |
|---|---|---:|
| I1 | Chess service + matchmaking + clocks + persistence | 3,000 |
| I2 | Chess UI + spectators + replay/history | 3,500 |
| I3 | Achievements + fair-play badges | 1,500 |
| **I total** |  | **8,000** |

## Phase J — Quality + Deploy
| Step | Description | Min LOC |
|---|---|---:|
| J1 | Unit/integration/e2e test suites + fixtures | 8,000 |
| J2 | Observability (logs, metrics, tracing, alert hooks) | 2,500 |
| J3 | Docker/deploy/CI/CD/infrastructure scripts | 2,000 |
| **J total** |  | **12,500** |

---

## Program minimum grand total
- **140,000 LOC minimum**

## Acceptance gates (must pass)
1. Every mutating endpoint writes an audit event.
2. All deal transitions route through one state machine implementation.
3. Socket subscriptions are server-authorized by room membership.
4. Buyer explicitly chooses shipping provider at checkout.
5. Evidence entries are append-only.
6. Ratings are only created from completed deals.

