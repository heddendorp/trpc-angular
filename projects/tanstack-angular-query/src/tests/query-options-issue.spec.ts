import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component, effect, ChangeDetectionStrategy } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { QueryClient, provideTanStackQuery, injectQuery } from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create a more complex router similar to the one in the issue
const t = initTRPC.create();

const adminRouter = t.router({
  roles: t.router({
    findMany: t.procedure
      .input(z.object({}).optional())
      .query(({ input }) => {
        return [
          { id: 1, name: 'Admin' },
          { id: 2, name: 'User' }
        ];
      }),
  }),
});

const appRouter = t.router({
  admin: adminRouter,
});

type AppRouter = typeof appRouter;

describe('Query Options Issue Reproduction', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    // Create a tRPC client
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
        provideTRPC(trpcClient),
      ],
    });
  });

  it('should reproduce the exact issue: injectQuery expects a function that returns options', () => {
    @Component({
      template: `<div>Test Component</div>`,
    })
    class TestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // This should work - the user's current pattern
      rolesQuery = injectQuery(this.trpc.admin.roles.findMany.queryOptions({}));
      
      // This should also work - functional pattern  
      rolesQueryFunctional = injectQuery(() => this.trpc.admin.roles.findMany.queryOptions({}));
    }

    // This should not throw - the current implementation should return a function
    expect(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      // Both should work
      expect(component.rolesQuery).toBeDefined();
      expect(component.rolesQueryFunctional).toBeDefined();
      
      // Both should have the same interface
      expect(component.rolesQuery.data).toBeDefined();
      expect(component.rolesQueryFunctional.data).toBeDefined();
    }).not.toThrow();
  });

  it('should verify that queryOptions returns the correct type', () => {
    @Component({
      template: `<div>Test Component</div>`,
    })
    class TestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // Test the queryOptions method directly
      public queryOptionsResult = this.trpc.admin.roles.findMany.queryOptions({});
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Check that queryOptions returns the expected structure
    expect(component.queryOptionsResult).toBeDefined();
    expect(component.queryOptionsResult.queryKey).toBeDefined();
    expect(component.queryOptionsResult.queryFn).toBeDefined();
    expect(typeof component.queryOptionsResult.queryFn).toBe('function');
    
    // Check that it's both an object and callable
    expect(typeof component.queryOptionsResult).toBe('function');
    expect(component.queryOptionsResult.queryKey).toBeDefined();
  });

  it('should verify that injectQuery works with queryOptions', () => {
    @Component({
      template: `<div>Test Component</div>`,
    })
    class TestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // Test different ways of using queryOptions with injectQuery
      public directQuery = injectQuery(this.trpc.admin.roles.findMany.queryOptions({}));
      
      // Test with a function that returns queryOptions
      public functionalQuery = injectQuery(() => this.trpc.admin.roles.findMany.queryOptions({}));
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Both should work
    expect(component.directQuery).toBeDefined();
    expect(component.functionalQuery).toBeDefined();
    
    // They should have the same structure
    expect(component.directQuery.data).toBeDefined();
    expect(component.functionalQuery.data).toBeDefined();
    
    expect(component.directQuery.isLoading).toBeDefined();
    expect(component.functionalQuery.isLoading).toBeDefined();
  });

  it('should test the callable nature of queryOptions', () => {
    @Component({
      template: `<div>Test Component</div>`,
    })
    class TestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // Test that queryOptions can be called
      public queryOptionsObj = this.trpc.admin.roles.findMany.queryOptions({});
      public queryOptionsResult = this.trpc.admin.roles.findMany.queryOptions({})();
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Both should be defined
    expect(component.queryOptionsObj).toBeDefined();
    expect(component.queryOptionsResult).toBeDefined();
    
    // The called version should return the same structure
    expect(component.queryOptionsObj.queryKey).toEqual(component.queryOptionsResult.queryKey);
    expect(typeof component.queryOptionsObj.queryFn).toBe('function');
    expect(typeof component.queryOptionsResult.queryFn).toBe('function');
  });

  it('should demonstrate the recommended usage pattern for injectQuery', () => {
    @Component({
      template: `<div>Test Component</div>`,
    })
    class TestComponent {
      private readonly trpc = injectTRPC<AppRouter>();
      
      // RECOMMENDED: Use functional pattern for injectQuery
      rolesQueryRecommended = injectQuery(() => this.trpc.admin.roles.findMany.queryOptions({}));
      
      // DEPRECATED: Direct usage (may cause issues in some environments)
      rolesQueryDirect = injectQuery(this.trpc.admin.roles.findMany.queryOptions({}));
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Both patterns should work, but functional is recommended
    expect(component.rolesQueryRecommended).toBeDefined();
    expect(component.rolesQueryDirect).toBeDefined();
    
    // Both should have the same interface
    expect(component.rolesQueryRecommended.data).toBeDefined();
    expect(component.rolesQueryDirect.data).toBeDefined();
  });
});