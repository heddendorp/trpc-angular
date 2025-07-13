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

describe('QueryOptions Function Test', () => {
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

  it('should test what happens when calling queryOptions as a function', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }
    
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Test what happens when we call queryOptions()
    const queryOptions = component.trpc.hello.queryOptions();
    console.log('queryOptions is function:', typeof queryOptions === 'function');
    
    // Test what happens when we call the function
    if (typeof queryOptions === 'function') {
      const result = queryOptions();
      console.log('queryOptions() result:', result);
      console.log('queryOptions() result type:', typeof result);
      console.log('queryOptions() result keys:', Object.keys(result));
    }
    
    expect(queryOptions).toBeDefined();
  });

  it('should show detailed behavior with injectQuery', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
      
      // Test both patterns
      workingQuery = injectQuery(() => this.trpc.hello.queryOptions());
      
      testDirectUsage() {
        const options = this.trpc.hello.queryOptions();
        console.log('Direct options type:', typeof options);
        console.log('Direct options callable:', typeof options === 'function');
        
        try {
          const directQuery = injectQuery(options);
          console.log('Direct injectQuery succeeded');
          return directQuery;
        } catch (error) {
          console.error('Direct injectQuery failed:', error);
          throw error;
        }
      }
    }
    
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // Test the working pattern
    expect(component.workingQuery).toBeDefined();
    
    // Test the direct pattern
    expect(() => component.testDirectUsage()).not.toThrow();
  });
});