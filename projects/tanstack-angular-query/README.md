# @heddendorp/tanstack-angular-query

TanStack Angular Query integration for tRPC that provides reactive data fetching capabilities with Angular-specific features.

## Installation

```bash
npm install @heddendorp/tanstack-angular-query
```

## Peer Dependencies

This package requires the following peer dependencies:

- `@angular/common >=16.0.0`
- `@angular/core >=16.0.0`
- `@tanstack/angular-query-experimental ^5.83.0`
- `@trpc/client 11.4.3`
- `@trpc/server 11.4.3`
- `rxjs >=7.0.0`
- `typescript >=5.7.2`

## Current Status

⚠️ **Note**: This package is currently experiencing build issues with TypeScript compatibility. 
The trpc-link-angular package is fully functional and can be used independently.

## Planned Features

Once the build issues are resolved, this package will provide:

### Query Management
- Reactive query hooks for Angular
- Automatic caching and background refetching
- Optimistic updates
- Error boundaries

### Angular Integration
- Angular signals integration
- Dependency injection support
- OnPush change detection compatibility
- Observable patterns

### tRPC Features
- Type-safe queries and mutations
- Infinite queries support
- Subscription handling
- Request deduplication

## Usage Example (Future)

```typescript
import { Component } from '@angular/core';
import { injectTRPCQuery, injectTRPCMutation } from '@heddendorp/tanstack-angular-query';
import type { AppRouter } from '../server/router';

@Component({
  selector: 'app-user-profile',
  template: `
    <div>
      @if (userQuery.isLoading()) {
        <div>Loading...</div>
      } @else if (userQuery.isError()) {
        <div>Error: {{ userQuery.error()?.message }}</div>
      } @else {
        <div>
          <h2>{{ userQuery.data()?.name }}</h2>
          <p>{{ userQuery.data()?.email }}</p>
        </div>
      }
    </div>
  `,
})
export class UserProfileComponent {
  userQuery = injectTRPCQuery<AppRouter>((trpc) => 
    trpc.user.get.query({ id: 1 })
  );
  
  updateUserMutation = injectTRPCMutation<AppRouter>((trpc) => 
    trpc.user.update.mutate
  );
}
```

## Development

### Building

To build the library:

```bash
ng build tanstack-angular-query
```

**Note**: Currently experiencing build issues that need to be resolved.

### Testing

To run tests:

```bash
ng test tanstack-angular-query
```

## Alternative: Use trpc-link-angular

While this package is being fixed, you can use `@heddendorp/trpc-link-angular` for tRPC integration:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';

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

## Contributing

We welcome contributions to help resolve the build issues and improve this package. 
Please see the [Maintenance Guide](../../MAINTENANCE_GUIDE.md) for development setup.

## Support

For issues related to this package, please:
1. Check the build errors in the CI logs
2. Review TypeScript compatibility requirements
3. Open an issue with reproduction steps

## Related Packages

- [@heddendorp/trpc-link-angular](../trpc-link-angular/) - Angular HttpClient integration (fully working)
- [Integration Guide](../../examples/integration-guide.md) - How to use both packages together
