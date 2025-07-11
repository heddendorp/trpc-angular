import type {
  DataTag,
  QueryClient,
  QueryFilters,
} from '@tanstack/angular-query-experimental';
import type {
  TRPCClient,
  TRPCClientErrorLike,
  TRPCRequestOptions,
} from '@trpc/client';
import { getUntypedClient, type TRPCUntypedClient } from '@trpc/client';
import type {
  AnyTRPCProcedure,
  AnyTRPCRootTypes,
  AnyTRPCRouter,
  inferProcedureInput,
  inferRouterContext,
  inferTransformedProcedureOutput,
  TRPCProcedureType,
  TRPCRouterRecord,
} from '@trpc/server';
import { callTRPCProcedure, createTRPCRecursiveProxy } from '@trpc/server';
import type { MaybePromise } from '@trpc/server/unstable-core-do-not-import';
import {
  trpcInfiniteQueryOptions,
  type TRPCInfiniteQueryOptions,
} from './infiniteQueryOptions';
import type { MutationOptionsOverride } from './mutationOptions';
import {
  trpcMutationOptions,
  type TRPCMutationOptions,
} from './mutationOptions';
import { trpcQueryOptions, type TRPCQueryOptions } from './queryOptions';
import {
  trpcSubscriptionOptions,
  type TRPCSubscriptionOptions,
} from './subscriptionOptions';
import type {
  OptionalCursorInput,
  ResolverDef,
  TRPCInfiniteData,
  TRPCMutationKey,
  TRPCQueryKey,
  WithRequired,
} from './types';
import { getMutationKeyInternal, getQueryKeyInternal } from './utils';

export interface DecorateRouterKeyable {
  /**
   * Calculate the TanStack Query Key for any path, could be used to invalidate every procedure beneath this path
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/query-keys
   */
  pathKey: () => TRPCQueryKey;

  /**
   * Calculate a TanStack Query Filter for any path, could be used to manipulate every procedure beneath this path
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/filters
   */
  pathFilter: (
    filters?: QueryFilters<TRPCQueryKey>,
  ) => WithRequired<QueryFilters<TRPCQueryKey>, 'queryKey'>;
}

interface TypeHelper<TDef extends ResolverDef> {
  /**
   * @internal prefer using inferInput and inferOutput to access types
   */
  '~types': {
    input: TDef['input'];
    output: TDef['output'];
    errorShape: TDef['errorShape'];
  };
}

export type inferInput<
  TProcedure extends
    | DecorateInfiniteQueryProcedure<any>
    | DecorateQueryProcedure<any>
    | DecorateMutationProcedure<any>,
> = TProcedure['~types']['input'];

export type inferOutput<
  TProcedure extends
    | DecorateInfiniteQueryProcedure<any>
    | DecorateQueryProcedure<any>
    | DecorateMutationProcedure<any>,
> = TProcedure['~types']['output'];

export interface DecorateInfiniteQueryProcedure<TDef extends ResolverDef>
  extends TypeHelper<TDef> {
  /**
   * Create a set of type-safe infinite query options that can be passed to `injectInfiniteQuery`, `prefetchInfiniteQuery` etc.
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/reference/infiniteQueryOptions#infinitequeryoptions

   */
  infiniteQueryOptions: TRPCInfiniteQueryOptions<TDef>;

  /**
   * Calculate the TanStack Query Key for a Infinite Query Procedure
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/query-keys

   */
  infiniteQueryKey: (input?: Partial<TDef['input']>) => DataTag<
    TRPCQueryKey,
    TRPCInfiniteData<TDef['input'], TDef['output']>,
    TRPCClientErrorLike<{
      transformer: TDef['transformer'];
      errorShape: TDef['errorShape'];
    }>
  >;

  /**
   * Calculate a TanStack Query Filter for a Infinite Query Procedure
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/filters

   */
  infiniteQueryFilter: (
    input?: Partial<TDef['input']>,
    filters?: QueryFilters<
      DataTag<
        TRPCQueryKey,
        TRPCInfiniteData<TDef['input'], TDef['output']>,
        TRPCClientErrorLike<{
          transformer: TDef['transformer'];
          errorShape: TDef['errorShape'];
        }>
      >
    >,
  ) => WithRequired<
    QueryFilters<
      DataTag<
        TRPCQueryKey,
        TRPCInfiniteData<TDef['input'], TDef['output']>,
        TRPCClientErrorLike<{
          transformer: TDef['transformer'];
          errorShape: TDef['errorShape'];
        }>
      >
    >,
    'queryKey'
  >;
}

