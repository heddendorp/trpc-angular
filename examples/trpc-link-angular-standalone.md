# Angular HTTP Client Example

This example shows how to use the `@heddendorp/trpc-link-angular` package standalone to integrate tRPC with Angular's HttpClient.

## Installation

```bash
yarn add @heddendorp/trpc-link-angular @trpc/client @trpc/server
```

## Basic Usage

### 1. Create a tRPC Service

```typescript
// trpc.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

### 2. Use in Components

```typescript
// user.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { TrpcService } from './trpc.service';

@Component({
  selector: 'app-user',
  template: `
    <div class="user-container">
      @if (loading) {
        <div class="loading">Loading...</div>
      } @else if (error) {
        <div class="error">Error: {{ error }}</div>
      } @else if (user) {
        <div class="user-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
        </div>
      }
    </div>
  `,
})
export class UserComponent implements OnInit {
  private trpcService = inject(TrpcService);
  
  user: any = null;
  loading = false;
  error: string | null = null;
  
  async ngOnInit() {
    try {
      this.loading = true;
      this.user = await this.trpcService.client.user.get.query({ id: 1 });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }
}
```

## Advanced Usage

### With Authentication

```typescript
// trpc-with-auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        headers: () => {
          const token = localStorage.getItem('authToken');
          return {
            authorization: token ? `Bearer ${token}` : '',
          };
        },
      }),
    ],
  });
}
```

### With Error Handling

```typescript
// trpc-with-error-handling.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
          
          // Handle specific HTTP status codes
          if (error.status === 401) {
            // Redirect to login
            console.log('Unauthorized - redirecting to login');
          } else if (error.status === 403) {
            // Show access denied message
            console.log('Access denied');
          } else if (error.status >= 500) {
            // Show server error message
            console.log('Server error occurred');
          }
        },
      }),
    ],
  });
}
```

### With Multiple Endpoints

```typescript
// multi-endpoint-trpc.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';
import type { AdminRouter } from '../server/admin-router';

@Injectable({
  providedIn: 'root'
})
export class MultiEndpointTrpcService {
  private httpClient = inject(HttpClient);
  
  // Main API client
  client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
      }),
    ],
  });
  
  // Admin API client
  adminClient = createTRPCClient<AdminRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/admin-trpc',
        httpClient: this.httpClient,
        headers: () => ({
          authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        }),
      }),
    ],
  });
}
```

## Real-world Example

### User Management Service

```typescript
// user-management.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private httpClient = inject(HttpClient);
  
  // State management with signals
  users = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  private client = createTRPCClient<AppRouter>({
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
  
  async loadUsers() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const users = await this.client.user.list.query();
      this.users.set(users);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }
  
  async createUser(userData: { name: string; email: string }) {
    try {
      this.loading.set(true);
      const newUser = await this.client.user.create.mutate(userData);
      this.users.update(users => [...users, newUser]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      this.loading.set(false);
    }
  }
  
  async updateUser(id: number, userData: { name?: string; email?: string }) {
    try {
      this.loading.set(true);
      const updatedUser = await this.client.user.update.mutate({ id, ...userData });
      this.users.update(users => 
        users.map(user => user.id === id ? updatedUser : user)
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      this.loading.set(false);
    }
  }
  
  async deleteUser(id: number) {
    try {
      this.loading.set(true);
      await this.client.user.delete.mutate({ id });
      this.users.update(users => users.filter(user => user.id !== id));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Component Using the Service

```typescript
// users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserManagementService } from './user-management.service';

@Component({
  selector: 'app-users',
  template: `
    <div class="users-container">
      <h2>User Management</h2>
      
      <!-- Create User Form -->
      <form [formGroup]="createForm" (ngSubmit)="createUser()" class="create-form">
        <input formControlName="name" placeholder="Name" required>
        <input formControlName="email" placeholder="Email" type="email" required>
        <button type="submit" [disabled]="userService.loading()">
          Create User
        </button>
      </form>
      
      <!-- Error Display -->
      @if (userService.error()) {
        <div class="error">{{ userService.error() }}</div>
      }
      
      <!-- Loading State -->
      @if (userService.loading()) {
        <div class="loading">Loading...</div>
      }
      
      <!-- Users List -->
      <div class="users-list">
        @for (user of userService.users(); track user.id) {
          <div class="user-card">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <button (click)="editUser(user)">Edit</button>
            <button (click)="deleteUser(user.id)">Delete</button>
          </div>
        }
      </div>
    </div>
  `,
  imports: [ReactiveFormsModule],
})
export class UsersComponent implements OnInit {
  userService = inject(UserManagementService);
  private fb = inject(FormBuilder);
  
  createForm = this.fb.group({
    name: [''],
    email: [''],
  });
  
  ngOnInit() {
    this.userService.loadUsers();
  }
  
  createUser() {
    if (this.createForm.valid) {
      const userData = this.createForm.value as { name: string; email: string };
      this.userService.createUser(userData);
      this.createForm.reset();
    }
  }
  
  editUser(user: any) {
    // Implementation for editing user
    console.log('Edit user:', user);
  }
  
  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
    }
  }
}
```

## HTTP Interceptors Integration

The Angular HttpClient integration automatically supports HTTP interceptors:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    // other providers
  ],
};
```

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

## Benefits

1. **Angular HTTP Interceptors**: Automatic support for auth tokens, error handling, etc.
2. **Observable Integration**: Works seamlessly with Angular's Observable patterns
3. **Type Safety**: Full TypeScript support with type inference
4. **Error Handling**: Proper error handling with HttpErrorResponse
5. **Performance**: Leverages Angular's HTTP client optimizations

## Next Steps

- [Integration with TanStack Angular Query](./integration-guide.md)
- [Advanced Configuration](./advanced-configuration.md)
- [Testing Guide](./testing-guide.md)