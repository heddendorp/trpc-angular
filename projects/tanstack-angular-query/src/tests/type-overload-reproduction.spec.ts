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

// Create a more complex router structure that mimics the issue
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
    findOne: t.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return { id: input.id, name: 'admin' };
      }),
  }),
  users: t.router({
    findMany: t.procedure
      .input(z.object({}).optional())
      .query(({ input }) => {
        return [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ];
      }),
  }),
});

const appRouter = t.router({
  admin: adminRouter,
  health: t.procedure.query(() => 'OK'),
});

type AppRouter = typeof appRouter;

describe('Type Overload Reproduction Test', () => {
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

  it('should reproduce the type overload error with nested router structure', () => {
    // This test reproduces the exact issue from the problem statement
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [],
      selector: 'app-members-hub',
      styles: ``,
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
      `,
    })
    class MembersHubComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // This should now work without requiring a function wrapper
      readonly rolesQuery = injectQuery(
        this.trpc.admin.roles.findMany.queryOptions({})
      );
    }

    const fixture = TestBed.createComponent(MembersHubComponent);
    const component = fixture.componentInstance;
    
    // Test that the component can be created without throwing
    expect(component).toBeDefined();
    expect(component.rolesQuery).toBeDefined();
    
    // Test that the query has the expected structure
    expect(component.rolesQuery.isLoading).toBeDefined();
    expect(component.rolesQuery.data).toBeDefined();
    expect(component.rolesQuery.error).toBeDefined();

    // Test that the template can be rendered without throwing
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should work with simpler router structure', () => {
    @Component({
      selector: 'app-simple-test',
      template: `
        <div>
          @if (healthQuery.isLoading()) {
            <p>Loading...</p>
          } @else {
            <p>{{ healthQuery.data() }}</p>
          }
        </div>
      `,
    })
    class SimpleTestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // This should work fine - without function wrapper
      readonly healthQuery = injectQuery(
        this.trpc.health.queryOptions()
      );
    }

    const fixture = TestBed.createComponent(SimpleTestComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
    expect(component.healthQuery).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should work with nested router access', () => {
    @Component({
      selector: 'app-nested-test',
      template: `
        <div>
          @if (usersQuery.isLoading()) {
            <p>Loading...</p>
          } @else {
            <div>
              @for (user of usersQuery.data() || []; track user.id) {
                <p>{{ user.name }}</p>
              }
            </div>
          }
        </div>
      `,
    })
    class NestedTestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // This should also work - testing another nested path without function wrapper
      readonly usersQuery = injectQuery(
        this.trpc.admin.users.findMany.queryOptions({})
      );
    }

    const fixture = TestBed.createComponent(NestedTestComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
    expect(component.usersQuery).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should maintain backward compatibility with function wrapper pattern', () => {
    @Component({
      selector: 'app-backward-compat-test',
      template: `
        <div>
          @if (rolesQuery.isLoading()) {
            <p>Loading...</p>
          } @else {
            <div>
              @for (role of rolesQuery.data() || []; track role.id) {
                <p>{{ role.name }}</p>
              }
            </div>
          }
        </div>
      `,
    })
    class BackwardCompatTestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // This should still work with function wrapper for backward compatibility
      readonly rolesQuery = injectQuery(() =>
        this.trpc.admin.roles.findMany.queryOptions({})
      );
    }

    const fixture = TestBed.createComponent(BackwardCompatTestComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
    expect(component.rolesQuery).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});