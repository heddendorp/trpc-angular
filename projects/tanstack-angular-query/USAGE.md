# Query Options Usage Guide

This guide explains the proper usage patterns for `queryOptions` with `injectQuery` in the tRPC Angular integration.

## Recommended Usage Pattern

The recommended approach is to use the **functional pattern** with `injectQuery`:

```typescript
import { Component } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectTRPC } from '@heddendorp/tanstack-angular-query';
import { AppRouter } from './app-router';

@Component({
  selector: 'app-example',
  template: `
    <div>
      @if (rolesQuery.isLoading()) {
        <p>Loading...</p>
      } @else if (rolesQuery.error()) {
        <p>Error: {{ rolesQuery.error()?.message }}</p>
      } @else {
        <div>
          @for (role of rolesQuery.data() || []; track role.id) {
            <p>{{ role.name }}</p>
          }
        </div>
      }
    </div>
  `
})
export class ExampleComponent {
  private readonly trpc = injectTRPC<AppRouter>();
  
  // ✅ RECOMMENDED: Use functional pattern
  rolesQuery = injectQuery(() => this.trpc.admin.roles.findMany.queryOptions({}));
}
```

## Alternative Pattern (Legacy Support)

For backward compatibility, the direct pattern is also supported but may cause issues in some environments:

```typescript
export class ExampleComponent {
  private readonly trpc = injectTRPC<AppRouter>();
  
  // ⚠️ LEGACY: Direct usage (may cause TypeScript issues)
  rolesQuery = injectQuery(this.trpc.admin.roles.findMany.queryOptions({}));
}
```

## Why Use the Functional Pattern?

1. **Better TypeScript Support**: The functional pattern aligns with TanStack Angular Query's design expectations
2. **Reactive Updates**: The function is re-executed when dependencies change
3. **Future-Proof**: Ensures compatibility with future versions of TanStack Angular Query
4. **Consistent with Documentation**: Matches the official TanStack Angular Query documentation

## Migration Guide

If you're experiencing issues with the direct pattern, migrate to the functional pattern:

### Before (Direct Pattern)
```typescript
// This may cause @typeerror_options_fn.js or similar errors
rolesQuery = injectQuery(this.trpc.admin.roles.findMany.queryOptions({}));
```

### After (Functional Pattern)
```typescript
// This is the recommended approach
rolesQuery = injectQuery(() => this.trpc.admin.roles.findMany.queryOptions({}));
```

## Advanced Usage with Reactive Dependencies

The functional pattern enables reactive dependencies:

```typescript
import { signal } from '@angular/core';

export class ExampleComponent {
  private readonly trpc = injectTRPC<AppRouter>();
  
  // Signal for reactive filtering
  searchTerm = signal('');
  
  // Query automatically updates when searchTerm changes
  rolesQuery = injectQuery(() => 
    this.trpc.admin.roles.findMany.queryOptions({
      name: this.searchTerm()
    })
  );
  
  updateSearch(term: string) {
    this.searchTerm.set(term);
    // Query will automatically re-execute
  }
}
```

## Troubleshooting

### Error: @typeerror_options_fn.js

This error typically occurs when using the direct pattern. Solution:

1. Switch to the functional pattern
2. Ensure you're using the latest version of `@heddendorp/tanstack-angular-query`
3. Check that your TypeScript configuration is up to date

### TypeScript Compilation Errors

If you encounter TypeScript errors related to query options:

1. Use the functional pattern with `injectQuery(() => ...)`
2. Ensure proper type inference with explicit router types
3. Check that all dependencies are properly installed

## Examples

### Basic Query
```typescript
basicQuery = injectQuery(() => this.trpc.users.getAll.queryOptions());
```

### Query with Input
```typescript
userQuery = injectQuery(() => this.trpc.users.getById.queryOptions({ id: 1 }));
```

### Query with Options
```typescript
userQuery = injectQuery(() => this.trpc.users.getById.queryOptions(
  { id: 1 },
  { 
    enabled: this.userId() !== null,
    staleTime: 5000
  }
));
```

### Reactive Query
```typescript
userId = signal<number | null>(null);

userQuery = injectQuery(() => this.trpc.users.getById.queryOptions(
  { id: this.userId()! },
  { 
    enabled: this.userId() !== null 
  }
));
```