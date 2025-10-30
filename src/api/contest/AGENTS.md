# Contest Domain Guide

## Data Model Hierarchy

```
Contest (id, name, startTime, endTime, settings)
  ├── Registration (userId, contestId) - users enrolled
  ├── Problem (number, title, description, timeLimit, memoryLimit)
  │     ├── Testcase (number, input, output, hidden)
  │     └── Submission (userId, language, content)
  │           └── Result (testcaseNumber, status, time, memory)
  └── Settings (leaderboard, submissions_limit, visible_results, languages[])
```

### Composite Primary Keys
- **Problem**: `(contestId, number)` - problems are numbered sequentially per contest
- **Testcase**: `(contestId, problemNumber, number)` - testcases numbered per problem
- **Registration**: `(userId, contestId)` - prevents duplicate registrations

### Key Relationships
- Cascade deletes flow down: Contest → Problem → Testcase & Submission → Result
- Submissions reference both `contestId` AND `problemNumber` (composite foreign key)
- Users can submit to multiple problems in multiple contests

## Contest Settings Schema

```typescript
{
  leaderboard: boolean,          // Show leaderboard to participants
  submissions_limit: number,     // Per-problem limit, 0 = unlimited
  visible_results: boolean,      // Can participants see their results?
  languages: string[]            // Whitelist of allowed language engines
}
```

Stored as JSONB in `contest.settings` column with TypeBox validation.

## Business Logic Patterns

### Leaderboard Calculation
Complex SQL query that:
1. Finds **first successful submission** per problem per user (via `selectDistinctOn`)
2. Filters out submissions with any failed testcases (via `notExists` + `ne(status, 'CA')`)
3. Aggregates submissions into JSONB array per user
4. Orders by submission count DESC
5. Limits to top 20

**Key insight**: Uses raw SQL (`sql.raw()`) for correlated subqueries and JSON aggregation.

### Registration System
- Simple join table pattern: `(userId, contestId)` with composite PK
- Check enrollment: `ContestService.isUserRegistered(contestId, userId)`
- Register: `ContestService.register(contestId, userId)` - simple insert

### Problem Numbering
- Problems are numbered **sequentially per contest** (1, 2, 3...)
- Number is part of composite key, not a separate ID
- When creating a problem, you must specify both `contestId` and `number`

### Submission Judging Flow
1. User submits via `/contest/:id/problem/:problem/submit/:language`
2. `LocalboxService.submit()` creates submission + notifier
3. For each testcase:
   - Worker executes code in LocalBox
   - Compares output with testcase.output
   - Saves result to `result` table with status
4. Submission status computed on-the-fly from `result` table:
   - `pending` - no results yet
   - `running` - some passed, some pending
   - `done` - all testcases have results

## Common Workflows

### Creating a Contest with Problems
1. Create contest: `POST /api/contest` (admin only)
2. Add problems: `POST /api/contest/:id/problem` with `number` field
3. Add testcases: `POST /api/contest/:id/problem/:problem/testcase`
4. Set languages in contest settings

### User Journey
1. Register: `POST /api/contest/register` with `code` (contest ID)
2. View problems: `GET /api/contest/:id/problem`
3. Submit solution: `POST /api/contest/:id/problem/:problem/submit/:language`
4. View results: `GET /api/submission/:id` (if `visible_results` enabled)

### Admin Overview
`ContestAdminService.overview(id)` returns:
- `registrations` - total enrolled users
- `submitters` - unique users who submitted at least once
- `submissions` - total submission count

## Gotchas

- **Problem numbers must be unique per contest** - enforce at application level before insert
- **Testcases are cascaded deleted** - deleting a problem removes all testcases
- **Leaderboard uses raw SQL** - modify with care, test aggregations manually
- **Contest settings are JSONB** - use TypeBox schema for validation, not Drizzle constraints
- **Submission status is computed** - not stored directly, calculated from `result` table
- **Time checks** - database constraint ensures `startTime < endTime`
