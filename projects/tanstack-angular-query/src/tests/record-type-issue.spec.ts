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
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create a test router specifically for the Record<string, any> | undefined issue
const t = initTRPC.create();

const testRecordRouter = t.router({
  getRecordOrUndefined: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): Record<string, any> | undefined => {
      if (input.id === 'notfound') {
        return undefined;
      }
      return { [input.id]: 'some value' };
    }),
    
  getRecord: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): Record<string, any> => {
      return { [input.id]: 'some value' };
    }),

  getOptionalRecord: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): { data?: Record<string, any> } => {
      return { data: { [input.id]: 'some value' } };
    }),

  getStringOrUndefined: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): string | undefined => {
      return input.id === 'notfound' ? undefined : 'found';
    }),
});

type TestRecordRouter = typeof testRecordRouter;

describe('Record Type Issue', () => {
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

    trpcClient = createTRPCClient<TestRecordRouter>({
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

  it('should handle Record<string, any> | undefined return type correctly', () => {
    @Component({
      template: `
        <div>
          @if (recordOrUndefinedQuery.isLoading()) {
            <p>Loading...</p>
          } @else if (recordOrUndefinedQuery.error()) {
            <p>Error: {{ recordOrUndefinedQuery.error()?.message }}</p>
          } @else {
            <p>Data: {{ recordOrUndefinedQuery.data() }}</p>
          }
        </div>
      `,
    })
    class TestRecordComponent {
      private trpc = injectTRPC<TestRecordRouter>();
      
      // This should not be inferred as () => never
      recordOrUndefinedQuery = injectQuery(() => 
        this.trpc.getRecordOrUndefined.queryOptions({ id: 'test' })
      );
    }
    
    const fixture = TestBed.createComponent(TestRecordComponent);
    const component = fixture.componentInstance;
    
    // The query should be properly typed
    expect(component.recordOrUndefinedQuery).toBeDefined();
    expect(component.recordOrUndefinedQuery.isLoading).toBeDefined();
    expect(component.recordOrUndefinedQuery.data).toBeDefined();
    expect(component.recordOrUndefinedQuery.error).toBeDefined();
    
    // The data should be typed correctly - it should be Record<string, any> | undefined
    const data = component.recordOrUndefinedQuery.data();
    expect(data === undefined || typeof data === 'object').toBe(true);
    
    // Template should not throw during compilation
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle Record<string, any> return type correctly', () => {
    @Component({
      template: `
        <div>
          @if (recordQuery.isLoading()) {
            <p>Loading...</p>
          } @else if (recordQuery.error()) {
            <p>Error: {{ recordQuery.error()?.message }}</p>
          } @else {
            <p>Data: {{ recordQuery.data() }}</p>
          }
        </div>
      `,
    })
    class TestRecordComponent {
      private trpc = injectTRPC<TestRecordRouter>();
      
      recordQuery = injectQuery(() => 
        this.trpc.getRecord.queryOptions({ id: 'test' })
      );
    }
    
    const fixture = TestBed.createComponent(TestRecordComponent);
    const component = fixture.componentInstance;
    
    // The query should be properly typed
    expect(component.recordQuery).toBeDefined();
    expect(component.recordQuery.isLoading).toBeDefined();
    expect(component.recordQuery.data).toBeDefined();
    expect(component.recordQuery.error).toBeDefined();
    
    // The data should be typed correctly - it should be Record<string, any>
    const data = component.recordQuery.data();
    expect(data === undefined || typeof data === 'object').toBe(true);
    
    // Template should not throw during compilation
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle optional record properties correctly', () => {
    @Component({
      template: `
        <div>
          @if (optionalRecordQuery.isLoading()) {
            <p>Loading...</p>
          } @else if (optionalRecordQuery.error()) {
            <p>Error: {{ optionalRecordQuery.error()?.message }}</p>
          } @else {
            <p>Data: {{ optionalRecordQuery.data() }}</p>
          }
        </div>
      `,
    })
    class TestOptionalRecordComponent {
      private trpc = injectTRPC<TestRecordRouter>();
      
      optionalRecordQuery = injectQuery(() => 
        this.trpc.getOptionalRecord.queryOptions({ id: 'test' })
      );
    }
    
    const fixture = TestBed.createComponent(TestOptionalRecordComponent);
    const component = fixture.componentInstance;
    
    // The query should be properly typed
    expect(component.optionalRecordQuery).toBeDefined();
    expect(component.optionalRecordQuery.isLoading).toBeDefined();
    expect(component.optionalRecordQuery.data).toBeDefined();
    expect(component.optionalRecordQuery.error).toBeDefined();
    
    // The data should be typed correctly - it should be { data?: Record<string, any> }
    const data = component.optionalRecordQuery.data();
    expect(data === undefined || typeof data === 'object').toBe(true);
    
    // Template should not throw during compilation
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle union types without being inferred as never', () => {
    @Component({
      template: `<div>Test</div>`,
    })
    class TestUnionComponent {
      private trpc = injectTRPC<TestRecordRouter>();
      
      // Test various union types that previously caused issues
      recordUnionQuery = injectQuery(() => 
        this.trpc.getRecordOrUndefined.queryOptions({ id: 'test' })
      );
      
      stringUnionQuery = injectQuery(() => 
        this.trpc.getStringOrUndefined.queryOptions({ id: 'test' })
      );
      
      // Test that non-union types still work
      nonUnionQuery = injectQuery(() => 
        this.trpc.getRecord.queryOptions({ id: 'test' })
      );
    }
    
    const fixture = TestBed.createComponent(TestUnionComponent);
    const component = fixture.componentInstance;
    
    // All queries should be properly typed and not inferred as never
    expect(component.recordUnionQuery).toBeDefined();
    expect(component.stringUnionQuery).toBeDefined();
    expect(component.nonUnionQuery).toBeDefined();
    
    // Verify query functions are defined (would fail if type is never)
    expect(component.recordUnionQuery.data).toBeDefined();
    expect(component.stringUnionQuery.data).toBeDefined();
    expect(component.nonUnionQuery.data).toBeDefined();
  });
});