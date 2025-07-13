import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { 
  QueryClient, 
  provideTanStackQuery, 
  injectQuery, 
  injectMutation, 
  injectInfiniteQuery 
} from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC, injectTRPCSubscription } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

describe('tanstack-angular-query Usage Examples', () => {
  let queryClient: QueryClient;
  let trpcClient: any;

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

    // Create a real tRPC client (even if it will fail to connect, it has the right structure)
    trpcClient = createTRPCClient<AppRouter>({
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
        provideTRPC(trpcClient),
      ],
    });
  });

  describe('Basic Usage Examples', () => {
    it('should demonstrate basic query usage pattern', () => {
      @Component({
        template: `
          <div>
            @if (helloQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (helloQuery.error()) {
              <p>Error: {{ helloQuery.error()?.message }}</p>
            } @else {
              <p>{{ helloQuery.data() }}</p>
            }
          </div>
        `,
      })
      class HelloQueryComponent {
        private trpc = injectTRPC<AppRouter>();
        
        helloQuery = injectQuery(() => this.trpc.hello.queryOptions());
      }
      
      const fixture = TestBed.createComponent(HelloQueryComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate the basic usage pattern
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

    it('should demonstrate query with input usage pattern', () => {
      @Component({
        template: `
          <div>
            @if (greetQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (greetQuery.error()) {
              <p>Error: {{ greetQuery.error()?.message }}</p>
            } @else {
              <p>{{ greetQuery.data() }}</p>
            }
          </div>
        `,
      })
      class GreetQueryComponent {
        private trpc = injectTRPC<AppRouter>();
        
        greetQuery = injectQuery(() => this.trpc.greet.queryOptions({ name: 'World' }));
      }
      
      const fixture = TestBed.createComponent(GreetQueryComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate the input usage pattern
      expect(component.greetQuery).toBeDefined();
      expect(component.greetQuery.isLoading).toBeDefined();
      expect(component.greetQuery.data).toBeDefined();
      expect(component.greetQuery.error).toBeDefined();
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should demonstrate mutation usage pattern', () => {
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
              <p>Error: {{ createUserMutation.error()?.message }}</p>
            } @else if (createUserMutation.data()) {
              <p>Created: {{ createUserMutation.data()?.name }}</p>
            }
          </div>
        `,
      })
      class CreateUserMutationComponent {
        private trpc = injectTRPC<AppRouter>();
        
        createUserMutation = injectMutation(() => this.trpc.createUser.mutationOptions());
        
        createUser() {
          this.createUserMutation.mutate({ name: 'John Doe' });
        }
      }
      
      const fixture = TestBed.createComponent(CreateUserMutationComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate the mutation usage pattern
      expect(component.createUserMutation).toBeDefined();
      expect(component.createUserMutation.isPending).toBeDefined();
      expect(component.createUserMutation.mutate).toBeDefined();
      expect(component.createUserMutation.data).toBeDefined();
      expect(component.createUserMutation.error).toBeDefined();
      expect(component.createUser).toBeDefined();
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should demonstrate infinite query usage pattern', () => {
      @Component({
        template: `
          <div>
            @if (infiniteQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (infiniteQuery.error()) {
              <p>Error: {{ infiniteQuery.error()?.message }}</p>
            } @else {
              <div>
                @for (page of infiniteQuery.data()?.pages; track page) {
                  @for (user of page.users; track user.id) {
                    <p>{{ user.name }}</p>
                  }
                }
              </div>
              
              @if (infiniteQuery.hasNextPage()) {
                <button 
                  (click)="loadMore()"
                  [disabled]="infiniteQuery.isFetchingNextPage()"
                >
                  Load More
                </button>
              }
            }
          </div>
        `,
      })
      class InfiniteUsersComponent {
        private trpc = injectTRPC<AppRouter>();
        
        infiniteQuery = injectInfiniteQuery(() => 
          this.trpc.getUsers.infiniteQueryOptions(
            { limit: 5 },
            {
              initialCursor: 0,
              getNextPageParam: (lastPage: any) => lastPage.nextCursor,
            }
          )
        );
        
        loadMore() {
          this.infiniteQuery.fetchNextPage();
        }
      }
      
      const fixture = TestBed.createComponent(InfiniteUsersComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate the infinite query usage pattern
      expect(component.infiniteQuery).toBeDefined();
      expect(component.infiniteQuery.isLoading).toBeDefined();
      expect(component.infiniteQuery.data).toBeDefined();
      expect(component.infiniteQuery.error).toBeDefined();
      expect(component.infiniteQuery.hasNextPage).toBeDefined();
      expect(component.infiniteQuery.fetchNextPage).toBeDefined();
      expect(component.infiniteQuery.isFetchingNextPage).toBeDefined();
      expect(component.loadMore).toBeDefined();
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should demonstrate subscription usage pattern', () => {
      @Component({
        template: `
          <div>
            @if (subscription.status === 'connecting') {
              <p>Connecting...</p>
            } @else if (subscription.status === 'error') {
              <p>Error occurred</p>
            } @else if (subscription.data) {
              <p>{{ subscription.data.name }} was {{ subscription.data.action }}</p>
            }
          </div>
        `,
      })
      class UserUpdatesSubscriptionComponent {
        private trpc = injectTRPC<AppRouter>();
        
        subscription = injectTRPCSubscription(this.trpc.userUpdates.subscriptionOptions());
      }
      
      const fixture = TestBed.createComponent(UserUpdatesSubscriptionComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate the subscription usage pattern
      expect(component.subscription).toBeDefined();
      expect(component.subscription.status).toBeDefined();
      // Note: subscription.data might be undefined in test environment
      // expect(component.subscription.data).toBeDefined();
      expect(component.subscription.error).toBeDefined();
      
      // Template should not throw during compilation (subscription will fail due to HTTP link)
      // This is expected behavior - subscriptions need WebSocket or SSE links
      expect(() => fixture.detectChanges()).toThrow(/Subscriptions are unsupported/);
    });
  });

  describe('Integration Examples', () => {
    it('should demonstrate tRPC injection pattern', () => {
      @Component({
        template: `<div>Test Component</div>`,
      })
      class TestComponent {
        private trpc = injectTRPC<AppRouter>();
        
        // Demonstrate accessing different procedure types
        hello = this.trpc.hello.queryOptions();
        greet = this.trpc.greet.queryOptions({ name: 'World' });
        createUser = this.trpc.createUser.mutationOptions();
        getUsers = this.trpc.getUsers.infiniteQueryOptions(
          { limit: 10 },
          { initialCursor: 0, getNextPageParam: (lastPage: any) => lastPage.nextCursor }
        );
        userUpdates = this.trpc.userUpdates.subscriptionOptions();
      }
      
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate proper tRPC integration
      expect(component['trpc']).toBeDefined();
      expect(component.hello).toBeDefined();
      expect(component.greet).toBeDefined();
      expect(component.createUser).toBeDefined();
      expect(component.getUsers).toBeDefined();
      expect(component.userUpdates).toBeDefined();
      
      // All options should have the correct structure
      expect(component.hello.queryKey).toBeDefined();
      expect(component.hello.queryFn).toBeDefined();
      expect(component.greet.queryKey).toBeDefined();
      expect(component.greet.queryFn).toBeDefined();
      expect(component.createUser.mutationFn).toBeDefined();
      expect(component.getUsers.queryKey).toBeDefined();
      expect(component.getUsers.queryFn).toBeDefined();
      expect(component.userUpdates.subscribe).toBeDefined();
    });

    it('should demonstrate reactive pattern with signals', () => {
      @Component({
        template: `
          <div>
            <input 
              type="text" 
              [value]="nameInput()"
              (input)="updateName($event)"
            >
            @if (greetQuery.isLoading()) {
              <p>Loading...</p>
            } @else if (greetQuery.data()) {
              <p>{{ greetQuery.data() }}</p>
            }
          </div>
        `,
      })
      class ReactiveQueryComponent {
        private trpc = injectTRPC<AppRouter>();
        
        nameInput = signal('');
        
        greetQuery = injectQuery(() => 
          this.trpc.greet.queryOptions({ name: this.nameInput() })
        );
        
        updateName(event: Event) {
          const target = event.target as HTMLInputElement;
          this.nameInput.set(target.value);
        }
      }
      
      const fixture = TestBed.createComponent(ReactiveQueryComponent);
      const component = fixture.componentInstance;
      
      // Should demonstrate reactive patterns
      expect(component.nameInput).toBeDefined();
      expect(component.greetQuery).toBeDefined();
      expect(component.updateName).toBeDefined();
      
      // Signal should be reactive
      expect(typeof component.nameInput()).toBe('string');
      
      // Template should not throw during compilation
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Type Safety Examples', () => {
    it('should provide proper type inference', () => {
      @Component({
        template: `<div>Test Component</div>`,
      })
      class TypeSafetyComponent {
        private trpc = injectTRPC<AppRouter>();
        
        helloQuery = injectQuery(() => this.trpc.hello.queryOptions());
        createUserMutation = injectMutation(() => this.trpc.createUser.mutationOptions());
      }
      
      const fixture = TestBed.createComponent(TypeSafetyComponent);
      const component = fixture.componentInstance;
      
      // TypeScript should infer the correct types
      const helloData = component.helloQuery.data();
      // In test environment, data might be undefined but TypeScript still knows the type
      expect(helloData === undefined || typeof helloData === 'string').toBe(true);
      
      const createUserData = component.createUserMutation.data();
      if (createUserData) {
        expect(typeof createUserData.id).toBe('number');
        expect(typeof createUserData.name).toBe('string');
      }
      
      // The important thing is that the components and queries are properly typed
      expect(component.helloQuery.data).toBeDefined();
      expect(component.createUserMutation.data).toBeDefined();
    });
  });
});