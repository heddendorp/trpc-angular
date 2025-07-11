import { createTRPCInjectors } from '@trpc/tanstack-angular-query';
import type { AppRouter } from './server/router';

/**
 * Typed tRPC injection functions for your application.
 * Import these in your components to get automatic type inference.
 */
export const { injectTRPC, injectTRPCClient } =
  createTRPCInjectors<AppRouter>();
