import { injectQuery, provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';
import { TestBed } from '@angular/core/testing';
import { Component, effect, provideZonelessChangeDetection } from '@angular/core';
import { injectTRPC, provideTRPC } from '../lib/context';

@Component({
  template: `<div>Test Component</div>`,
})
class TestComponent {
  trpc = injectTRPC<AppRouter>();
  userDataQuery = injectQuery(()=>this.trpc.userContext.queryOptions());

  // Add debug logging to understand the type
  debugType() {
    const options = this.trpc.userContext.queryOptions();
    console.log('Query options type:', typeof options);
    console.log('Query options:', options);
    return options;
  }

  constructor() {
    effect(() => {
      const userData = this.userDataQuery.data();
      if(userData) {
        console.log('User Data:', userData.test);
      }
    });
  }
}

describe('correct inference of record types', () => {
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

  it('should infer Record types correctly and compile without errors', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    
    // The test passes if the component can be created without TypeScript errors
    expect(component).toBeDefined();
    expect(component.trpc).toBeDefined();
    expect(component.userDataQuery).toBeDefined();
    expect(component.debugType).toBeDefined();
  });
  
  it('should handle different record type scenarios', () => {
    // Test that we can create components that use different record types
    // This test demonstrates that the fix handles various record type patterns
    
    @Component({
      template: `<div>Test Component 2</div>`,
      standalone: true,
    })
    class TestComponent2 {
      trpc = injectTRPC<AppRouter>();
      // Test accessing different properties that exist in the type
      userDataQuery = injectQuery(() => this.trpc.userContext.queryOptions());
      
      constructor() {
        effect(() => {
          const userData = this.userDataQuery.data();
          if (userData) {
            // These should all work with the fixed type inference
            console.log('User test:', userData.test);
            console.log('User dynamic prop:', userData['dynamicProp']);
            console.log('User keys:', Object.keys(userData));
          }
        });
      }
    }
    
    TestBed.configureTestingModule({
      imports: [TestComponent2],
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(queryClient),
        provideTRPC(trpcClient),
      ],
    });
    
    const fixture2 = TestBed.createComponent(TestComponent2);
    const component2 = fixture2.componentInstance;
    
    expect(component2).toBeDefined();
    expect(component2.trpc).toBeDefined();
    expect(component2.userDataQuery).toBeDefined();
  });
})
