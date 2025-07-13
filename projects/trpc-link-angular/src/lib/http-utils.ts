/**
 * HTTP utility functions copied from @trpc/client/src/links/internals/httpUtils.ts
 * This code is copied to avoid modifying the client package as requested.
 * Original source: packages/client/src/links/internals/httpUtils.ts
 */

import type {
  AnyClientTypes,
  CombinedDataTransformer,
  Maybe,
  ProcedureType,
  TRPCResponse,
  DataTransformerOptions,
  TypeError,
} from '@trpc/server/unstable-core-do-not-import';
import type { HTTPHeaders } from '@trpc/client';

/**
 * @internal
 */
export type HTTPLinkBaseOptions<
  TRoot extends Pick<AnyClientTypes, 'transformer'>,
> = {
  url: string | URL;
  /**
   * Send all requests `as POST`s requests regardless of the procedure type
   * The HTTP handler must separately allow overriding the method.
   */
  methodOverride?: 'POST';
} & TransformerOptions<TRoot>;

export interface ResolvedHTTPLinkOptions {
  url: string;
  transformer: CombinedDataTransformer;
  methodOverride?: 'POST';
}

// Copy of TransformerOptions type from client package
type TransformerOptionYes = {
  /**
   * Data transformer
   *
   * You must use the same transformer on the backend and frontend
   * @see https://trpc.io/docs/v11/data-transformers
   **/
  transformer: DataTransformerOptions;
};

type TransformerOptionNo = {
  /**
   * Data transformer
   *
   * You must use the same transformer on the backend and frontend
   * @see https://trpc.io/docs/v11/data-transformers
   **/
  transformer?: TypeError<'You must define a transformer on your your `initTRPC`-object first'>;
};

export type TransformerOptions<
  TRoot extends Pick<AnyClientTypes, 'transformer'>,
> = TRoot['transformer'] extends true ? TransformerOptionYes : TransformerOptionNo;

// Copy of getTransformer function from client package
export function getTransformer(
  transformer: DataTransformerOptions | undefined,
): CombinedDataTransformer {
  if (!transformer) {
    return {
      input: {
        serialize: (v: any) => v,
        deserialize: (v: any) => v,
      },
      output: {
        serialize: (v: any) => v,
        deserialize: (v: any) => v,
      },
    };
  }

  // If it's a CombinedDataTransformer (has input and output properties)
  if ('input' in transformer && 'output' in transformer) {
    return transformer as CombinedDataTransformer;
  }

  // If it's a DataTransformer (has serialize and deserialize properties)
  const singleTransformer = transformer as { serialize: (v: any) => any; deserialize: (v: any) => any };
  return {
    input: {
      serialize: singleTransformer.serialize,
      deserialize: singleTransformer.deserialize,
    },
    output: {
      serialize: singleTransformer.serialize,
      deserialize: singleTransformer.deserialize,
    },
  };
}

export function resolveHTTPLinkOptions(
  opts: HTTPLinkBaseOptions<AnyClientTypes>,
): ResolvedHTTPLinkOptions {
  return {
    url: opts.url.toString(),
    transformer: getTransformer(opts.transformer as DataTransformerOptions | undefined),
    methodOverride: opts.methodOverride,
  };
}

// https://github.com/trpc/trpc/pull/669
function arrayToDict(array: unknown[]) {
  const dict: Record<number, unknown> = {};
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    dict[index] = element;
  }
  return dict;
}

export interface HTTPResult {
  json: TRPCResponse;
  meta: {
    response: any; // Simplified response type
    responseJSON?: unknown;
  };
}

type GetInputOptions = {
  transformer: CombinedDataTransformer;
} & ({ input: unknown } | { inputs: unknown[] });

export function getInput(opts: GetInputOptions) {
  return 'input' in opts
    ? opts.transformer.input.serialize(opts.input)
    : arrayToDict(
        opts.inputs.map((_input) => opts.transformer.input.serialize(_input)),
      );
}

export type HTTPBaseRequestOptions = GetInputOptions &
  ResolvedHTTPLinkOptions & {
    type: ProcedureType;
    path: string;
    signal: Maybe<AbortSignal>;
  };

type GetUrl = (opts: HTTPBaseRequestOptions) => string;

export const getUrl: GetUrl = (opts) => {
  const parts = opts.url.split('?') as [string, string?];
  const base = parts[0].replace(/\/$/, ''); // Remove any trailing slashes

  let url = base + '/' + opts.path;
  const queryParts: string[] = [];

  if (parts[1]) {
    queryParts.push(parts[1]);
  }
  if ('inputs' in opts) {
    queryParts.push('batch=1');
  }
  if (opts.type === 'query' || opts.type === 'subscription') {
    const input = getInput(opts);
    if (input !== undefined && opts.methodOverride !== 'POST') {
      queryParts.push(`input=${encodeURIComponent(JSON.stringify(input))}`);
    }
  }
  if (queryParts.length) {
    url += '?' + queryParts.join('&');
  }
  return url;
};