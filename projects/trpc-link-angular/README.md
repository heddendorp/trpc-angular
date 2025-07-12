# @heddendorp/trpc-link-angular

[![npm version](https://badge.fury.io/js/@heddendorp/trpc-link-angular.svg)](https://badge.fury.io/js/@heddendorp/trpc-link-angular)

A fully functional Angular HttpClient link for tRPC client that allows seamless integration between tRPC and Angular applications.

## Features

- ✅ Angular HttpClient integration
- ✅ Full HTTP method support (GET, POST, PATCH)
- ✅ Headers and error handling
- ✅ AbortSignal support
- ✅ TypeScript strict mode
- ✅ Angular 20 compatibility

## Installation

```bash
npm install @heddendorp/trpc-link-angular
# or
yarn add @heddendorp/trpc-link-angular
```

## Usage

### Basic Setup

```typescript
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';

// In your component or service
constructor(private httpClient: HttpClient) {}

const trpcClient = createTRPCClient({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
    }),
  ],
});
```

### Advanced Configuration

```typescript
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const trpcClient = createTRPCClient({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
      headers: new HttpHeaders({
        'Authorization': 'Bearer your-token',
        'Custom-Header': 'value',
      }),
      // Or use a function for dynamic headers
      headers: ({ op }) => {
        return new HttpHeaders({
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        });
      },
    }),
  ],
});
```

### With Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from './server/router'; // Your tRPC router type

@Injectable({
  providedIn: 'root',
})
export class TRPCService {
  private trpcClient;

  constructor(private httpClient: HttpClient) {
    this.trpcClient = createTRPCClient<AppRouter>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000/trpc',
          httpClient: this.httpClient,
        }),
      ],
    });
  }

  get client() {
    return this.trpcClient;
  }
}
```

## API Reference

### `angularHttpLink(options)`

Creates an Angular HttpClient link for tRPC.

#### Options

- `url` (string | URL): The URL of your tRPC server
- `httpClient` (HttpClient): Angular's HttpClient instance
- `headers` (optional): Static headers or a function returning headers
- `methodOverride` (optional): Force all requests to use POST method

#### Headers Function

When using a function for headers, you receive an object with:
- `op`: The tRPC operation being performed

```typescript
headers: ({ op }) => {
  console.log('Operation:', op.type, op.path);
  return new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`,
  });
}
```

## Error Handling

The link automatically handles HTTP errors and converts them to tRPC errors:

- 400: BAD_REQUEST
- 401: UNAUTHORIZED
- 403: FORBIDDEN
- 404: NOT_FOUND
- 500: INTERNAL_SERVER_ERROR
- Others: UNKNOWN_ERROR

## Peer Dependencies

This library requires the following peer dependencies:

- `@angular/common` ^20.0.0
- `@angular/core` ^20.0.0
- `@trpc/client` ^11.4.3
- `@trpc/server` ^11.4.3
- `rxjs` ^7.0.0

## Development

### Building

To build the library, run:

```bash
ng build trpc-link-angular
```

### Running Tests

To execute unit tests with Karma:

```bash
ng test trpc-link-angular
```

## Migration from Previous Versions

This library was migrated from a tsdown-based build system to Angular CLI 20. The API remains the same, but the build artifacts are now generated using Angular's ng-packagr.

## License

MIT

## Support

- [GitHub Issues](https://github.com/heddendorp/trpc-angular/issues)
- [Documentation](https://github.com/heddendorp/trpc-angular#readme)
