import type { QueryClient } from '@tanstack/angular-query-experimental';
import { QueryClient as QueryClientService } from '@tanstack/angular-query-experimental';
import type { TRPCClient } from '@trpc/client';
import type { AnyTRPCRouter } from '@trpc/server';
import {
  InjectionToken,
  inject,
  Injectable,
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import type { TRPCOptionsProxy } from './createOptionsProxy';
import { createTRPCOptionsProxy } from './createOptionsProxy';

export const TRPC_CLIENT = new InjectionToken<TRPCClient<AnyTRPCRouter>>(
  'TRPC_CLIENT',
);
export const TRPC_OPTIONS_PROXY = new InjectionToken<
  TRPCOptionsProxy<AnyTRPCRouter>
>('TRPC_OPTIONS_PROXY');

/**
 * Factory function marker interface
 */
export interface TRPCClientFactory<TRouter extends AnyTRPCRouter> {
  (): TRPCClient<TRouter>;
  __isTRPCClientFactory?: boolean;
}

/**
 * Creates a factory function that can be used with provideTRPC
 */
export function createTRPCClientFactory<TRouter extends AnyTRPCRouter>(
  factory: () => TRPCClient<TRouter>
): TRPCClientFactory<TRouter> {
  const factoryFn = factory as TRPCClientFactory<TRouter>;
  factoryFn.__isTRPCClientFactory = true;
  return factoryFn;
}

/**
 * Provides tRPC client and options proxy for Angular applications
 *
 * @param clientOrFactory - Either a pre-created tRPC client or a factory function that creates one
 * @param queryClient - Optional query client instance
 */
export function provideTRPC<TRouter extends AnyTRPCRouter>(
  clientOrFactory: TRPCClient<TRouter> | TRPCClientFactory<TRouter>,
  queryClient?: QueryClient,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TRPC_CLIENT,
      useFactory: () => {
        const isFactory = (clientOrFactory as any).__isTRPCClientFactory === true;
        
        if (isFactory) {
          return (clientOrFactory as TRPCClientFactory<TRouter>)();
        }
        return clientOrFactory as TRPCClient<TRouter>;
      },
    },
    {
      provide: TRPC_OPTIONS_PROXY,
      useFactory: (client: TRPCClient<TRouter>) => {
        if (!client) {
          throw new Error('TRPCClient is undefined. Check your provideTRPC configuration.');
        }
        const qc = queryClient ?? inject(QueryClientService);
        return createTRPCOptionsProxy({
          client,
          queryClient: qc,
        });
      },
      deps: [TRPC_CLIENT],
    },
  ]);
}

/**
 * Service to inject tRPC client and options proxy
 */
@Injectable({
  providedIn: 'root',
})
export class TRPCService<TRouter extends AnyTRPCRouter = AnyTRPCRouter> {
  private readonly client = inject(TRPC_CLIENT) as TRPCClient<TRouter>;
  private readonly optionsProxy = inject(
    TRPC_OPTIONS_PROXY,
  ) as TRPCOptionsProxy<TRouter>;

  /**
   * Get the tRPC client instance
   */
  getClient(): TRPCClient<TRouter> {
    return this.client;
  }

  /**
   * Get the tRPC options proxy for queries, mutations, and subscriptions
   */
  getOptionsProxy(): TRPCOptionsProxy<TRouter> {
    return this.optionsProxy;
  }
}

/**
 * Inject tRPC client directly
 */
export function injectTRPCClient<
  TRouter extends AnyTRPCRouter = AnyTRPCRouter,
>(): TRPCClient<TRouter> {
  return inject(TRPC_CLIENT) as TRPCClient<TRouter>;
}

/**
 * Inject tRPC options proxy for queries, mutations, and subscriptions
 */
export function injectTRPC<
  TRouter extends AnyTRPCRouter = AnyTRPCRouter,
>(): TRPCOptionsProxy<TRouter> {
  return inject(TRPC_OPTIONS_PROXY) as TRPCOptionsProxy<TRouter>;
}

/**
 * Create typed injection functions for a specific router type.
 * This allows you to avoid specifying the router type in every component.
 *
 * @example
 * ```typescript
 * // In a shared file (e.g., trpc.ts)
 * const { injectTRPC, injectTRPCClient } = createTRPCInjectors<AppRouter>();
 *
 * // In components
 * export class MyComponent {
 *   private trpc = injectTRPC(); // Automatically typed with AppRouter
 * }
 * ```
 */
export function createTRPCInjectors<TRouter extends AnyTRPCRouter>() {
  return {
    /**
     * Inject tRPC options proxy with router type automatically inferred
     */
    injectTRPC: (): TRPCOptionsProxy<TRouter> => {
      return inject(TRPC_OPTIONS_PROXY) as TRPCOptionsProxy<TRouter>;
    },

    /**
     * Inject tRPC client with router type automatically inferred
     */
    injectTRPCClient: (): TRPCClient<TRouter> => {
      return inject(TRPC_CLIENT) as TRPCClient<TRouter>;
    },
  };
}
