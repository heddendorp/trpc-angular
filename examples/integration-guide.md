# Integration Example: Using Angular HTTP Client with TanStack Angular Query

This example demonstrates how to use both `@heddendorp/angular-http-client` and `@heddendorp/tanstack-angular-query` together for a complete Angular-native tRPC solution.

## Benefits of Integration

- **Angular HTTP Client Integration**: Leverage Angular's HTTP interceptors, error handling, and observables
- **TanStack Query Power**: Get caching, background updates, and optimistic updates
- **Full Type Safety**: Complete TypeScript support throughout the stack
- **Angular Native**: Works seamlessly with Angular's DI system and signals

## Setup

### 1. Install Dependencies

```bash
yarn add @heddendorp/angular-http-client @heddendorp/tanstack-angular-query
yarn add @tanstack/angular-query-experimental @trpc/client @trpc/server
```

### 2. Create Typed tRPC Client

```typescript
// lib/trpc-client.ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/angular-http-client';
import type { AppRouter } from '../server/router';

export function createAngularTRPCClient() {
  const httpClient = inject(HttpClient);
  
  return createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: '/trpc',
        httpClient,
        headers: () => ({
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }),
      }),
    ],
  });
}
```

### 3. Create Typed Injectors

```typescript
// lib/trpc.ts
import { createTRPCInjectors } from '@heddendorp/tanstack-angular-query';
import type { AppRouter } from '../server/router';

export const { injectTRPC, injectTRPCClient } = createTRPCInjectors<AppRouter>();
```

### 4. Application Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@heddendorp/tanstack-angular-query';
import { createAngularTRPCClient } from './lib/trpc-client';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      // Your routes here
    ]),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
      ])
    ),
    
    // TanStack Query with custom configuration
    provideTanStackQuery(new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          cacheTime: 10 * 60 * 1000, // 10 minutes
          retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error.data?.httpStatus >= 400 && error.data?.httpStatus < 500) {
              return false;
            }
            return failureCount < 3;
          },
        },
        mutations: {
          onError: (error) => {
            console.error('Mutation error:', error);
          },
        },
      },
    })),
    
    // tRPC provider with Angular HTTP Client
    provideTRPC(createAngularTRPCClient()),
  ],
};
```

### 5. HTTP Interceptors

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/trpc')) {
    const token = localStorage.getItem('token');
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    }
  }
  return next(req);
};
```

```typescript
// interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('token');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Handle forbidden
        router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    })
  );
};
```

### 6. Component Usage

```typescript
// components/user-management.component.ts
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { injectQuery, injectMutation, injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { injectTRPC } from '../lib/trpc';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>User Management</h2>
      
      <!-- User List -->
      <div class="user-list">
        <h3>Users</h3>
        
        @if (userQuery.isPending()) {
          <div class="loading">Loading users...</div>
        } @else if (userQuery.isError()) {
          <div class="error">
            Error loading users: {{ userQuery.error()?.message }}
            <button (click)="userQuery.refetch()">Retry</button>
          </div>
        } @else {
          <div class="users">
            @for (user of userQuery.data(); track user.id) {
              <div class="user-card">
                <h4>{{ user.name }}</h4>
                <p>{{ user.email }}</p>
                <button 
                  (click)="deleteUser(user.id)"
                  [disabled]="deleteUserMutation.isPending()"
                  class="delete-btn"
                >
                  @if (deleteUserMutation.isPending()) {
                    Deleting...
                  } @else {
                    Delete
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>
      
      <!-- Create User Form -->
      <div class="create-user">
        <h3>Create New User</h3>
        <form (ngSubmit)="createUser()">
          <div class="form-group">
            <label for="name">Name:</label>
            <input 
              id="name"
              type="text" 
              [(ngModel)]="newUser.name" 
              name="name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              id="email"
              type="email" 
              [(ngModel)]="newUser.email" 
              name="email"
              required
            />
          </div>
          
          <button 
            type="submit" 
            [disabled]="createUserMutation.isPending() || !isFormValid()"
          >
            @if (createUserMutation.isPending()) {
              Creating...
            } @else {
              Create User
            }
          </button>
        </form>
        
        @if (createUserMutation.isError()) {
          <div class="error">
            Error: {{ createUserMutation.error()?.message }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .user-list, .create-user {
      margin-bottom: 30px;
    }
    
    .user-card {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    
    .loading, .error {
      padding: 10px;
      border-radius: 5px;
    }
    
    .loading {
      background-color: #f0f0f0;
      color: #666;
    }
    
    .error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .delete-btn {
      background-color: #dc3545;
    }
    
    .delete-btn:hover:not(:disabled) {
      background-color: #c82333;
    }
  `]
})
export class UserManagementComponent {
  private trpc = injectTRPC();
  
  // Form state
  newUser = signal({
    name: '',
    email: ''
  });
  
  // Computed property for form validation
  isFormValid = computed(() => {
    const user = this.newUser();
    return user.name.trim().length > 0 && user.email.trim().length > 0;
  });
  
  // Queries
  userQuery = injectQuery(() => 
    this.trpc.user.list.queryOptions()
  );
  
  // Mutations
  createUserMutation = injectMutation(() => 
    this.trpc.user.create.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch user list
        this.userQuery.refetch();
        // Reset form
        this.newUser.set({ name: '', email: '' });
      },
    })
  );
  
  deleteUserMutation = injectMutation(() => 
    this.trpc.user.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch user list
        this.userQuery.refetch();
      },
    })
  );
  
  createUser() {
    if (this.isFormValid()) {
      this.createUserMutation.mutate(this.newUser());
    }
  }
  
  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.deleteUserMutation.mutate({ id: userId });
    }
  }
}
```

## Key Features Demonstrated

1. **Angular HTTP Client Integration**: All tRPC requests go through Angular's HTTP client
2. **HTTP Interceptors**: Authentication and error handling interceptors work seamlessly
3. **Type Safety**: Full TypeScript support with automatic type inference
4. **TanStack Query Features**: 
   - Caching and background updates
   - Optimistic updates
   - Error handling and retries
5. **Angular Signals**: Modern reactive programming with signals
6. **Form Handling**: Reactive forms with validation

## Advanced Usage

### Custom Query Options

```typescript
// Custom query with specific options
userDetailQuery = injectQuery(() => 
  this.trpc.user.byId.queryOptions(
    { id: this.userId() },
    {
      enabled: !!this.userId(),
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  )
);
```

### Optimistic Updates

```typescript
updateUserMutation = injectMutation(() => 
  this.trpc.user.update.mutationOptions({
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await this.queryClient.cancelQueries({ 
        queryKey: this.trpc.user.list.getQueryKey() 
      });
      
      // Snapshot the previous value
      const previousUsers = this.queryClient.getQueryData(
        this.trpc.user.list.getQueryKey()
      );
      
      // Optimistically update
      this.queryClient.setQueryData(
        this.trpc.user.list.getQueryKey(),
        (old: any[]) => old.map(user => 
          user.id === newUser.id ? { ...user, ...newUser } : user
        )
      );
      
      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      this.queryClient.setQueryData(
        this.trpc.user.list.getQueryKey(),
        context?.previousUsers
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      this.queryClient.invalidateQueries({ 
        queryKey: this.trpc.user.list.getQueryKey() 
      });
    },
  })
);
```

This integration provides a complete, type-safe, and Angular-native solution for using tRPC with the full power of TanStack Query and Angular's HTTP client.