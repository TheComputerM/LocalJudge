# LocalJudge AI Coding Guidelines

## Project Overview
LocalJudge is a competitive programming platform built with TanStack Start (React SSR framework), Elysia backend, Drizzle ORM, and Better Auth. It integrates with LocalBox (external code execution sandbox) to judge code submissions.

## Architecture

### Stack
- **Frontend**: TanStack Router + React Start (file-based routing in `src/routes/`)
- **Backend API**: Elysia.js REST API (in `src/api/`)
- **Database**: PostgreSQL with Drizzle ORM (schema in `src/db/schema/`)
- **Auth**: Better Auth with admin plugin
- **Code Execution**: LocalBox external service (Docker container)
- **Forms**: TanStack Form with TypeBox validation
- **Build**: Vite + Bun runtime

### Key Patterns

#### API Structure (Elysia)
- **Location**: `src/api/{domain}/` - each domain has `index.ts`, `model.ts`, `service.ts`
- **Auth Guard**: Use `betterAuthPlugin` with `.guard({ auth: "admin" | "user" | "any" })`
  ```typescript
  .use(betterAuthPlugin)
  .guard({ auth: "admin" })
  ```
- **Models**: Use TypeBox schemas via `drizzle-typebox` - all models are namespaces with `select`, `insert`, `update` schemas:
  ```typescript
  export namespace ContestModel {
    export const select = createSelectSchema(contest, { ... });
    export const insert = createInsertSchema(contest, { ... });
  }
  ```
- **Client**: Isomorphic Eden Treaty client in `src/api/client.ts` - works on both server and client
  ```typescript
  import { localjudge } from "@/api/client";
  await localjudge.contest.get(); // type-safe API calls
  ```

#### Routes (TanStack Router)
- **File-based routing**: `src/routes/` - use `createFileRoute()` for each route
- **Loaders**: Fetch data server-side in `loader` property - use `rejectError()` wrapper to convert error objects to Promise rejections:
  ```typescript
  loader: async () => {
    const data = await rejectError(localjudge.something.get());
    return { data };
  }
  ```
- **Auth routes**: Nested under `_authenticated/` - auth check in `_authenticated.tsx`

#### Database (Drizzle)
- **Schemas**: Split by domain - `src/db/schema/auth.ts` and `src/db/schema/localjudge.ts`
- **Schema export**: Re-export all tables from `src/db/schema.ts`
- **Migrations**: Run `bun db:generate` then `bun db:migrate`
- **Scripts**: Use `taskRunnerDB` from `scripts/db/utils.ts` for seed/migration scripts (single connection, not pooled)

#### Forms
- **Custom hook**: Use `useAppForm` from `@/components/form/primitives` (wraps TanStack Form)
- **Validation**: TypeBox schemas compiled with `Compile()` in `validators.onChange`:
  ```typescript
  const form = useAppForm({
    defaultValues: Value.Create(Model.insert),
    validators: { onChange: Compile(Model.insert) },
  });
  ```
- **Field components**: `TextField`, `NumberField`, `DateTimePicker`, `ToggleSwitch`, `MultiselectField`, `Textarea`

## Development Workflows

### Setup & Running

#### Initial Setup
```bash
bun install
docker compose pull
docker compose up -d # Start LocalBox + PostgreSQL
bun db:migrate       # Run migrations + create admin user
```

#### Subsequent Running
```bash
docker compose start  # Run the pre-existing containers
bun dev         # Start dev server on :3000
```

### Database Tasks
```bash
bun db:generate       # Generate migrations from schema changes
bun db:migrate        # Apply migrations and create admin account
bun db:reset          # Wipe database and re-migrate (dev only)
bun db:studio         # Open Drizzle Studio
```

### Code Quality
- **Linting**: Biome (not ESLint) - run `bun check` or auto-fixes on commit via Lefthook
- **Formatting**: Biome with tabs (not spaces) and double quotes
- **Pre-commit**: Lefthook runs `biome check --write` on staged files

## Critical Conventions

### Error Handling
- **API calls in loaders**: Always wrap with `rejectError()` from `@/lib/utils` to convert `{ data, error }` responses to Promise rejections
- **Why**: TanStack Router loaders expect rejected promises, but Eden Treaty returns `{ data, error }` objects

### Type Safety
- **TypeBox everywhere**: Use TypeBox (not Zod) for validation - it's the validation library for this project
- **Model schemas**: All API models are TypeBox schemas wrapped in namespaces with `select`, `insert`, `update` properties
- **Treaty client**: `localjudge` client is fully type-safe end-to-end (API definitions flow to client)

### Environment Variables
- **Location**: `.env` file in root
- **Access**: Import from `@/lib/env` - parsed with TypeBox validation
- **Required**: `POSTGRES_*`, `BETTER_AUTH_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `LOCALBOX_URL`

### LocalBox Integration
- **Client**: `$localbox` from `@/api/localbox/client.ts` - type-safe fetch wrapper using `@better-fetch/fetch`
- **Service**: LocalBox runs in Docker on port 2000 - handles code compilation and execution
- **Schema**: LocalBox types defined in `@/api/localbox/schema.ts`

## File Naming
- Routes: kebab-case in `src/routes/` (e.g., `admin/participant.tsx`)
- Components: kebab-case (e.g., `confirm-action.tsx`)
- API domains: singular (e.g., `contest/`, `submission/`)

## Don't
- Don't use Zod - this project uses TypeBox
- Don't use ESLint - this project uses Biome
- Don't use Prettier - this project uses Biome
- Don't use spaces for indentation - use tabs
- Don't make API calls without `rejectError()` wrapper in route loaders
- Don't forget to run migrations after schema changes

## Domain-Specific Guides

For deeper understanding of complex subsystems, see:
- **[LocalBox Integration](src/api/localbox/AGENTS.md)** - Web Workers, parallel execution, code judging, notification system
- **[Contest Domain](src/api/contest/AGENTS.md)** - Data model hierarchy, leaderboard calculation, submission workflow
- **[Form System](src/components/form/AGENTS.md)** - TanStack Form integration, TypeBox validation, field components
