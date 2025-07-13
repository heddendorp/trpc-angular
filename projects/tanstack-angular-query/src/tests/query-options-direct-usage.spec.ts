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

describe('QueryOptions Direct Usage', () => {
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

  it('should work with function wrapper (current working pattern)', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class WorkingComponent {
      private trpc = injectTRPC<AppRouter>();
      
      // This currently works (with function wrapper)
      readonly rolesQuery = injectQuery(() =>
        this.trpc.hello.queryOptions(),
      );
    }
    
    expect(() => {
      const fixture = TestBed.createComponent(WorkingComponent);
      const component = fixture.componentInstance;
      expect(component.rolesQuery).toBeDefined();
    }).not.toThrow();
  });

  it('should check queryOptions behavior', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }
    
    try {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      
      // Let's check what queryOptions returns
      const queryOptions = component.trpc.hello.queryOptions();
      console.log('queryOptions type:', typeof queryOptions);
      console.log('queryOptions is function:', typeof queryOptions === 'function');
      console.log('queryOptions keys:', Object.keys(queryOptions));
      console.log('queryOptions.queryKey:', queryOptions.queryKey);
      console.log('queryOptions.queryFn:', typeof queryOptions.queryFn);
      
      expect(queryOptions).toBeDefined();
    } catch (error) {
      console.error('queryOptions test failed:', error);
      throw error;
    }
  });
});