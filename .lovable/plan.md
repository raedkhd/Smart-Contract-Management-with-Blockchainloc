## Protocol Vault — Smart Contract Management Platform

A team workspace for managing EVM Solidity contracts pre-deployment. Built in the chosen "Technical ledger" style (light zinc, JetBrains Mono accents, network/status chips, emerald = signed, amber = audit).

## Stack

- TanStack Start (already scaffolded)
- Lovable Cloud (Supabase) — DB, auth, RLS
- Email/password + Google sign-in (Lovable Cloud defaults); wallet connect for attaching an EVM address to the user profile (sign-in remains email/Google, wallet is associative)
- shadcn/ui sidebar + tables, Tailwind v4 tokens copied from the prototype

## Routes

```
/auth                              Sign in / sign up (email + Google)
/_authenticated/                   Protected layout (sidebar shell, wallet pill, search)
  ├─ index                         → redirects to /repository
  ├─ repository                    Contract list (table) + workflow side rail
  ├─ contracts/$id                 Detail: Solidity code + approvals timeline + metadata
  ├─ lifecycle                     Kanban board across stages
  ├─ audits                        Audit reports list
  └─ team                          Members + roles (admin-only)
```

## Data model (Lovable Cloud)

- `profiles` (id → auth.users, display_name, avatar_url, wallet_address)
- `app_role` enum: `admin` | `legal` | `viewer`
- `user_roles` (user_id, role) + `has_role()` security-definer function
- `contracts` (id, name, version, network, stage, owner_id, source_code, abi, created_at, updated_at)
  - `network` enum: ethereum | arbitrum | optimism | base | polygon | sepolia
  - `stage` enum: draft | review | audit | approved | deployed
- `contract_approvals` (id, contract_id, approver_id, kind, status, note, signed_at)
  - `kind`: legal_review | security_audit | final_signoff
- `contract_activity` (id, contract_id, actor_id, event, payload, created_at) — drives the timeline

RLS: all reads gated to authenticated users in the workspace; writes scoped by role (admin: all; legal: contracts + approvals; viewer: read-only). Roles checked via `has_role(auth.uid(), 'role')`.

## Features (v1 scope)

1. **Auth** — email/password + Google, `/auth` page, `_authenticated` layout gate. First signup auto-assigned `admin` role.
2. **Wallet connect** — "Connect wallet" pill in header uses `window.ethereum` (MetaMask) to request accounts; address stored on profile and shown as `0x71C…3E41` chip. No on-chain calls in v1.
3. **Repository** — table of contracts with name/version, network chip, status chip, owner avatars, last-updated. Filter + search. "New contract" dialog with name, network, paste-in `.sol` source.
4. **Contract detail** — Solidity source in dark code panel (basic syntax highlighting via `shiki` or a lightweight regex highlighter; will use `react-syntax-highlighter` for reliability), approval timeline, metadata sidebar (compiler, license, owner). Role-gated action buttons: "Request review", "Approve", "Move to audit", "Mark approved".
5. **Lifecycle board** — kanban of contracts grouped by `stage`. Drag-to-move restricted by role (admin + legal).
6. **Audits** — list of `contract_approvals` where `kind = security_audit`, with status + linked contract.
7. **Team** — admin-only page to invite-by-email (creates pending user_role rows) and change roles.

## Design implementation

- Copy tokens from the selected prototype verbatim into `src/styles.css`:
  - `--font-sans: 'Inter'`, `--font-mono: 'JetBrains Mono'` (loaded via `<link>` in `__root.tsx`)
  - Light zinc surface system (`bg-zinc-50` background, `zinc-100` panels, `zinc-200` borders)
  - Status colors: emerald (approved/signed), amber (under audit), blue (deployed), zinc (draft)
- Fixed 256px sidebar with logo + nav (Repository / Lifecycle / Audits / Team Settings) + footer user card with role badge
- Sticky 56px top header: search input (left), wallet chip + primary action button (right)
- Tables: zinc-200/50 header, divide-y rows, monospace version/address text, status pills with `ring-1`
- Code panel: `bg-zinc-900`, mono, color-coded keywords
- Approval timeline: vertical line w/ filled emerald dots (done), zinc dots (current), hollow rings (pending)

## Out of scope for v1

- Multi-sig wallet signatures, actual on-chain deploy, Etherscan sync, AI audit (all confirmed deferred)
- Real-time collaboration on source code

## Technical notes

- Server functions (`createServerFn` + `requireSupabaseAuth`) for all contract CRUD and approval actions; no direct Supabase calls in components for writes
- Public routes: only `/auth`
- Wallet connect lives client-side only; the connected address is persisted via a server fn that updates `profiles`
- Code highlighting via `react-syntax-highlighter` (Prism, solidity grammar)

