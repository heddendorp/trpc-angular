import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { createTRPCOptionsProxy } from '../lib/createOptionsProxy';

describe('Basic tanstack-angular-query tests', () => {
  it('should create a QueryClient', () => {
    const queryClient = new QueryClient();
    expect(queryClient).toBeDefined();
  });

  it('should import createTRPCOptionsProxy', () => {
    expect(createTRPCOptionsProxy).toBeDefined();
    expect(typeof createTRPCOptionsProxy).toBe('function');
  });
});
