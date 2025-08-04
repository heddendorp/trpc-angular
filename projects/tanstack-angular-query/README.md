# @trpc/tanstack-angular-query

> tRPC Angular Query integration for type-safe API calls with Angular

## Installation

```bash
npm install @trpc/client @trpc/server @tanstack/angular-query-experimental tanstack-angular-query
```

## Usage

### 1. Setup tRPC Client

First, create your tRPC client:

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server"; // Import your router type

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});
```

### 2. Setup Angular Query

In your `main.ts` or app config:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAngularQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { provideTRPC } from "tanstack-angular-query";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [
    provideAngularQuery(new QueryClient()),
    provideTRPC(trpc),
    // ... other providers
  ],
});
```

### 3. Use in Components

```typescript
import { Component, inject } from "@angular/core";
import { injectTRPC } from "tanstack-angular-query";
import { injectQuery } from "@tanstack/angular-query-experimental";

@Component({
  selector: "app-example",
  template: `
    <div>
      @if (query.isLoading()) {
        <p>Loading...</p>
      } @else if (query.error()) {
        <p>Error: {{ query.error()?.message }}</p>
      } @else {
        <p>{{ query.data()?.message }}</p>
      }
    </div>
  `,
})
export class ExampleComponent {
  private trpc = injectTRPC();

  query = injectQuery(this.trpc.hello.queryOptions({ text: "World" }));
}
```

### 4. Mutations

```typescript
import { Component, inject } from "@angular/core";
import { injectTRPC } from "tanstack-angular-query";
import { injectMutation } from "@tanstack/angular-query-experimental";

@Component({
  selector: "app-mutation-example",
  template: `
    <button (click)="mutation.mutate({ text: 'Hello' })" [disabled]="mutation.isPending()">
      {{ mutation.isPending() ? "Creating..." : "Create Post" }}
    </button>
  `,
})
export class MutationExampleComponent {
  private trpc = injectTRPC();

  mutation = injectMutation(this.trpc.createPost.mutationOptions());
}
```

### 5. Infinite Queries

```typescript
import { Component, inject } from "@angular/core";
import { injectTRPC } from "tanstack-angular-query";
import { injectInfiniteQuery } from "@tanstack/angular-query-experimental";

@Component({
  selector: "app-infinite-example",
  template: `
    <div>
      @for (page of infiniteQuery.data()?.pages; track page) {
        @for (item of page.items; track item.id) {
          <div>{{ item.title }}</div>
        }
      }
      <button (click)="infiniteQuery.fetchNextPage()" [disabled]="infiniteQuery.isFetchingNextPage()">Load More</button>
    </div>
  `,
})
export class InfiniteExampleComponent {
  private trpc = injectTRPC();

  infiniteQuery = injectInfiniteQuery(
    this.trpc.posts.infiniteQueryOptions({
      limit: 10,
      initialCursor: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );
}
```

### 6. Subscriptions

```typescript
import { Component, inject } from "@angular/core";
import { injectTRPC, injectTRPCSubscription } from "tanstack-angular-query";

@Component({
  selector: "app-subscription-example",
  template: `
    <div>
      @if (subscription.status === "connecting") {
        <p>Connecting...</p>
      } @else if (subscription.status === "error") {
        <p>Error: {{ subscription.error?.message }}</p>
      } @else if (subscription.data) {
        <p>{{ subscription.data }}</p>
      }
    </div>
  `,
})
export class SubscriptionExampleComponent {
  private trpc = injectTRPC();

  subscription = injectTRPCSubscription(this.trpc.messages.subscriptionOptions({ channel: "general" }));
}
```

## API Reference

### `provideTRPC(client, queryClient?)`

Sets up tRPC with Angular Query integration.

### `injectTRPC()`

Returns the tRPC proxy with query, mutation, and subscription options.

### `injectTRPCClient()`

Returns the raw tRPC client instance.

### `injectTRPCSubscription(subscriptionOptions)`

Hook for handling tRPC subscriptions with reactive state.

### `createTRPCInjectors<TRouter>()`

Creates typed injection functions for a specific router type.

## Features

- 🔧 **Type Safety**: Full TypeScript support with automatic type inference
- 📡 **Reactive**: Built on Angular signals for reactive state management
- 🔄 **Caching**: Leverages TanStack Query's powerful caching capabilities
- 🎯 **Optimistic Updates**: Support for optimistic updates and mutations
- 📊 **Infinite Queries**: Built-in support for infinite/paginated queries
- 🔌 **Subscriptions**: Real-time subscriptions with automatic cleanup
- 🎨 **Angular Native**: Designed specifically for Angular with proper DI integration

## License

MIT
