import type { InfiniteData } from '@tanstack/angular-query-experimental';
import type { TRPCRequestOptions } from '@trpc/client';

/**
 * Turn a set of optional properties into required
 * @internal
 */
export type WithRequired<TObj, TKey extends keyof TObj> = TObj & {
  [P in TKey]-?: TObj[P];
};

/**
 * Fix for TypeScript inference issue with Record<string, any> types
 * @internal
 */
export type FixRecordInference<T> = T extends Record<string, any>
  ? T extends (...args: any[]) => any
    ? T
    : { [K in keyof T]: T[K] } & { [key: string]: any }
  : T;

/**
 * @internal
 */
export type ResolverDef = {
  input: any;
  output: any;
  transformer: boolean;
  errorShape: any;
};

/**
 * @remark `void` is here due to https://github.com/trpc/trpc/pull/4374
 */
type CursorInput = { cursor?: any };
export type OptionalCursorInput = CursorInput | void;

/**
 * @internal
 */
export type ExtractCursorType<TInput> = TInput extends CursorInput
  ? TInput['cursor']
  : unknown;

/**
 * @internal
 */
export type TRPCInfiniteData<TInput, TOutput> = InfiniteData<
  TOutput,
  NonNullable<ExtractCursorType<TInput>> | null
>;

/**
 * @public
 */
export interface TRPCAngularRequestOptions
  // For Angular Query, we use their internal AbortSignals instead of letting the user pass their own
  extends Omit<TRPCRequestOptions, 'signal'> {
  /**
   * Opt out of SSR for this query by passing `ssr: false`
   */
  ssr?: boolean;
  /**
   * Opt out or into aborting request on unmount
   */
  abortOnUnmount?: boolean;
}

/**
 * @public
 */
export interface TRPCQueryBaseOptions {
  /**
   * tRPC-related options
   */
  trpc?: TRPCAngularRequestOptions;
}

/**
 * @public
 */
export interface TRPCQueryOptionsResult {
  trpc: {
    path: string;
  };
}

/**
 * @public
 */
export type QueryType = 'any' | 'infinite' | 'query';

/**
 * @public
 */
export type TRPCQueryKey = [
  readonly string[],
  { input?: unknown; type?: Exclude<QueryType, 'any'> }?,
];

/**
 * @public
 */
export type TRPCMutationKey = [readonly string[]]; // = [TRPCQueryKey[0]]
