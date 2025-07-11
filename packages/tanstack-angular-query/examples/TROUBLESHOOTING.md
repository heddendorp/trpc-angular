# TRPCClient Type Issue Troubleshooting

## Problem

When creating a tRPC client with `createTRPCClient({ links: [httpBatchLink({ url: '/trpc' })] })`, you might encounter a TypeScript error:

```
TS2345: Argument of type TRPCClient<...> is not assignable to parameter of type TRPCClient
Property [untypedClientSymbol] is missing in type TRPCClient<...> but required in type {[untypedClientSymbol]: TRPCUntypedClient;}
```

## Solution

The error occurs because the `TRPCClient` type needs to be properly typed with your router type. Here's the correct way to set it up:

### 1. Define your router type

```typescript
// Define your router first
const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello ${input.name}!`),
  // ... other procedures
});

export type AppRouter = typeof appRouter;
```

### 2. Create the client with proper typing

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router'; // Your router type

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});
```

### 3. Use with Angular DI

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@trpc/tanstack-angular-query';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTanStackQuery(new QueryClient()),
    provideTRPC(trpcClient), // trpcClient is properly typed
  ],
};
```

### 4. Use in components

```typescript
import { Component } from '@angular/core';
import { injectTRPC } from '@trpc/tanstack-angular-query';
import { injectQuery } from '@tanstack/angular-query-experimental';
import type { AppRouter } from './server/router';

@Component({
  selector: 'app-example',
  template: `
    <div>
      @if (greeting.isPending()) {
        <p>Loading...</p>
      } @else if (greeting.isError()) {
        <p>Error: {{ greeting.error()?.message }}</p>
      } @else {
        <p>{{ greeting.data() }}</p>
      }
    </div>
  `,
})
export class ExampleComponent {
  private trpc = injectTRPC<AppRouter>();

  greeting = injectQuery(() =>
    this.trpc.greeting.queryOptions({ name: 'World' }),
  );
}
```

## Key Points

1. **Always type your client**: Use `createTRPCClient<AppRouter>()` instead of just `createTRPCClient()`
2. **Export your router type**: Make sure your `AppRouter` type is exported from your server
3. **Use proper imports**: Import `createTRPCClient` from `@trpc/client`, not from other packages
4. **Type your injection functions**: Use `injectTRPC<AppRouter>()` for better type safety

## Common Mistakes

- ❌ `createTRPCClient({ links: [...] })` - Missing type parameter
- ❌ `injectTRPC()` - Missing type parameter
- ❌ Importing from wrong package
- ✅ `createTRPCClient<AppRouter>({ links: [...] })` - Correct!
- ✅ `injectTRPC<AppRouter>()` - Correct!
