import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { observable } from '@trpc/server/observable';
import type {
  AnyClientTypes,
  AnyRouter,
  TRPCResponse,
} from '@trpc/server/unstable-core-do-not-import';
import { transformResult } from '@trpc/server/unstable-core-do-not-import';
import { TRPCClientError } from '@trpc/client';
import type { HTTPHeaders, Operation, TRPCLink } from '@trpc/client';
import {
  getInput,
  getUrl,
  resolveHTTPLinkOptions,
  type HTTPResult,
  type HTTPLinkBaseOptions,
} from './http-utils';

export type AngularHttpLinkOptions<TRoot extends AnyClientTypes> =
  HTTPLinkBaseOptions<TRoot> & {
    /**
     * Angular HttpClient instance
     */
    httpClient: HttpClient;
    /**
     * Headers to be set on outgoing requests or a callback that returns said headers
     */
    headers?:
      | HTTPHeaders
      | ((opts: { op: Operation }) => HTTPHeaders | Promise<HTTPHeaders>);
  };

const METHOD = {
  query: 'GET',
  mutation: 'POST',
  subscription: 'PATCH',
} as const;

/**
 * Polyfill for DOMException with AbortError name
 */
class AbortError extends Error {
  constructor() {
    const name = 'AbortError';
    super(name);
    this.name = name;
    this.message = name;
  }
}

/**
 * Polyfill for `signal.throwIfAborted()`
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/throwIfAborted
 */
const throwIfAborted = (signal?: AbortSignal) => {
  if (!signal?.aborted) {
    return;
  }
  // If available, use the native implementation
  signal.throwIfAborted?.();

  // If we have `DOMException`, use it
  if (typeof DOMException !== 'undefined') {
    throw new DOMException('AbortError', 'AbortError');
  }

  // Otherwise, use our own implementation
  throw new AbortError();
};

/**
 * Angular HttpClient-based HTTP requester that follows tRPC's error handling patterns
 */
