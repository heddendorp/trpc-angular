# @trpc/angular-http-client

Angular HttpClient link for tRPC client that provides seamless integration with Angular's HTTP services.

## Installation

```bash
npm install @trpc/angular-http-client
```

## Peer Dependencies

This package requires the following peer dependencies:

- `@angular/common ^16.0.0`
- `@angular/core ^16.0.0`
- `@trpc/client ^11.4.3`
- `@trpc/server ^11.4.3`
- `rxjs ^7.0.0`
- `typescript ^5.7.2`

## Usage

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@trpc/angular-http-client';
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

  get trpc() {
    return this.client;
  }
}
```

## Features

- **Full Angular HttpClient Integration** - Uses Angular's HttpClient for all HTTP requests
- **HTTP Interceptors Support** - Works seamlessly with Angular's HTTP interceptors
- **Error Handling** - Proper error handling with Angular's HttpErrorResponse
- **Headers Support** - Static and dynamic headers with full type safety
- **Method Override** - Support for POST-only endpoints
- **Request Cancellation** - AbortSignal support for request cancellation
- **TypeScript Support** - Full type safety and Angular integration

## Advanced Usage

### With Custom Headers

```typescript
angularHttpLink({
  url: 'http://localhost:3000/trpc',
  httpClient: this.httpClient,
  headers: {
    Authorization: 'Bearer your-token',
    'X-Custom-Header': 'custom-value',
  },
});
```

### With Dynamic Headers

```typescript
angularHttpLink({
  url: 'http://localhost:3000/trpc',
  httpClient: this.httpClient,
  headers: ({ op }) => ({
    Authorization: `Bearer ${this.getAuthToken()}`,
    'X-Operation-Type': op.type,
  }),
});
```

### With Angular HTTP Interceptors

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
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
}
```

## Benefits

1. **Angular Integration** - Works natively with Angular's dependency injection and HTTP services
2. **Interceptors** - Leverage Angular's HTTP interceptors for cross-cutting concerns
3. **Error Handling** - Consistent error handling with Angular's HttpErrorResponse
4. **Observable Integration** - Seamless integration with Angular's Observable pattern
5. **Type Safety** - Full TypeScript support with Angular's HttpClient types

## Migration from httpLink

Replace `httpLink` with `angularHttpLink` and add the `httpClient` parameter:

```typescript
// Before
import { httpLink } from '@trpc/client';

httpLink({
  url: 'http://localhost:3000/trpc',
  headers: {
    /* ... */
  },
});

// After
import { angularHttpLink } from '@trpc/angular-http-client';

angularHttpLink({
  url: 'http://localhost:3000/trpc',
  httpClient: this.httpClient,
  headers: {
    /* ... */
  },
});
```

## Limitations

- Subscriptions are not supported (use `wsLink` or `httpSubscriptionLink` instead)
- Currently only supports JSON responses
- No request batching support (use `httpBatchLink` if needed)

## License

MIT
