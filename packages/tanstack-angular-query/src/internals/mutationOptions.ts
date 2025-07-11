import type {
  MutationFunction,
  QueryClient,
  CreateMutationOptions,
} from '@tanstack/angular-query-experimental';
import type { TRPCClientErrorLike, TRPCUntypedClient } from '@trpc/client';
import type {
  DistributiveOmit,
  MaybePromise,
} from '@trpc/server/unstable-core-do-not-import';
import type {
  ResolverDef,
  TRPCMutationKey,
  TRPCQueryBaseOptions,
  TRPCQueryOptionsResult,
} from './types';
import { createTRPCOptionsResult, getClientArgs } from './utils';

type ReservedOptions = 'mutationKey' | 'mutationFn';

interface TRPCMutationOptionsIn<TInput, TError, TOutput, TContext>
  extends DistributiveOmit<
      CreateMutationOptions<TOutput, TError, TInput, TContext>,
      ReservedOptions
    >,
    TRPCQueryBaseOptions {}

interface TRPCMutationOptionsOut<TInput, TError, TOutput, TContext>
  extends CreateMutationOptions<TOutput, TError, TInput, TContext>,
    TRPCQueryOptionsResult {
  mutationKey: TRPCMutationKey;
}

export interface TRPCMutationOptions<TDef extends ResolverDef> {
  <TContext = unknown>(
    opts?: TRPCMutationOptionsIn<
      TDef['input'],
      TRPCClientErrorLike<TDef>,
      TDef['output'],
      TContext
    >,
  ): TRPCMutationOptionsOut<
    TDef['input'],
    TRPCClientErrorLike<TDef>,
    TDef['output'],
    TContext
  >;
}

/**
 * @internal
 */
export interface MutationOptionsOverride {
  onSuccess: (opts: {
    /**
     * Calls the original function that was defined in the query's `onSuccess` option
     */
    originalFn: () => MaybePromise<void>;
    queryClient: QueryClient;
    /**
     * Meta data passed in from the `injectMutation()` hook
     */
    meta: Record<string, unknown>;
  }) => MaybePromise<void>;
}

type AnyTRPCMutationOptionsIn = TRPCMutationOptionsIn<
  unknown,
  unknown,
  unknown,
  unknown
>;

type AnyTRPCMutationOptionsOut = TRPCMutationOptionsOut<
  unknown,
  unknown,
  unknown,
  unknown
>;

/**
 * @internal
 */
export function trpcMutationOptions(args: {
  mutate: typeof TRPCUntypedClient.prototype.mutation;
  queryClient: QueryClient;
  path: readonly string[];
  mutationKey: TRPCMutationKey;
  opts?: AnyTRPCMutationOptionsIn;
}): AnyTRPCMutationOptionsOut {
  const { mutate, path, mutationKey, opts } = args;

  const mutationFn: MutationFunction<unknown, unknown> = async (input) => {
    const actualOpts = {
      ...opts,
      trpc: {
        ...opts?.trpc,
      },
    };

    const actualArgs = getClientArgs(
      [path, { input, type: undefined }],
      actualOpts,
    );

    return await mutate(...actualArgs);
  };

  return Object.assign(
    {
      ...opts,
      mutationKey,
      mutationFn,
    },
    { trpc: createTRPCOptionsResult({ path }) },
  );
}
