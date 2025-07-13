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

describe('Real-world Usage Pattern', () => {
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

  it('should replicate the exact scenario from the problem statement', () => {
    // This is the desired usage pattern from the problem statement
    @Component({
      template: `<div>Test</div>`,
    })
    class DesiredUsageComponent {
      private trpc = injectTRPC<AppRouter>();
      
      // The user wants to use it like this (without function wrapper)
      readonly rolesQuery = injectQuery(
        this.trpc.hello.queryOptions() // Using hello since it's available in our test router
      );
    }
    
    // This should work without throwing an error
    expect(() => {
      const fixture = TestBed.createComponent(DesiredUsageComponent);
      const component = fixture.componentInstance;
      expect(component.rolesQuery).toBeDefined();
    }).not.toThrow();
  });

  it('should work with the current working pattern for comparison', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class CurrentWorkingComponent {
      private trpc = injectTRPC<AppRouter>();
      
      // This is the current working pattern (with function wrapper)
      readonly rolesQuery = injectQuery(() =>
        this.trpc.hello.queryOptions()
      );
    }
    
    expect(() => {
      const fixture = TestBed.createComponent(CurrentWorkingComponent);
      const component = fixture.componentInstance;
      expect(component.rolesQuery).toBeDefined();
    }).not.toThrow();
  });

  it('should demonstrate the problem if it exists', () => {
    // Let's create a minimal reproduction of what might be failing
    const trpcProxy = {} as any;
    
    // Let's manually test what the TRPC proxy would return
    const mockQueryOptions = {
      queryKey: ['test'],
      queryFn: () => Promise.resolve('test'),
      trpc: { path: 'test' }
    };
    
    // If queryOptions() returns a plain object instead of a function, 
    // that would cause the "optionsFn is not a function" error
    console.log('Mock queryOptions type:', typeof mockQueryOptions);
    console.log('Mock queryOptions is function:', typeof mockQueryOptions === 'function');
    
    // The issue would be if queryOptions() returns an object rather than a function
    expect(typeof mockQueryOptions).toBe('object');
  });
});