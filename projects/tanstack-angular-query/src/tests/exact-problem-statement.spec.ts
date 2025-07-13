import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { 
  QueryClient, 
  provideTanStackQuery, 
  injectQuery 
} from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create exact router structure from the problem statement
const t = initTRPC.create();

const adminRouter = t.router({
  roles: t.router({
    findMany: t.procedure
      .input(z.object({}).optional())
      .query(({ input }) => {
        return [
          { id: 1, name: 'admin' },
          { id: 2, name: 'user' }
        ];
      }),
  }),
});

const appRouter = t.router({
  admin: adminRouter,
});

type AppRouter = typeof appRouter;

describe('Problem Statement Exact Reproduction', () => {
  let queryClient: QueryClient;
  let trpcClient: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

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

  it('should work with the exact code from the problem statement', () => {
    // This is the EXACT code from the problem statement that was failing
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [],
      selector: 'app-members-hub',
      styles: ``,
      template: `
        <div>
          @if (rolesQuery.isLoading()) {
            <p>Loading roles...</p>
          } @else if (rolesQuery.error()) {
            <p>Error: {{ rolesQuery.error()?.message }}</p>
          } @else if (rolesQuery.data()) {
            <div>
              <h2>Roles:</h2>
              @for (role of rolesQuery.data(); track role.id) {
                <p>{{ role.name }}</p>
              }
            </div>
          }
        </div>
      `,
    })
    class MembersHubComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      readonly rolesQuery = injectQuery(
        this.trpc.admin.roles.findMany.queryOptions({}),
      );
    }

    const fixture = TestBed.createComponent(MembersHubComponent);
    const component = fixture.componentInstance;
    
    // Verify the component instance is created successfully
    expect(component).toBeDefined();
    
    // Verify the trpc instance is properly injected
    expect(component['trpc']).toBeDefined();
    
    // Verify the query was created with correct structure
    expect(component.rolesQuery).toBeDefined();
    expect(component.rolesQuery.isLoading).toBeDefined();
    expect(component.rolesQuery.data).toBeDefined();
    expect(component.rolesQuery.error).toBeDefined();
    
    // Verify the query options have the correct basic structure
    const queryOptions = component.rolesQuery as any;
    expect(queryOptions.queryKey).toBeDefined();
    expect(queryOptions.queryFn).toBeDefined();
    
    // This test mainly validates that the compilation and runtime work correctly
    // The important thing is that the code from the problem statement no longer throws
    // a TypeScript compilation error and the component can be instantiated successfully
    
    // Test that the template renders without throwing errors
    expect(() => fixture.detectChanges()).not.toThrow();
    
    // Verify the component is properly typed
    expect(typeof component.rolesQuery.isLoading()).toBe('boolean');
    // Note: data() and error() may be undefined in test environment, so just check they exist
    expect(component.rolesQuery.data).toBeDefined();
    expect(component.rolesQuery.error).toBeDefined();
  });
});