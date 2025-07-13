import { skipToken } from '@tanstack/angular-query-experimental';
import type { TRPCClientErrorLike, TRPCUntypedClient } from '@trpc/client';
import type { TRPCConnectionState } from '@trpc/client/unstable-internals';
import type { Unsubscribable } from '@trpc/server/observable';
import type { inferAsyncIterableYield } from '@trpc/server/unstable-core-do-not-import';
import { inject, signal, effect, Injector, DestroyRef } from '@angular/core';
import type {
  ResolverDef,
  TRPCQueryKey,
  TRPCQueryOptionsResult,
} from './types';
import { createTRPCOptionsResult } from './utils';

interface BaseTRPCSubscriptionOptionsIn<TOutput, TError> {
  enabled?: boolean;
  onStarted?: () => void;
  onData?: (data: inferAsyncIterableYield<TOutput>) => void;
  onError?: (err: TError) => void;
  onConnectionStateChange?: (state: TRPCConnectionState<TError>) => void;
}

interface UnusedSkipTokenTRPCSubscriptionOptionsIn<TOutput, TError> {
  onStarted?: () => void;
  onData?: (data: inferAsyncIterableYield<TOutput>) => void;
  onError?: (err: TError) => void;
  onConnectionStateChange?: (state: TRPCConnectionState<TError>) => void;
}

interface TRPCSubscriptionOptionsOut<TOutput, TError>
  extends UnusedSkipTokenTRPCSubscriptionOptionsIn<TOutput, TError>,
    TRPCQueryOptionsResult {
  enabled: boolean;
  queryKey: TRPCQueryKey;
  subscribe: (
    innerOpts: UnusedSkipTokenTRPCSubscriptionOptionsIn<TOutput, TError>,
  ) => Unsubscribable;
}

export interface TRPCSubscriptionOptions<TDef extends ResolverDef> {
  (
    input: TDef['input'],
    opts?: UnusedSkipTokenTRPCSubscriptionOptionsIn<
      inferAsyncIterableYield<TDef['output']>,
      TRPCClientErrorLike<TDef>
    >,
  ): TRPCSubscriptionOptionsOut<
    inferAsyncIterableYield<TDef['output']>,
    TRPCClientErrorLike<TDef>
  >;
  (
    input: TDef['input'],
    opts?: BaseTRPCSubscriptionOptionsIn<
      inferAsyncIterableYield<TDef['output']>,
      TRPCClientErrorLike<TDef>
    >,
  ): TRPCSubscriptionOptionsOut<
    inferAsyncIterableYield<TDef['output']>,
    TRPCClientErrorLike<TDef>
  >;
}

export type TRPCSubscriptionStatus =
  | 'idle'
  | 'connecting'
  | 'pending'
  | 'error';

export interface TRPCSubscriptionBaseResult<TOutput, TError> {
  status: TRPCSubscriptionStatus;
  data: undefined | TOutput;
  error: null | TError;
  /**
   * Reset the subscription
   */
  reset: () => void;
}

export interface TRPCSubscriptionIdleResult<TOutput>
  extends TRPCSubscriptionBaseResult<TOutput, null> {
  status: 'idle';
  data: undefined;
  error: null;
}

export interface TRPCSubscriptionConnectingResult<TOutput, TError>
  extends TRPCSubscriptionBaseResult<TOutput, TError> {
  status: 'connecting';
  data: undefined | TOutput;
  error: TError | null;
}

export interface TRPCSubscriptionPendingResult<TOutput>
  extends TRPCSubscriptionBaseResult<TOutput, undefined> {
  status: 'pending';
  data: TOutput | undefined;
  error: null;
}

export interface TRPCSubscriptionErrorResult<TOutput, TError>
  extends TRPCSubscriptionBaseResult<TOutput, TError> {
  status: 'error';
  data: undefined | TOutput;
  error: TError;
}

export type TRPCSubscriptionResult<TOutput, TError> =
  | TRPCSubscriptionIdleResult<TOutput>
  | TRPCSubscriptionConnectingResult<TOutput, TError>
  | TRPCSubscriptionPendingResult<TOutput>
  | TRPCSubscriptionErrorResult<TOutput, TError>;

type AnyTRPCSubscriptionOptionsIn = BaseTRPCSubscriptionOptionsIn<
  unknown,
  unknown
>;

type AnyTRPCSubscriptionOptionsOut = TRPCSubscriptionOptionsOut<
  unknown,
  unknown
>;

/**
 * @internal
 */
export function trpcSubscriptionOptions(args: {
  input: unknown;
  subscribe: typeof TRPCUntypedClient.prototype.subscription;
  path: readonly string[];
  queryKey: TRPCQueryKey;
  opts?: AnyTRPCSubscriptionOptionsIn;
}): AnyTRPCSubscriptionOptionsOut {
  const { input, subscribe, path, queryKey, opts } = args;
  const inputIsSkipToken = input === skipToken;

  const enabled = opts?.enabled ?? true;

  const subscriptionFn = (
    innerOpts: UnusedSkipTokenTRPCSubscriptionOptionsIn<unknown, unknown>,
  ) => {
    const actualOpts = {
      ...opts,
      ...innerOpts,
    };

    return subscribe(path.join('.'), input, actualOpts);
  };

  return Object.assign(
    {
      ...opts,
      enabled: inputIsSkipToken ? false : enabled,
      queryKey,
      subscribe: subscriptionFn,
    },
    { trpc: createTRPCOptionsResult({ path }) },
  );
}

/**
 * Angular hook for tRPC subscriptions
 */
export function injectTRPCSubscription<TOutput, TError>(
  subscriptionOptions: TRPCSubscriptionOptionsOut<TOutput, TError>,
  injector?: Injector,
): TRPCSubscriptionResult<TOutput, TError> {
  const currentInjector = injector ?? inject(Injector);
  const destroyRef = currentInjector.get(DestroyRef);

  // Create reactive signals for subscription state
  const statusSignal = signal<TRPCSubscriptionStatus>('idle');
  const dataSignal = signal<TOutput | undefined>(undefined);
  const errorSignal = signal<TError | null>(null);

  let subscription: Unsubscribable | null = null;

  const reset = () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
    statusSignal.set('idle');
    dataSignal.set(undefined);
    errorSignal.set(null);
  };

  const startSubscription = () => {
    if (!subscriptionOptions.enabled) {
      return;
    }

    reset();
    statusSignal.set('connecting');

    subscription = subscriptionOptions.subscribe({
      onStarted: () => {
        statusSignal.set('pending');
        subscriptionOptions.onStarted?.();
      },
      onData: (data) => {
        statusSignal.set('pending');
        dataSignal.set(data);
        subscriptionOptions.onData?.(data);
      },
      onError: (error) => {
        statusSignal.set('error');
        errorSignal.set(error);
        subscriptionOptions.onError?.(error);
      },
      onConnectionStateChange: (state) => {
        subscriptionOptions.onConnectionStateChange?.(state);
      },
    });
  };

  // Start subscription when enabled
  effect(() => {
    if (subscriptionOptions.enabled) {
      startSubscription();
    } else {
      reset();
    }
  });

  // Clean up on destroy
  destroyRef.onDestroy(() => {
    reset();
  });

  // Return the subscription result as signals
  return {
    get status() {
      return statusSignal();
    },
    get data() {
      return dataSignal();
    },
    get error() {
      return errorSignal();
    },
    reset,
  } as TRPCSubscriptionResult<TOutput, TError>;
}
