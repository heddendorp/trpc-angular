import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component, inject, InjectionToken } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { 
  QueryClient, 
  provideTanStackQuery, 
  injectQuery, 
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC, createTRPCClientFactory } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

// Create a proper injection token for testing
interface ApiService {
  getApiUrl: () => string;
  getAuthToken: () => string;
}

const API_SERVICE_TOKEN = new InjectionToken<ApiService>('ApiService');

describe('provideTRPC Factory Function Support', () => {
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

  describe('Factory Function Support', () => {
    it('should create tRPC client using factory function', () => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideTanStackQuery(queryClient),
          provideTRPC(createTRPCClientFactory(() => {
            // This factory function will be called during DI resolution
            return createTRPCClient<AppRouter>({
              links: [
                httpBatchLink({
                  url: 'http://localhost:3000/trpc',
                }),
              ],
            });
          })),
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

    it('should support factory functions that can use dependency injection', () => {
      // Mock service that could be injected
      const mockService: ApiService = {
        getApiUrl: () => 'http://localhost:3000/trpc',
        getAuthToken: () => 'test-token',
      };

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideTanStackQuery(queryClient),
          { provide: API_SERVICE_TOKEN, useValue: mockService },
          provideTRPC(createTRPCClientFactory(() => {
            // Factory function can use dependency injection
            const apiService = inject(API_SERVICE_TOKEN);
            return createTRPCClient<AppRouter>({
              links: [
                httpBatchLink({
                  url: apiService.getApiUrl(),
                  headers: () => ({
                    authorization: `Bearer ${apiService.getAuthToken()}`,
                  }),
                }),
              ],
            });
          })),
        ],
      });

      @Component({
        template: `
          <div>
            @if (greetQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (greetQuery.error()) {
              <p>Error: {{ greetQuery.error()!.message }}</p>
            } @else {
              <p>{{ greetQuery.data() }}</p>
            }
          </div>
        `,
      })
      class TestComponent {
        private trpc = injectTRPC<AppRouter>();
        
        greetQuery = injectQuery(() => this.trpc.greet.queryOptions({ name: 'World' }));
      }
      
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      // Should be able to create the component without errors
      expect(component).toBeDefined();
      expect(component.greetQuery).toBeDefined();
      expect(component.greetQuery.isLoading).toBeDefined();
      expect(component.greetQuery.data).toBeDefined();
      expect(component.greetQuery.error).toBeDefined();
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should support mutations with factory-created clients', () => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideTanStackQuery(queryClient),
          provideTRPC(createTRPCClientFactory(() => {
            return createTRPCClient<AppRouter>({
              links: [
                httpBatchLink({
                  url: 'http://localhost:3000/trpc',
                }),
              ],
            });
          })),
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
        
        createUserMutation = injectMutation(() => this.trpc.createUser.mutationOptions());
        
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
  });

  describe('Backward Compatibility', () => {
    it('should still work with pre-created client (backward compatibility)', () => {
      // Create client outside of Angular DI
      const trpcClient = createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            url: 'http://localhost:3000/trpc',
          }),
        ],
      });

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideTanStackQuery(queryClient),
          provideTRPC(trpcClient), // Pass pre-created client
        ],
      });

      @Component({
        template: `
          <div>
            @if (helloQuery.isLoading()) {
              <p>Loading...</p>
            } @else {
              <p>{{ helloQuery.data() }}</p>
            }
          </div>
        `,
      })
      class BackwardCompatComponent {
        private trpc = injectTRPC<AppRouter>();
        
        helloQuery = injectQuery(() => this.trpc.hello.queryOptions());
      }
      
      const fixture = TestBed.createComponent(BackwardCompatComponent);
      const component = fixture.componentInstance;
      
      // Should maintain backward compatibility
      expect(component).toBeDefined();
      expect(component.helloQuery).toBeDefined();
      expect(component.helloQuery.isLoading).toBeDefined();
      expect(component.helloQuery.data).toBeDefined();
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});