export interface DecorateQueryProcedure<TDef extends ResolverDef>
  extends TypeHelper<TDef>,
    DecorateRouterKeyable {
  /**
   * Create a set of type-safe query options that can be passed to `injectQuery`, `prefetchQuery` etc.
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/reference/queryOptions#queryoptions

   */
  queryOptions: TRPCQueryOptions<TDef>;

  /**
   * Calculate the TanStack Query Key for a Query Procedure
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/query-keys

   */
  queryKey: (input?: Partial<TDef['input']>) => DataTag<
    TRPCQueryKey,
    TDef['output'],
    TRPCClientErrorLike<{
      transformer: TDef['transformer'];
      errorShape: TDef['errorShape'];
    }>
  >;

  /**
   * Calculate a TanStack Query Filter for a Query Procedure
   *
   * @see https://tanstack.com/query/latest/docs/framework/angular/guides/filters

   */
  queryFilter: (
    input?: Partial<TDef['input']>,
    filters?: QueryFilters<
      DataTag<
        TRPCQueryKey,
        TDef['output'],
        TRPCClientErrorLike<{
          transformer: TDef['transformer'];
          errorShape: TDef['errorShape'];
        }>
      >
    >,
  ) => WithRequired<
    QueryFilters<
      DataTag<
        TRPCQueryKey,
        TDef['output'],
        TRPCClientErrorLike<{
          transformer: TDef['transformer'];
          errorShape: TDef['errorShape'];
        }>
      >
    >,
    'queryKey'
  >;
}

export interface DecorateMutationProcedure<TDef extends ResolverDef>
  extends TypeHelper<TDef> {
  /**
   * Create a set of type-safe mutation options that can be passed to `injectMutation`
   *

   */
  mutationOptions: TRPCMutationOptions<TDef>;

  /**
   * Calculate the TanStack Mutation Key for a Mutation Procedure
   *

   */
  mutationKey: () => TRPCMutationKey;
}

export interface DecorateSubscriptionProcedure<TDef extends ResolverDef> {
  /**
   * Create a set of type-safe subscription options that can be passed to `injectTRPCSubscription`
   *

   */
  subscriptionOptions: TRPCSubscriptionOptions<TDef>;
}

export type DecorateProcedure<
  TType extends TRPCProcedureType,
  TDef extends ResolverDef,
> = TType extends 'query'
  ? DecorateQueryProcedure<TDef> &
      (TDef['input'] extends OptionalCursorInput
        ? DecorateInfiniteQueryProcedure<TDef>
        : Record<string, never>)
  : TType extends 'mutation'
    ? DecorateMutationProcedure<TDef>
    : TType extends 'subscription'
      ? DecorateSubscriptionProcedure<TDef>
      : never;

/**
 * @internal
 */
export type DecoratedRouterRecord<
  TRoot extends AnyTRPCRootTypes,
  TRecord extends TRPCRouterRecord,
