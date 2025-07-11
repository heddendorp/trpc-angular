# @heddendorp/tanstack-angular-query

**TanStack Angular Query Integration for tRPC**

> ⚠️ **Experimental Package** - This package is currently experimental and depends on `@tanstack/angular-query-experimental`. API may change in future versions.

## Installation

```bash
# npm
npm install @heddendorp/tanstack-angular-query @tanstack/angular-query-experimental

# Yarn
yarn add @heddendorp/tanstack-angular-query @tanstack/angular-query-experimental

# pnpm
pnpm add @heddendorp/tanstack-angular-query @tanstack/angular-query-experimental

# Bun
bun add @heddendorp/tanstack-angular-query @tanstack/angular-query-experimental
```

## Usage

### 1. Create tRPC Client

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router';

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});
```

### 2. Setup Angular Application

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@trpc/tanstack-angular-query';

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(new QueryClient()), provideTRPC(trpcClient)],
};
```

### 3. Use in Components

There are two approaches to use tRPC in your components:

#### Option A: Type in Each Component

```typescript
import { Component } from '@angular/core';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { injectTRPC } from '@trpc/tanstack-angular-query';
import type { AppRouter } from './server/router';

@Component({
  selector: 'app-user-list',
  template: `
    <div>
      @if (userQuery.isPending()) {
        <p>Loading...</p>
      } @else if (userQuery.isError()) {
        <p>Error: {{ userQuery.error()?.message }}</p>
      } @else {
        <ul>
          @for (user of userQuery.data(); track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }

      <button
        (click)="createUser()"
        [disabled]="createUserMutation.isPending()"
      >
        Create User
      </button>
    </div>
  `,
})
export class UserListComponent {
  private trpc = injectTRPC<AppRouter>(); // Type specified here

  userQuery = injectQuery(() => this.trpc.user.list.queryOptions());

  createUserMutation = injectMutation(() =>
    this.trpc.user.create.mutationOptions({
      onSuccess: () => {
        this.userQuery.refetch();
      },
    }),
  );

  createUser() {
    this.createUserMutation.mutate({ name: 'New User' });
  }
}
```

#### Option B: Create Typed Injectors (Recommended)

For better ergonomics, create typed injection functions once and reuse them:

```typescript
// trpc.ts - Create this file once in your project
import { createTRPCInjectors } from '@trpc/tanstack-angular-query';
import type { AppRouter } from './server/router';

// Export typed injection functions for your application
export const { injectTRPC, injectTRPCClient } =
  createTRPCInjectors<AppRouter>();
```

Then use them in your components without specifying the router type:

```typescript
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
      @if (userQuery.isPending()) {
        <p>Loading...</p>
      } @else if (userQuery.isError()) {
        <p>Error: {{ userQuery.error()?.message }}</p>
      } @else {
        <ul>
          @for (user of userQuery.data(); track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }

      <button
        (click)="createUser()"
        [disabled]="createUserMutation.isPending()"
      >
        Create User
      </button>
    </div>
  `,
})
export class UserListComponent {
  private trpc = injectTRPC(); // No type annotation needed!

  userQuery = injectQuery(() => this.trpc.user.list.queryOptions());

  createUserMutation = injectMutation(() =>
    this.trpc.user.create.mutationOptions({
      onSuccess: () => {
        this.userQuery.refetch();
      },
    }),
  );

  createUser() {
    this.createUserMutation.mutate({ name: 'New User' });
  }
}
```

## Features

- **Type-safe**: Full type safety with TypeScript
- **Angular-native**: Uses Angular's dependency injection and signals
- **TanStack Query integration**: Leverages TanStack Query's powerful caching and synchronization
- **SSR compatible**: Works with Angular Universal
- **Suspense support**: Compatible with Angular's upcoming Suspense features

## Current Status

This package provides a complete Angular adapter for tRPC with TanStack Query integration. The implementation includes:

- ✅ Angular DI providers (`provideTRPC`, `injectTRPC`, `injectTRPCClient`)
- ✅ Query options proxy with type-safe procedure calls
- ✅ Support for queries, mutations, infinite queries, and subscriptions
- ✅ Angular-specific subscription handling with signals
- ✅ Type-safe key generation and filtering
- ✅ Complete TypeScript type definitions

## Limitations

- Depends on experimental `@tanstack/angular-query-experimental` package
- Some advanced features may require additional testing
- API may change as Angular Query moves out of experimental status

## Documentation

For detailed documentation and examples, visit:

- [TanStack Query Angular docs](https://tanstack.com/query/latest/docs/framework/angular/overview)

## Requirements

- Angular 16+
- TypeScript 5.7+
- @tanstack/angular-query-experimental 5.80.3+

## License

MIT
