import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Component, inject } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  QueryClient,
  provideTanStackQuery,
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import {
  injectTRPC,
  provideTRPC,
  createTRPCClientFactory,
} from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

// Mock angularHttpLink for testing the integration pattern
function mockAngularHttpLink(opts: {
  url: string;
  httpClient: HttpClient;
  headers?: any;
}) {
  return httpBatchLink({
    url: opts.url,
    headers: opts.headers,
  });
}

describe('Angular Link Integration with TanStack Angular Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  describe('Factory Pattern with HttpClient Integration', () => {
    it('should create tRPC client using factory function with injected HttpClient', () => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideTanStackQuery(queryClient),
          provideTRPC(
            createTRPCClientFactory(() => {
              const httpClient = inject(HttpClient);
              return createTRPCClient<AppRouter>({
                links: [
                  mockAngularHttpLink({
                    url: 'http://localhost:3000/trpc',
                    httpClient,
                  }),
                ],
              });
            }),
          ),
        ],
      });

      @Component({
        template: `
          <div>
            @if (helloQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (helloQuery.error()) {
              <p>Error: {{ helloQuery.error()!.message }}</p>
            } @else {
              <p>{{ helloQuery.data() }}</p>
            }
          </div>
        `,
      })
      class TestComponent {
        private trpc = injectTRPC<AppRouter>();

        helloQuery = injectQuery(() => this.trpc.hello.queryOptions());
      }

      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      // Should be able to create the component without errors
      expect(component).toBeDefined();
      expect(component.helloQuery).toBeDefined();
      expect(component.helloQuery.isLoading).toBeDefined();
      expect(component.helloQuery.data).toBeDefined();
      expect(component.helloQuery.error).toBeDefined();

      // Should be able to call the signal functions
      expect(typeof component.helloQuery.isLoading()).toBe('boolean');
      expect(typeof component.helloQuery.error()).toBe('object');

      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should support mutations with HttpClient integration', () => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideTanStackQuery(queryClient),
          provideTRPC(
            createTRPCClientFactory(() => {
              const httpClient = inject(HttpClient);
              return createTRPCClient<AppRouter>({
                links: [
                  mockAngularHttpLink({
                    url: 'http://localhost:3000/trpc',
                    httpClient,
                    headers: () => ({
                      'x-test-header': 'test-value',
                    }),
                  }),
                ],
              });
            }),
          ),
        ],
      });

      @Component({
        template: `
          <div>
            <button
              (click)="createUser()"
              [disabled]="createUserMutation.isPending()"
            >
              Create User
            </button>

            @if (createUserMutation.isPending()) {
              <p>Creating user...</p>
            } @else if (createUserMutation.error()) {
              <p>Error: {{ createUserMutation.error()!.message }}</p>
            } @else if (createUserMutation.data()) {
              <p>Created: {{ createUserMutation.data()!.name }}</p>
            }
          </div>
        `,
      })
      class CreateUserComponent {
        private trpc = injectTRPC<AppRouter>();

        createUserMutation = injectMutation(() =>
          this.trpc.createUser.mutationOptions(),
        );

        createUser() {
          this.createUserMutation.mutate({ name: 'John Doe' });
        }
      }

      const fixture = TestBed.createComponent(CreateUserComponent);
      const component = fixture.componentInstance;

      // Should be able to create the component and mutation
      expect(component).toBeDefined();
      expect(component.createUserMutation).toBeDefined();
      expect(component.createUserMutation.isPending).toBeDefined();
      expect(component.createUserMutation.mutate).toBeDefined();
      expect(component.createUserMutation.data).toBeDefined();
      expect(component.createUserMutation.error).toBeDefined();
      expect(component.createUser).toBeDefined();

      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should work with complex factory patterns and custom headers', () => {
      const mockToken = 'test-token-123';

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideTanStackQuery(queryClient),
          provideTRPC(
            createTRPCClientFactory(() => {
              const httpClient = inject(HttpClient);
              return createTRPCClient<AppRouter>({
                links: [
                  mockAngularHttpLink({
                    url: 'http://localhost:3000/trpc',
                    httpClient,
                    headers: () => ({
                      'x-trpc-source': 'angular-client',
                      authorization: `Bearer ${mockToken}`,
                    }),
                  }),
                ],
              });
            }),
          ),
        ],
      });

      @Component({
        template: `
          <div>
            <h1>User Profile</h1>
            @if (userQuery.data()) {
              <p>Name: {{ userQuery.data() }}</p>
            }
            <button (click)="updateUser()">Update User</button>
          </div>
        `,
      })
      class UserProfileComponent {
        private trpc = injectTRPC<AppRouter>();

        userQuery = injectQuery(() =>
          this.trpc.greet.queryOptions({ name: 'Test User' }),
        );
        updateUserMutation = injectMutation(() =>
          this.trpc.createUser.mutationOptions(),
        );

        updateUser() {
          this.updateUserMutation.mutate({ name: 'Updated User' });
        }
      }

      const fixture = TestBed.createComponent(UserProfileComponent);
      const component = fixture.componentInstance;

      // Should demonstrate complex factory pattern usage
      expect(component).toBeDefined();
      expect(component.userQuery).toBeDefined();
      expect(component.updateUserMutation).toBeDefined();
      expect(component.updateUser).toBeDefined();

      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Integration Pattern Examples', () => {
    it('should demonstrate the complete integration pattern from documentation', () => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideTanStackQuery(queryClient),
          provideTRPC(
            createTRPCClientFactory(() => {
              const httpClient = inject(HttpClient);
              return createTRPCClient<AppRouter>({
                links: [
                  mockAngularHttpLink({
                    url: 'http://localhost:3000/trpc',
                    httpClient,
                    headers: () => ({
                      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    }),
                  }),
                ],
              });
            }),
          ),
        ],
      });

      @Component({
        selector: 'app-user-profile',
        template: `
          <div class="user-profile">
            @if (userQuery.isLoading()) {
              <div class="loading">Loading user...</div>
            } @else if (userQuery.isError()) {
              <div class="error">Error: {{ userQuery.error()!.message }}</div>
            } @else {
              <div class="user-info">
                <h2>{{ userQuery.data() }}</h2>
              </div>
            }
          </div>
        `,
      })
      class UserProfileComponent {
        private trpc = injectTRPC<AppRouter>();

        userQuery = injectQuery(() =>
          this.trpc.greet.queryOptions({ name: 'User' }),
        );
      }

      const fixture = TestBed.createComponent(UserProfileComponent);
      const component = fixture.componentInstance;

      // Should demonstrate the complete integration pattern
      expect(component).toBeDefined();
      expect(component.userQuery).toBeDefined();
      expect(component.userQuery.isLoading).toBeDefined();
      expect(component.userQuery.isError).toBeDefined();
      expect(component.userQuery.error).toBeDefined();
      expect(component.userQuery.data).toBeDefined();

      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
