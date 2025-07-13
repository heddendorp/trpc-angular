# @heddendorp/trpc-link-angular

Angular HttpClient link for tRPC client that provides seamless integration with Angular's HTTP services.

## Installation

```bash
npm install @heddendorp/trpc-link-angular
```

## Peer Dependencies

This package requires the following peer dependencies:

- `@angular/common >=16.0.0`
- `@angular/core >=16.0.0`
- `@trpc/client 11.4.3`
- `@trpc/server 11.4.3`
- `rxjs >=7.0.0`
- `typescript >=5.7.2`

## Usage

### Basic Usage

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcService {
  private httpClient = inject(HttpClient);
  
  client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
      }),
    ],
  });
}
```

### With Authentication

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcWithAuthService {
  private httpClient = inject(HttpClient);
  
  client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
        headers: () => ({
          authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
      }),
    ],
  });
}
```

### Error Handling

```typescript
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcWithErrorHandlingService {
  private httpClient = inject(HttpClient);
  
  client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
        onError: (error: HttpErrorResponse) => {
          console.error('tRPC Error:', error);
          // Handle error globally
        },
      }),
    ],
  });
}
```

## API Reference

### angularHttpLink(options)

Creates a tRPC link that uses Angular's HttpClient for HTTP requests.

#### Options

- `url: string` - The tRPC server URL
- `httpClient: HttpClient` - Angular HttpClient instance
- `headers?: () => Record<string, string>` - Function that returns headers
- `onError?: (error: HttpErrorResponse) => void` - Error handler function

## Features

- **Angular HttpClient Integration**: Uses Angular's HttpClient for all HTTP requests
- **HTTP Interceptors Support**: Automatically works with Angular HTTP interceptors
- **Error Handling**: Proper error handling with HttpErrorResponse
- **TypeScript Support**: Full TypeScript support with type inference
- **Observable Integration**: Seamless integration with Angular's Observable patterns

## Migration from httpLink

If you're migrating from the standard tRPC httpLink:

```typescript
// Before
import { httpLink } from '@trpc/client';

const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// After
import { angularHttpLink } from '@heddendorp/trpc-link-angular';

const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
    }),
  ],
});
```

## Development

### Building

To build the library:

```bash
ng build trpc-link-angular
```

### Testing

To run tests:

```bash
ng test trpc-link-angular
```

## Contributing

Please see the [Maintenance Guide](../../MAINTENANCE_GUIDE.md) for information on contributing to this project.
