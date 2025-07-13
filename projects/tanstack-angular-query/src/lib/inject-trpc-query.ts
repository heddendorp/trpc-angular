import { injectQuery } from '@tanstack/angular-query-experimental';
import type { AnyTRPCRouter } from '@trpc/server';
import type { TRPCOptionsProxy } from './createOptionsProxy';
import { injectTRPC } from './context';

/**
 * Inject a tRPC query with automatic type inference
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   userQuery = injectTRPCQuery<AppRouter>((trpc) => 
 *     trpc.user.get.queryOptions({ id: 1 })
 *   );
 * }
 * ```
 */
export function injectTRPCQuery<TRouter extends AnyTRPCRouter>(
  optionsFn: (trpc: TRPCOptionsProxy<TRouter>) => any
) {
  const trpc = injectTRPC<TRouter>();
  return injectQuery(() => optionsFn(trpc));
}