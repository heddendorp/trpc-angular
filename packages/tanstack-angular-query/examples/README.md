# Angular tRPC Integration Examples

This directory contains comprehensive examples of how to integrate tRPC with Angular using the `@trpc/tanstack-angular-query` package.

## Quick Start

### 1. Server Setup

First, define your tRPC router with proper typing:

```typescript
// server/router.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello ${input.name}!`),

  user: t.router({
    list: t.procedure.query(() => [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]),
    create: t.procedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input }) => ({ id: 3, name: input.name })),
  }),
});

// This export is crucial for client-side typing!
export type AppRouter = typeof appRouter;
```

### 2. Client Setup

Configure your Angular app with tRPC:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@trpc/tanstack-angular-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router';

// Create properly typed tRPC client
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideTanStackQuery(new QueryClient()),
    provideTRPC(trpcClient), // Pass the typed client
  ],
};
```

### 3. Component Usage

There are two ways to use tRPC in your components:

#### Option 1: Type Router in Each Component

```typescript
// user-list.component.ts
import { Component } from '@angular/core';
import { injectTRPC } from '@trpc/tanstack-angular-query';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import type { AppRouter } from './server/router';

@Component({
  selector: 'app-user-list',
  template: `
    <div>
      @if (users.isPending()) {
        <p>Loading...</p>
      } @else if (users.isError()) {
        <p>Error: {{ users.error()?.message }}</p>
      } @else {
        <ul>
          @for (user of users.data(); track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class UserListComponent {
  private trpc = injectTRPC<AppRouter>();

  users = injectQuery(() => this.trpc.user.list.queryOptions());
}
```

#### Option 2: Create Typed Injectors (Recommended)

For better ergonomics, create typed injection functions once and reuse them:

```typescript
// trpc.ts - Create this file once in your project
import { createTRPCInjectors } from '@trpc/tanstack-angular-query';
import type { AppRouter } from './server/router';

// Typed injection functions for your application
export const { injectTRPC, injectTRPCClient } =
  createTRPCInjectors<AppRouter>();
```

Then use them in your components without typing:

```typescript
// user-list.component.ts
import { Component } from '@angular/core';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { injectTRPC } from './trpc'; // Import your typed injector

@Component({
  selector: 'app-user-list',
  template: `
    <div>
      @if (users.isPending()) {
        <p>Loading...</p>
      } @else if (users.isError()) {
        <p>Error: {{ users.error()?.message }}</p>
      } @else {
        <ul>
          @for (user of users.data(); track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class UserListComponent {
  // No need to specify router type - it's automatically inferred!
  private trpc = injectTRPC();

  users = injectQuery(() => this.trpc.user.list.queryOptions());
}
```

## Common Issues and Solutions

### TypeScript Error: `untypedClientSymbol` missing

**Problem**: Getting a TypeScript error about missing `untypedClientSymbol`.

**Solution**: Make sure you're typing your client correctly:

```typescript
// ❌ Wrong - missing type parameter
const client = createTRPCClient({ links: [...] });

// ✅ Correct - with type parameter
const client = createTRPCClient<AppRouter>({ links: [...] });
```

### Missing exports

**Problem**: Cannot import `injectTRPC` or `injectTRPCClient`.

**Solution**: These are now exported from the main package:

```typescript
import {
  provideTRPC,
  injectTRPC,
  injectTRPCClient,
} from '@trpc/tanstack-angular-query';
```

### Node.js version compatibility

**Problem**: Build errors or dependency issues.

**Solution**: Use Node.js 22.10+ and pnpm as specified in the root package.json:

```bash
# Enable corepack for pnpm
corepack enable

# Install dependencies
pnpm install
```

## Examples in This Directory

- [`app.config.ts`](./app.config.ts) - Complete application configuration
- [`trpc.ts`](./trpc.ts) - Typed injection functions (recommended approach)
- [`user-list.component.ts`](./user-list.component.ts) - Component with queries and mutations
- [`server/router.ts`](./server/router.ts) - Example tRPC router
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Common issues and solutions

## Testing

The package includes comprehensive tests that demonstrate proper usage:

```bash
# Run tests
pnpm test

# Run TypeScript checks
pnpm test-run:tsc
```

## Key Features

- ✅ **Type Safety**: Full TypeScript support with procedure input/output inference
- ✅ **Angular DI**: Uses Angular's dependency injection system
- ✅ **Signals**: Reactive state management with Angular signals
- ✅ **Lifecycle**: Automatic cleanup using Angular's `DestroyRef`
- ✅ **SSR**: Compatible with Angular Universal
- ✅ **TanStack Query**: Full integration with TanStack Query features

## Requirements

- Angular 16+
- TypeScript 5.7+
- Node.js 22.10+
- pnpm (via corepack)

## Next Steps

1. Check out the [complete documentation](../README.md)
2. Look at the [test examples](../test/basic.test.ts) for more usage patterns
3. Report issues on the [GitHub repository](https://github.com/trpc/trpc)
