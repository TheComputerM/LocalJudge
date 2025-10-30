# LocalBox Integration Guide

## Overview
LocalBox is an external Docker service that provides sandboxed code execution. It runs on port 2000 and handles compilation and execution of user-submitted code in multiple languages.

## Architecture Pattern

### Web Worker for Parallel Execution
```
User submits code → LocalboxService.submit()
                  ↓
           Creates submission record
                  ↓
    Spawns Web Worker for EACH testcase
                  ↓
     Workers execute in parallel via LocalBox
                  ↓
    Worker.onmessage receives result
                  ↓
      Compare output & save to DB
                  ↓
   Notify via NotificationManager
```

**Why Web Workers?** Running testcases in parallel without blocking the main event loop. Each testcase is an independent worker message.

### Key Components

#### 1. **Web Worker (`worker.ts`)**
- Single global worker instance handles all execution requests
- Receives: `{ id, testcase, engine, files, options }`
- Posts back: `{ id, testcase, result }`
- **Parallelism**: Multiple `postMessage()` calls execute concurrently

#### 2. **NotificationManager (`notification.ts`)**
- Manages async iterators (`Notifier` class) for progress tracking
- `create(id, limit)` - creates a notifier that auto-completes after `limit` notifications
- `notify(id, value)` - triggers a value to all waiting consumers
- `get(id)` - returns the `Notifier` async iterable for consumption
- **Cleanup**: Auto-deletes notifier when done to prevent memory leaks
- **Use case**: Real-time updates for submission progress (used with SSE in one endpoint)

#### 3. **Client (`client.ts`)**
- Type-safe wrapper using `@better-fetch/fetch` (not Elysia Eden)
- Schema validated with TypeBox `Compile()`
- Endpoints: `@get/engine`, `@post/engine/:engine/execute`, etc.

#### 4. **Service (`service.ts`)**
- `submit()` - orchestrates submission: inserts DB record, creates notifier, posts to worker
- `worker.onmessage` - processes results, compares output with `checker()`, saves to `result` table
- **Status mapping**: `OK` → check output → `CA`/`WA`, `RE`/`CE` → direct mapping

## Common Workflows

### Adding a New Language
1. Check available engines: `localjudge.localbox.engine.get()`
2. Install: `localjudge.localbox.engine[':engine'].post({ params: { engine: "python" } })`
3. Add to contest settings `languages` array

### Judging Process
1. **Submission**: User POSTs to `/contest/:id/problem/:problem/submit/:language`
2. **Execution**: `LocalboxService.submit()` spawns workers for all testcases in parallel
3. **Evaluation**: Each worker result is compared token-by-token via `checker()`
4. **Storage**: Results saved to `result` table with status (`CA`, `WA`, `RE`, `CE`, etc.)
5. **Notification**: Client can optionally stream progress via `NotificationManager` (SSE endpoint)

### Status Codes
- `OK` - Executed successfully, check output for correctness → `CA`/`WA`
- `CE` - Compilation Error
- `RE` - Runtime Error
- `TO` - Time Out
- `SG` - Signal (killed by signal)
- `XX` - Unknown/Internal Error
- `OE` - Output Error (buffer overflow)

## Important Patterns

### Checker Algorithm
```typescript
function checker(a: string, b: string): boolean {
  const atokens = tokenize(a);  // trim + split on whitespace
  const btokens = tokenize(b);
  // Token-by-token comparison (ignores extra whitespace)
}
```
- **Not** byte-for-byte comparison
- Tolerates different whitespace formatting
- Fails on length mismatch or any token inequality

### Parallel Execution Model
```typescript
// All testcases start immediately - no sequential waiting
for (const testcase of testcases) {
  worker.postMessage({ id, testcase: testcase.number, ... });
}
```
- Worker processes messages concurrently
- Results arrive in non-deterministic order
- `worker.onmessage` handler must identify which testcase completed via `id` + `testcase` fields

## Gotchas

- **Worker is global singleton**: Single worker instance handles all requests - don't recreate it
- **Notifier cleanup**: Happens automatically via `onCleanup` hook - don't manually delete
- **Result state is computed**: Submission status calculated from `result` table, not stored directly
- **File naming convention**: Use `@` as the filename in `files` array for the main source file
- **Engine names are case-sensitive**: Must match LocalBox engine IDs exactly
- **Parallel execution order**: Results arrive in random order - use `testcase` number to identify
- **NotificationManager is optional**: Only needed for real-time progress updates, judging works without it
