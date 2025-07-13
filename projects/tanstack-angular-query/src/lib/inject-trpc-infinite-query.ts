import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import type { AnyTRPCRouter } from '@trpc/server';
import type { TRPCOptionsProxy } from './createOptionsProxy';
import { injectTRPC } from './context';

/**
 * Inject a tRPC infinite query with automatic type inference
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   infiniteQuery = injectTRPCInfiniteQuery<AppRouter>((trpc) => 
 *     trpc.posts.list.infiniteQueryOptions(
 *       { limit: 10 },
 *       { getNextPageParam: (lastPage) => lastPage.nextCursor }
 *     )
 *   );
 * }
 * ```
 */
export function injectTRPCInfiniteQuery<TRouter extends AnyTRPCRouter>(
  optionsFn: (trpc: TRPCOptionsProxy<TRouter>) => any
) {
  const trpc = injectTRPC<TRouter>();
  return injectInfiniteQuery(() => optionsFn(trpc));
}