> = {
  [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
    ? $Value extends TRPCRouterRecord
      ? DecoratedRouterRecord<TRoot, $Value> & DecorateRouterKeyable
      : $Value extends AnyTRPCProcedure
        ? DecorateProcedure<
            $Value['_def']['type'],
            {
              input: inferProcedureInput<$Value>;
              output: inferTransformedProcedureOutput<TRoot, $Value>;
              transformer: TRoot['transformer'];
              errorShape: TRoot['errorShape'];
            }
          >
        : never
    : never;
};

export type TRPCOptionsProxy<TRouter extends AnyTRPCRouter> =
  DecoratedRouterRecord<
    TRouter['_def']['_config']['$types'],
    TRouter['_def']['record']
  > &
    DecorateRouterKeyable;

export interface TRPCOptionsProxyOptionsBase {
  queryClient: QueryClient;
  overrides?: {
    mutations?: MutationOptionsOverride;
  };
}

export interface TRPCOptionsProxyOptionsInternal<
  TRouter extends AnyTRPCRouter,
> {
  router: TRouter;
  ctx:
    | inferRouterContext<TRouter>
    | (() => MaybePromise<inferRouterContext<TRouter>>);
}

export interface TRPCOptionsProxyOptionsExternal<
  TRouter extends AnyTRPCRouter,
> {
  client: TRPCUntypedClient<TRouter> | TRPCClient<TRouter>;
}

export type TRPCOptionsProxyOptions<TRouter extends AnyTRPCRouter> =
  TRPCOptionsProxyOptionsBase &
    (
      | TRPCOptionsProxyOptionsInternal<TRouter>
      | TRPCOptionsProxyOptionsExternal<TRouter>
    );

/**
 * Create a tRPC options proxy for Angular applications
 *

 */
export function createTRPCOptionsProxy<TRouter extends AnyTRPCRouter>(
  opts: TRPCOptionsProxyOptions<TRouter>,
): TRPCOptionsProxy<TRouter> {
  const { queryClient } = opts;

  const client = (() => {
    if ('client' in opts) {
      return getUntypedClient(opts.client);
    }

    return {
      query: (path: string, input: unknown, options?: TRPCRequestOptions) => {
        return callTRPCProcedure({
          path,
          input,
          router: opts.router,
          ctx: typeof opts.ctx === 'function' ? opts.ctx() : opts.ctx,
          type: 'query',
          signal: options?.signal,
        });
      },
      mutation: (
        path: string,
        input: unknown,
        options?: TRPCRequestOptions,
      ) => {
        return callTRPCProcedure({
          path,
          input,
          router: opts.router,
          ctx: typeof opts.ctx === 'function' ? opts.ctx() : opts.ctx,
          type: 'mutation',
          signal: options?.signal,
        });
      },
      subscription: (
        path: string,
        input: unknown,
        options?: TRPCRequestOptions,
      ) => {
        return callTRPCProcedure({
          path,
          input,
          router: opts.router,
          ctx: typeof opts.ctx === 'function' ? opts.ctx() : opts.ctx,
          type: 'subscription',
          signal: options?.signal,
        });
      },
    } as TRPCUntypedClient<TRouter>;
  })();

  return createTRPCRecursiveProxy(({ path, args }) => {
    const pathCopy = [...path];
    const lastPart = pathCopy.pop();

    if (!lastPart) {
      throw new Error('Invalid path');
    }

    const input = args[0];
    const opts = args[1];

    const queryKey = getQueryKeyInternal(pathCopy, input, 'query');
    const mutationKey = getMutationKeyInternal(pathCopy);

    if (lastPart === 'queryOptions') {
      const queryFn = client.query.bind(client);
      return trpcQueryOptions({
        input,
        query: queryFn,
        queryClient,
        path: pathCopy,
        queryKey,
        opts,
      });
    }

    if (lastPart === 'infiniteQueryOptions') {
      const queryFn = client.query.bind(client);
      return trpcInfiniteQueryOptions({
        input,
        query: queryFn,
        queryClient,
        path: pathCopy,
        queryKey: getQueryKeyInternal(pathCopy, input, 'infinite'),
        opts,
      });
    }

    if (lastPart === 'mutationOptions') {
      const mutateFn = client.mutation.bind(client);
      return trpcMutationOptions({
        mutate: mutateFn,
        queryClient,
        path: pathCopy,
        mutationKey,
        opts,
      });
    }

    if (lastPart === 'subscriptionOptions') {
      const subscribeFn = client.subscription.bind(client);
      return trpcSubscriptionOptions({
        input,
        subscribe: subscribeFn,
        path: pathCopy,
        queryKey,
        opts,
      });
    }

    if (lastPart === 'queryKey') {
      return getQueryKeyInternal(pathCopy, input, 'query');
    }

    if (lastPart === 'infiniteQueryKey') {
      return getQueryKeyInternal(pathCopy, input, 'infinite');
    }

    if (lastPart === 'mutationKey') {
      return getMutationKeyInternal(pathCopy);
    }

    if (lastPart === 'queryFilter') {
      return {
        ...opts,
        queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
      };
    }

    if (lastPart === 'infiniteQueryFilter') {
      return {
        ...opts,
        queryKey: getQueryKeyInternal(pathCopy, input, 'infinite'),
      };
    }

    if (lastPart === 'pathKey') {
      return getQueryKeyInternal(pathCopy, undefined, 'any');
    }

    if (lastPart === 'pathFilter') {
      return {
        ...input,
        queryKey: getQueryKeyInternal(pathCopy, undefined, 'any'),
      };
    }

    // If we reach here, continue building the path
    return createTRPCRecursiveProxy(({ path: nextPath, args: nextArgs }) => {
      return createTRPCOptionsProxy(opts)({
        path: [...path, ...nextPath],
        args: nextArgs,
      });
    });
  });
}
