# Integration Example: Using Angular HTTP Client with TanStack Angular Query

This example demonstrates how to use both `@heddendorp/trpc-link-angular` and `@heddendorp/tanstack-angular-query` together for a complete Angular-native tRPC solution.

## Benefits of Integration

- **Angular HttpClient**: HTTP interceptors, error handling, and Observable patterns
- **TanStack Angular Query**: Powerful caching, background refetching, and state management
- **Type Safety**: Full TypeScript support with type inference
- **Reactive**: Seamless integration with Angular's reactive patterns

## Setup

### 1. Install Dependencies

```bash
yarn add @heddendorp/trpc-link-angular @heddendorp/tanstack-angular-query
yarn add @tanstack/angular-query-experimental @trpc/client @trpc/server
```

### 2. Create tRPC Client

```typescript
// trpc-client.ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';

export function createAngularTRPCClient() {
  const httpClient = inject(HttpClient);
  
  return createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        headers: () => ({
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        }),
      }),
    ],
  });
}
```

### 3. Application Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@heddendorp/tanstack-angular-query';
import { createAngularTRPCClient } from './trpc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTanStackQuery(new QueryClient()),
    provideTRPC(createAngularTRPCClient()),
  ],
};
```

### 4. Component Usage

```typescript
// user-profile.component.ts
import { Component, inject } from '@angular/core';
import { injectTRPCQuery } from '@heddendorp/tanstack-angular-query';
import type { AppRouter } from '../server/router';

@Component({
  selector: 'app-user-profile',
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
  userQuery = injectTRPCQuery<AppRouter>((trpc) => 
    trpc.user.get.queryOptions({ id: 1 })
  );
}
```

### 5. Mutations with Error Handling

```typescript
// user-form.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { injectTRPCMutation } from '@heddendorp/tanstack-angular-query';
import type { AppRouter } from '../server/router';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name" />
      <input formControlName="email" placeholder="Email" />
      <button type="submit" [disabled]="updateUserMutation.isPending()">
        @if (updateUserMutation.isPending()) {
          Updating...
        } @else {
          Update User
        }
      </button>
    </form>
    
    @if (updateUserMutation.isError()) {
      <div class="error">
        Error: {{ updateUserMutation.error()?.message }}
      </div>
    }
    
    @if (updateUserMutation.isSuccess()) {
      <div class="success">User updated successfully!</div>
    }
  `,
  imports: [ReactiveFormsModule],
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    name: [''],
    email: [''],
  });
  
  updateUserMutation = injectTRPCMutation<AppRouter>((trpc) => 
    trpc.user.update.mutationOptions()
  );
  
  onSubmit() {
    if (this.form.valid) {
      this.updateUserMutation.mutate({
        id: 1,
        ...this.form.value,
      });
    }
  }
}
```

### 6. Advanced Usage with Infinite Queries

```typescript
// posts-list.component.ts
import { Component } from '@angular/core';
import { injectTRPCInfiniteQuery } from '@heddendorp/tanstack-angular-query';
import type { AppRouter } from '../server/router';

@Component({
  selector: 'app-posts-list',
  template: `
    <div class="posts-container">
      @for (group of postsQuery.data(); track group) {
        @for (post of group.posts; track post.id) {
          <div class="post">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
          </div>
        }
      }
      
      @if (postsQuery.hasNextPage()) {
        <button 
          (click)="loadMore()" 
          [disabled]="postsQuery.isFetchingNextPage()"
        >
          @if (postsQuery.isFetchingNextPage()) {
            Loading more...
          } @else {
            Load More
          }
        </button>
      }
    </div>
  `,
})
export class PostsListComponent {
  postsQuery = injectTRPCInfiniteQuery<AppRouter>((trpc) => 
    trpc.posts.list.infiniteQueryOptions(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );
  
  loadMore() {
    this.postsQuery.fetchNextPage();
  }
}
```

## Key Features

### HTTP Interceptors Support

The Angular HttpClient integration automatically supports HTTP interceptors:

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  return next(req);
};
```

### Error Handling

Global error handling with Angular's error interceptor:

```typescript
// error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle unauthorized
        notificationService.showError('Authentication required');
      } else if (error.status >= 500) {
        // Handle server errors
        notificationService.showError('Server error occurred');
      }
      
      return throwError(() => error);
    })
  );
};
```

### Performance Optimization

```typescript
// optimized-query.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectTRPCQuery } from '@heddendorp/tanstack-angular-query';

@Component({
  selector: 'app-optimized-query',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      @if (dataQuery.data(); as data) {
        <pre>{{ data | json }}</pre>
      }
    </div>
  `,
})
export class OptimizedQueryComponent {
  dataQuery = injectTRPCQuery<AppRouter>((trpc) => 
    trpc.data.get.queryOptions(
      { id: 1 },
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
      }
    )
  );
}
```

## Best Practices

1. **Use OnPush Change Detection**: For optimal performance with reactive queries
2. **Configure Stale Time**: Set appropriate stale times based on your data requirements
3. **Handle Loading States**: Always provide loading and error states in your templates
4. **Type Safety**: Leverage TypeScript for full type safety across your application
5. **Error Boundaries**: Implement proper error handling at the component level

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your tRPC server is configured to accept requests from your Angular app
2. **Type Errors**: Make sure your AppRouter type is properly exported from your server
3. **Memory Leaks**: Use `OnPush` change detection and proper cleanup in components

### Performance Tips

1. Use `staleTime` to reduce unnecessary refetches
2. Implement proper loading states to improve user experience
3. Use infinite queries for paginated data
4. Consider using `select` to subscribe to specific parts of your data

## Next Steps

- [Standalone tRPC Link Angular Example](./trpc-link-angular-standalone.md)
- [TanStack Angular Query Examples](./tanstack-angular-query-examples.md)
- [Advanced Configuration](./advanced-configuration.md)