# tRPC Angular HttpClient Link

This directory contains the implementation of a tRPC link that uses Angular's HttpClient instead of the standard fetch API.

## Overview

The `angularHttpLink` allows tRPC clients to leverage Angular's HttpClient for making HTTP requests, providing access to Angular's powerful HTTP features like:

- HTTP interceptors
- Built-in error handling
- Dependency injection integration
- Observable-based API
- Request/response transformation

## Files

- `angularHttpLink.ts` - Main implementation of the Angular HttpClient link
- `angularHttpLink.test.ts` - Unit tests for the link
- `angularHttpLink.md` - Detailed documentation and usage examples
- `angularHttpLink.example.ts` - Complete Angular component example

## Quick Start

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient, angularHttpLink } from '@trpc/client';

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

✅ **Full Angular HttpClient Integration** - Uses Angular's HttpClient for all HTTP requests
✅ **HTTP Interceptors Support** - Works with Angular's HTTP interceptors
✅ **Error Handling** - Proper error handling with Angular's HttpErrorResponse
✅ **Headers Support** - Static and dynamic headers
✅ **Method Override** - Support for POST-only endpoints
✅ **Request Cancellation** - AbortSignal support for request cancellation
✅ **TypeScript Support** - Full type safety
✅ **Observable Integration** - Seamless integration with Angular's Observable pattern

## Limitations

❌ **Subscriptions** - Use `wsLink` or `httpSubscriptionLink` for subscriptions
❌ **Binary Data** - Currently only supports JSON responses
❌ **Batching** - No request batching support (use `httpBatchLink` if needed)

## Migration from httpLink

Replace `httpLink` with `angularHttpLink` and add the `httpClient` parameter:

```typescript
// Before
httpLink({
  url: 'http://localhost:3000/trpc',
  headers: {
    /* ... */
  },
});

// After
angularHttpLink({
  url: 'http://localhost:3000/trpc',
  httpClient: this.httpClient,
  headers: {
    /* ... */
  },
});
```

## Testing

The link includes comprehensive unit tests that mock Angular's HttpClient. Run tests using:

```bash
# Run all tests
pnpm test

# Run specific link tests
pnpm test angularHttpLink
```

## Contributing

When contributing to this link implementation:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation
4. Ensure compatibility with Angular's HttpClient API
5. Consider backward compatibility

## License

This implementation is part of the tRPC project and follows the same MIT license.
