import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { 
  QueryClient, 
  provideTanStackQuery, 
  injectQuery 
} from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

describe('Problem Statement Reproduction', () => {
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

  it('should reproduce the exact problem statement scenario', () => {
    // This simulates the exact scenario from the problem statement
    @Component({
      template: `<div>Test</div>`,
    })
    class ProblemStatementComponent {
      private trpc = injectTRPC<AppRouter>();

      // This is what currently works (wrapped in function)
      readonly rolesQueryCurrently = injectQuery(() =>
        this.trpc.greet.queryOptions({ name: 'admin' }), // Using greet as a substitute for admin.roles.findMany
      );

      // This is what the user wants to work (without function wrapper)
      readonly rolesQueryDesired = injectQuery(
        this.trpc.greet.queryOptions({ name: 'admin' }),
      );
    }
    
    // This should work without throwing the "optionsFn is not a function" error
    expect(() => {
      const fixture = TestBed.createComponent(ProblemStatementComponent);
      const component = fixture.componentInstance;
      
      // Both queries should be defined
      expect(component.rolesQueryCurrently).toBeDefined();
      expect(component.rolesQueryDesired).toBeDefined();
      
      // Both should have the same interface
      expect(component.rolesQueryCurrently.data).toBeDefined();
      expect(component.rolesQueryDesired.data).toBeDefined();
      expect(component.rolesQueryCurrently.isLoading).toBeDefined();
      expect(component.rolesQueryDesired.isLoading).toBeDefined();
      
      console.log('✅ Both query patterns work correctly!');
    }).not.toThrow();
  });

  it('should validate the fix prevents the "optionsFn is not a function" error', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }
    
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Get the queryOptions result
    const queryOptions = component.trpc.greet.queryOptions({ name: 'test' });
    
    // Verify it's a function (this should prevent the "optionsFn is not a function" error)
    expect(typeof queryOptions).toBe('function');
    
    // Verify it can be called
    expect(() => queryOptions()).not.toThrow();
    
    // Verify it has the required properties for direct usage
    expect(queryOptions.queryKey).toBeDefined();
    expect(queryOptions.queryFn).toBeDefined();
    expect(queryOptions.trpc).toBeDefined();
    
    console.log('✅ queryOptions is a proper function with required properties!');
  });

  it('should work with different query configurations', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
      
      // Test with no parameters
      readonly helloQuery = injectQuery(this.trpc.hello.queryOptions());
      
      // Test with parameters
      readonly greetQuery = injectQuery(this.trpc.greet.queryOptions({ name: 'World' }));
    }
    
    expect(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      expect(component.helloQuery).toBeDefined();
      expect(component.greetQuery).toBeDefined();
      
      console.log('✅ Multiple query configurations work!');
    }).not.toThrow();
  });

  it('should maintain backward compatibility with function wrapper', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
      
      // The old way should still work
      readonly oldWayQuery = injectQuery(() => this.trpc.hello.queryOptions());
      
      // The new way should also work
      readonly newWayQuery = injectQuery(this.trpc.hello.queryOptions());
    }
    
    expect(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      expect(component.oldWayQuery).toBeDefined();
      expect(component.newWayQuery).toBeDefined();
      
      // Both should have the same interface
      expect(typeof component.oldWayQuery.data).toBe('function');
      expect(typeof component.newWayQuery.data).toBe('function');
      
      console.log('✅ Backward compatibility maintained!');
    }).not.toThrow();
  });
});