async function angularHttpRequester(
  httpClient: HttpClient,
  opts: {
    url: string;
    type: 'query' | 'mutation' | 'subscription';
    path: string;
    input?: unknown;
    signal?: AbortSignal;
    headers: HTTPHeaders;
    transformer: any;
    methodOverride?: 'POST';
  },
): Promise<HTTPResult> {
  throwIfAborted(opts.signal);

  const method = opts.methodOverride ?? METHOD[opts.type];

  // Build the URL with query parameters for GET requests
  const urlWithParams = getUrl({
    ...opts,
    input: opts.input || undefined,
    transformer: opts.transformer,
    signal: opts.signal ?? null,
  });

  // Convert headers to Angular HttpHeaders
  let angularHeaders = new HttpHeaders();
  if (opts.headers) {
    const headerObj = opts.headers as Record<string, string | string[]>;
    for (const [key, value] of Object.entries(headerObj)) {
      if (typeof value === 'string') {
        angularHeaders = angularHeaders.set(key, value);
      } else if (Array.isArray(value)) {
        angularHeaders = angularHeaders.set(key, value.join(', '));
      }
    }
  }

  // Set content type for POST/PATCH requests
  if (method === 'POST' || method === 'PATCH') {
    angularHeaders = angularHeaders.set('Content-Type', 'application/json');
  }

  const requestOptions = {
    headers: angularHeaders,
    observe: 'response' as const,
    responseType: 'json' as const,
  };

  let request$: Observable<HttpResponse<any>>;

  if (method === 'GET') {
    request$ = httpClient.get(urlWithParams, requestOptions);
  } else if (method === 'POST') {
    let body: string | undefined;
    if (opts.type !== 'query' || opts.methodOverride === 'POST') {
      const input = getInput({
        input: opts.input || undefined,
        transformer: opts.transformer,
      });
      body = input !== undefined ? JSON.stringify(input) : undefined;
    }
    request$ = httpClient.post(urlWithParams, body, requestOptions);
  } else if (method === 'PATCH') {
    const input = getInput({
      input: opts.input || undefined,
      transformer: opts.transformer,
    });
    const body = input !== undefined ? JSON.stringify(input) : undefined;
    request$ = httpClient.patch(urlWithParams, body, requestOptions);
  } else {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return new Promise((resolve, reject) => {
    let subscription: Subscription | undefined;
    let aborted = false;

    // Handle abort signal
    if (opts.signal) {
      const onAbort = () => {
        aborted = true;
        if (subscription) {
          subscription.unsubscribe();
        }
        // Use the proper abort error
        throwIfAborted(opts.signal);
      };

      if (opts.signal.aborted) {
        throwIfAborted(opts.signal);
        return;
      }

      opts.signal.addEventListener('abort', onAbort);
    }

    subscription = request$.subscribe({
      next: (response: HttpResponse<any>) => {
        if (aborted) return;

        // Build meta info similar to official tRPC httpUtils
        const meta = {
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            url: response.url ?? undefined,
            json: async () => response.body,
            text: async () => JSON.stringify(response.body),
          },
          responseJSON: response.body,
        };

        const httpResult: HTTPResult = {
          json: response.body as TRPCResponse,
          meta,
        };

        resolve(httpResult);
      },
      error: (error: any) => {
        if (aborted) return;

        // Handle Angular HttpErrorResponse similar to fetch errors
        if (error instanceof HttpErrorResponse) {
          const meta = {
            response: {
              status: error.status,
              statusText: error.statusText || 'Unknown Error',
              headers: error.headers,
              url: error.url ?? undefined,
              json: async () => error.error,
              text: async () => JSON.stringify(error.error),
            },
            responseJSON: error.error,
          };

          // Return the actual error response body if available, otherwise create error structure
          const responseBody = error.error || {
            error: {
              message: error.message || 'HTTP Error',
              code: -1,
              data: {
                code: 'HTTP_ERROR',
                httpStatus: error.status,
              },
            },
          };

          const httpResult: HTTPResult = {
            json: responseBody as TRPCResponse,
            meta,
          };

          resolve(httpResult);
        } else {
          // For non-HTTP errors (network issues, etc.), reject directly
          reject(error);
        }
      },
      complete: () => {
        // Nothing to do here
      },
    });
  });
}

/**
 * Angular HttpClient link for tRPC client
 */
export function angularHttpLink<TRouter extends AnyRouter = AnyRouter>(
  opts: AngularHttpLinkOptions<TRouter['_def']['_config']['$types']>,
): TRPCLink<TRouter> {
  const resolvedOpts = resolveHTTPLinkOptions(opts);

  return () => {
    return ({ op }) => {
      return observable((observer) => {
        const { path, input, type } = op;

        /* istanbul ignore if -- @preserve */
        if (type === 'subscription') {
          throw new Error(
            'Subscriptions are unsupported by `angularHttpLink` - use `httpSubscriptionLink` or `wsLink`',
          );
        }

        const resolveHeaders = async (): Promise<HTTPHeaders> => {
          if (!opts.headers) {
            return {};
          }
          if (typeof opts.headers === 'function') {
            return opts.headers({ op });
          }
          return opts.headers;
        };

        resolveHeaders()
          .then((headers) => {
            return angularHttpRequester(opts.httpClient, {
              ...resolvedOpts,
              type,
              path,
              input,
              signal: op.signal ?? undefined,
              headers,
              methodOverride: resolvedOpts.methodOverride,
            });
          })
          .then((res) => {
            const transformed = transformResult(
              res.json,
              resolvedOpts.transformer.output,
            );

            if (!transformed.ok) {
              observer.error(
                TRPCClientError.from(transformed.error, {
                  meta: res.meta,
                }),
              );
              return;
            }

            observer.next({
              context: res.meta,
              result: transformed.result,
            });
            observer.complete();
          })
          .catch((cause) => {
            observer.error(TRPCClientError.from(cause, { meta: undefined }));
          });

        return () => {
          // Cleanup is handled by the AbortSignal
        };
      });
    };
  };
}
