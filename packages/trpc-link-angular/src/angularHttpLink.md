# Angular HttpClient Link for tRPC

This is a tRPC link implementation that uses Angular's HttpClient instead of the standard fetch API. This is useful for Angular applications that want to leverage Angular's HttpClient features such as interceptors, error handling, and dependency injection.

## Features

- Full integration with Angular's HttpClient
- Support for HTTP interceptors
- Proper error handling with Angular's HttpErrorResponse
- Support for AbortSignal for request cancellation
- Custom headers support (static and dynamic)
- Method override support for POST-only endpoints
- TypeScript type safety

## Installation

This link is part of the tRPC client package. Make sure you have Angular's HttpClient available in your project.

## Usage

### Basic Usage

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient, angularHttpLink } from '@trpc/client';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root',
})
export class TrpcService {
  private httpClient = inject(HttpClient);

  private client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
      }),
    ],
  });

  // Expose tRPC client methods
  get trpc() {
    return this.client;
  }
}
```

### With Custom Headers

```typescript
const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
      headers: {
        Authorization: 'Bearer your-token',
        'X-Custom-Header': 'custom-value',
      },
    }),
  ],
});
```

### With Dynamic Headers

```typescript
const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
      headers: ({ op }) => {
        // Return headers based on the operation
        return {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'X-Operation-Type': op.type,
        };
      },
    }),
  ],
});
```

### With Method Override

```typescript
const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
      methodOverride: 'POST', // Send all requests as POST
    }),
  ],
});
```

### With Data Transformers

```typescript
import superjson from 'superjson';

const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
      transformer: superjson,
    }),
  ],
});
```

### Using with Angular Interceptors

The Angular HttpClient link works seamlessly with Angular's HTTP interceptors:

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Add auth token to all tRPC requests
    if (req.url.includes('/trpc')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }

  private getToken(): string {
    // Get token from your auth service
    return localStorage.getItem('auth-token') || '';
  }
}
```

## API Reference

### `angularHttpLink(options)`

Creates a new Angular HttpClient link.

#### Options

- `url: string` - The base URL for your tRPC server
- `httpClient: HttpClient` - Angular's HttpClient instance
- `headers?: HTTPHeaders | ((opts: { op: Operation }) => HTTPHeaders | Promise<HTTPHeaders>)` - Custom headers to include with requests
- `methodOverride?: 'POST'` - Override HTTP method for all requests
- `transformer?: DataTransformerOptions` - Data transformer for serialization/deserialization

#### Returns

A tRPC link function that can be used with `createTRPCClient`.

## Error Handling

The link properly handles Angular's HttpErrorResponse and converts them to tRPC client errors:

```typescript
try {
  const result = await client.myProcedure.query();
} catch (error) {
  if (error.data?.httpStatus) {
    // Handle HTTP-specific errors
    console.log('HTTP Status:', error.data.httpStatus);
  }
}
```

## Request Cancellation

The link supports request cancellation using AbortSignal:

```typescript
const controller = new AbortController();

// Cancel the request after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const result = await client.myProcedure.query(
    { input: 'data' },
    { signal: controller.signal },
  );
} catch (error) {
  if (error.message === 'Request aborted') {
    console.log('Request was cancelled');
  }
}
```

## Limitations

- Subscriptions are not supported (use `wsLink` or `httpSubscriptionLink` instead)
- Requires Angular's HttpClient to be available
- Only supports JSON responses (no binary data support yet)

## Migration from httpLink

If you're migrating from the standard `httpLink`, the main changes are:

1. Add the `httpClient` parameter
2. Remove any `fetch` parameter (not needed)
3. The API is otherwise compatible

```typescript
// Before (httpLink)
httpLink({
  url: 'http://localhost:3000/trpc',
  headers: {
    /* ... */
  },
});

// After (angularHttpLink)
angularHttpLink({
  url: 'http://localhost:3000/trpc',
  httpClient: this.httpClient,
  headers: {
    /* ... */
  },
});
```
