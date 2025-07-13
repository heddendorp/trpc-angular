import { injectMutation } from '@tanstack/angular-query-experimental';
import type { AnyTRPCRouter } from '@trpc/server';
import type { TRPCOptionsProxy } from './createOptionsProxy';
import { injectTRPC } from './context';

/**
 * Inject a tRPC mutation with automatic type inference
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   createUserMutation = injectTRPCMutation<AppRouter>((trpc) => 
 *     trpc.user.create.mutationOptions()
 *   );
 * }
 * ```
 */
export function injectTRPCMutation<TRouter extends AnyTRPCRouter>(
  optionsFn: (trpc: TRPCOptionsProxy<TRouter>) => any
) {
  const trpc = injectTRPC<TRouter>();
  return injectMutation(() => optionsFn(trpc));
}