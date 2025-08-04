# Factory Pattern Integration Guide

This guide shows how to use the factory pattern with `provideTRPC` to enable dependency injection when creating the tRPC client.

## Problem

When using the Angular HTTP client with tRPC, you need to inject `HttpClient` to create the client. However, the original `provideTRPC` function expected a pre-created client, making it impossible to use dependency injection.

## Solution

The new factory pattern allows you to create the tRPC client using dependency injection by wrapping your client creation in a factory function.

## Basic Usage

### Before (Old Way)

```typescript
// This doesn't work with angularHttpLink because you can't inject HttpClient
const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: ???, // Can't inject HttpClient here
    }),
  ],
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideTRPC(client), // Pre-created client
  ],
};
```

### After (New Way)

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideTanStackQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { provideTRPC, createTRPCClientFactory } from "@heddendorp/tanstack-angular-query";
import { createTRPCClient } from "@trpc/client";
import { angularHttpLink } from "@heddendorp/trpc-link-angular";
import { inject } from "@angular/core";
import type { AppRouter } from "./server/router";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTanStackQuery(new QueryClient()),
    provideTRPC(
      createTRPCClientFactory(() => {
        const httpClient = inject(HttpClient);
        return createTRPCClient<AppRouter>({
          links: [
            angularHttpLink({
              url: "http://localhost:3000/trpc",
              httpClient,
            }),
          ],
        });
      }),
    ),
  ],
};
```

## Advanced Examples

### With Authentication Headers

```typescript
provideTRPC(
  createTRPCClientFactory(() => {
    const httpClient = inject(HttpClient);
    return createTRPCClient<AppRouter>({
      links: [
        angularHttpLink({
          url: "http://localhost:3000/trpc",
          httpClient,
          headers: () => ({
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          }),
        }),
      ],
    });
  }),
);
```

### With Custom Services

```typescript
// auth.service.ts
@Injectable({
  providedIn: "root",
})
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem("token");
  }
}

// app.config.ts
provideTRPC(
  createTRPCClientFactory(() => {
    const httpClient = inject(HttpClient);
    const authService = inject(AuthService);

    return createTRPCClient<AppRouter>({
      links: [
        angularHttpLink({
          url: "http://localhost:3000/trpc",
          httpClient,
          headers: () => {
            const token = authService.getToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    });
  }),
);
```

### With Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/trpc",
};

// app.config.ts
provideTRPC(
  createTRPCClientFactory(() => {
    const httpClient = inject(HttpClient);

    return createTRPCClient<AppRouter>({
      links: [
        angularHttpLink({
          url: environment.apiUrl,
          httpClient,
        }),
      ],
    });
  }),
);
```

## Component Usage

Once configured, components can use the tRPC client as before:

```typescript
// user-profile.component.ts
import { Component } from "@angular/core";
import { injectTRPC } from "@heddendorp/tanstack-angular-query";
import { injectQuery } from "@tanstack/angular-query-experimental";
import type { AppRouter } from "../server/router";

@Component({
  selector: "app-user-profile",
  template: `
    <div class="user-profile">
      @if (userQuery.isLoading()) {
        <div class="loading">Loading user...</div>
      } @else if (userQuery.isError()) {
        <div class="error">Error: {{ userQuery.error()?.message }}</div>
      } @else {
        <div class="user-info">
          <h2>{{ userQuery.data()?.name }}</h2>
          <p>{{ userQuery.data()?.email }}</p>
        </div>
      }
    </div>
  `,
})
export class UserProfileComponent {
  private trpc = injectTRPC<AppRouter>();

  userQuery = injectQuery(() => this.trpc.user.get.queryOptions({ id: 1 }));
}
```

## Backward Compatibility

The old approach still works for pre-created clients:

```typescript
// Create client without DI
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Use directly
provideTRPC(client);
```

## Key Benefits

1. **Dependency Injection**: Full access to Angular's DI system when creating the client
2. **Type Safety**: Complete TypeScript support with proper type inference
3. **Flexibility**: Can inject any Angular service or configuration
4. **Backward Compatible**: Existing code continues to work
5. **Angular Integration**: Works seamlessly with HTTP interceptors and Angular patterns

## Testing

The factory pattern is also great for testing:

```typescript
// test.spec.ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideTanStackQuery(new QueryClient()),
      provideTRPC(
        createTRPCClientFactory(() => {
          const httpClient = inject(HttpClient);
          return createTRPCClient<AppRouter>({
            links: [
              angularHttpLink({
                url: "http://localhost:3000/trpc",
                httpClient,
              }),
            ],
          });
        }),
      ),
    ],
  });
});
```

This approach allows you to mock the `HttpClient` and other dependencies easily in your tests.
