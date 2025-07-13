/*
 * Public API Surface of tanstack-angular-query
 */

export {
  provideTRPC,
  createTRPCClientFactory,
  injectTRPC,
  injectTRPCClient,
  createTRPCInjectors,
} from './lib/context';
export type { TRPCClientFactory } from './lib/context';
export type {
  TRPCOptionsProxy,
  inferInput,
  inferOutput,
  DecorateMutationProcedure,
  DecorateProcedure,
  DecorateRouterKeyable,
  DecorateQueryProcedure,
  DecorateSubscriptionProcedure,
} from './lib/createOptionsProxy';
export type { TRPCQueryOptions } from './lib/queryOptions';
export type { TRPCInfiniteQueryOptions } from './lib/infiniteQueryOptions';
export type { TRPCMutationOptions } from './lib/mutationOptions';
export type {
  TRPCSubscriptionOptions,
  TRPCSubscriptionStatus,
  TRPCSubscriptionConnectingResult,
  TRPCSubscriptionErrorResult,
  TRPCSubscriptionIdleResult,
  TRPCSubscriptionPendingResult,
  TRPCSubscriptionResult,
} from './lib/subscriptionOptions';
export { createTRPCOptionsProxy } from './lib/createOptionsProxy';
export { injectTRPCSubscription } from './lib/subscriptionOptions';
export { injectTRPCQuery } from './lib/inject-trpc-query';
export { injectTRPCMutation } from './lib/inject-trpc-mutation';
export { injectTRPCInfiniteQuery } from './lib/inject-trpc-infinite-query';
export type * from './lib/types';
