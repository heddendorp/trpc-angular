# Angular HTTP Client Example

This example shows how to use the `@heddendorp/angular-http-client` package standalone to integrate tRPC with Angular's HttpClient.

## Installation

```bash
yarn add @heddendorp/angular-http-client @trpc/client @trpc/server
```

## Basic Usage

### 1. Create a tRPC Service

```typescript
// services/trpc.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/angular-http-client';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcService {
  private httpClient = inject(HttpClient);
  
  private client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
        headers: {
          'Authorization': 'Bearer your-token',
          'Content-Type': 'application/json',
        },
      }),
    ],
  });

  get trpc() {
    return this.client;
  }
}
```

### 2. Use in Components

```typescript
// components/user.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrpcService } from '../services/trpc.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Users</h2>
      
      @if (loading) {
        <p>Loading...</p>
      } @else if (error) {
        <p>Error: {{ error }}</p>
      } @else {
        <ul>
          @for (user of users; track user.id) {
            <li>{{ user.name }} - {{ user.email }}</li>
          }
        </ul>
      }
      
      <button (click)="loadUsers()">Reload Users</button>
      <button (click)="createUser()">Create User</button>
    </div>
  `
})
export class UserComponent implements OnInit {
  private trpcService = inject(TrpcService);
  
  users: any[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    
    try {
      this.users = await this.trpcService.trpc.user.list.query();
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async createUser() {
    try {
      await this.trpcService.trpc.user.create.mutate({
        name: 'New User',
        email: 'newuser@example.com'
      });
      
      // Reload users after creation
      this.loadUsers();
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
```

### 3. With Dynamic Headers

```typescript
// services/trpc-with-auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/angular-http-client';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcWithAuthService {
  private httpClient = inject(HttpClient);
  
  private client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
        headers: ({ op }) => {
          const token = localStorage.getItem('auth-token');
          return {
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Operation-Type': op.type,
          };
        },
      }),
    ],
  });

  get trpc() {
    return this.client;
  }
}
```

### 4. With Error Handling

```typescript
// services/trpc-with-error-handling.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/angular-http-client';
import type { AppRouter } from '../server/router';

@Injectable({
  providedIn: 'root'
})
export class TrpcWithErrorHandlingService {
  private httpClient = inject(HttpClient);
  
  private client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient: this.httpClient,
        headers: {
          'Authorization': 'Bearer your-token',
        },
      }),
    ],
  });

  get trpc() {
    return this.client;
  }

  async callWithErrorHandling<T>(
    operation: () => Promise<T>
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('HTTP Error:', error.status, error.message);
        
        switch (error.status) {
          case 401:
            // Handle unauthorized
            localStorage.removeItem('auth-token');
            // Redirect to login
            break;
          case 403:
            // Handle forbidden
            console.error('Access forbidden');
            break;
          case 500:
            // Handle server error
            console.error('Server error occurred');
            break;
          default:
            console.error('Unknown error:', error);
        }
      } else {
        console.error('Non-HTTP error:', error);
      }
      return null;
    }
  }
}
```

### 5. Application Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loggingInterceptor } from './interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
      ])
    ),
    // Other providers...
  ],
};
```

### 6. HTTP Interceptors

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept tRPC requests
  if (req.url.includes('/trpc')) {
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return next(authReq);
    }
  }
  
  return next(req);
};
```

```typescript
// interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpEventType.Response
          const duration = Date.now() - startTime;
          console.log(`${req.method} ${req.url} - ${duration}ms`);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`${req.method} ${req.url} - ERROR after ${duration}ms`, error);
      }
    })
  );
};
```

## Key Benefits

1. **Angular Integration**: Uses Angular's HttpClient directly
2. **HTTP Interceptors**: Leverages Angular's interceptor system
3. **Error Handling**: Consistent error handling with HttpErrorResponse
4. **Observable Pattern**: Works with Angular's reactive programming
5. **Type Safety**: Full TypeScript support

## Migration from httpLink

If you're currently using `@trpc/client`'s `httpLink`, you can easily migrate:

```typescript
// Before
import { httpLink } from '@trpc/client';

const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        'Authorization': 'Bearer token',
      },
    }),
  ],
});

// After
import { angularHttpLink } from '@heddendorp/angular-http-client';

const client = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: inject(HttpClient),
      headers: {
        'Authorization': 'Bearer token',
      },
    }),
  ],
});
```

This gives you all the benefits of Angular's HTTP system while maintaining the same tRPC API.