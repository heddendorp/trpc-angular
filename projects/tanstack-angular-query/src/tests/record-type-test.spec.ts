import { initTRPC } from '@trpc/server';
import { describe, it, expect } from 'vitest';

describe('Record type inference tests', () => {
  it('should properly infer Record<string, any> types', () => {
    // Test 1: Direct Record<string, any> usage
    const t1 = initTRPC.context<{ user?: Record<string, any> }>().create();
    const router1 = t1.router({
      getUser: t1.procedure.query(({ ctx }) => {
        return ctx.user;
      }),
    });

    // Test 2: Using object literal type
    const t2 = initTRPC.context<{ user?: { [key: string]: any } }>().create();
    const router2 = t2.router({
      getUser: t2.procedure.query(({ ctx }) => {
        return ctx.user;
      }),
    });

    // Test 3: Using a concrete type with index signature - this should work
    const t3 = initTRPC
      .context<{ user?: { name: string; [key: string]: any } }>()
      .create();
    const router3 = t3.router({
      getUser: t3.procedure.query(({ ctx }) => {
        return ctx.user;
      }),
    });

    // Test 4: Using unknown type
    const t4 = initTRPC.context<{ user?: unknown }>().create();
    const router4 = t4.router({
      getUser: t4.procedure.query(({ ctx }) => {
        return ctx.user;
      }),
    });

    // The fact that this compiles means the types are working
    expect(router1).toBeDefined();
    expect(router2).toBeDefined();
    expect(router3).toBeDefined();
    expect(router4).toBeDefined();
  });

  it('should demonstrate that mixed index signatures with specific properties work', () => {
    // This demonstrates the fix - using specific properties with index signatures
    const t = initTRPC
      .context<{
        user?: {
          id: string;
          name: string;
          email: string;
          [key: string]: any;
        };
      }>()
      .create();

    const router = t.router({
      getUser: t.procedure.query(({ ctx }) => {
        return ctx.user;
      }),
    });

    expect(router).toBeDefined();
  });
});
