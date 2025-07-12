import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
 * Angular HttpClient requester function
 */
function angularHttpRequester(
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
  return new Promise((resolve, reject) => {
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
      reject(new Error(`Unsupported HTTP method: ${method}`));
      return;
    }

    let subscription: Subscription | undefined;
    let aborted = false;

    // Handle abort signal
    if (opts.signal) {
      const onAbort = () => {
        aborted = true;
        if (subscription) {
          subscription.unsubscribe();
        }
        reject(new Error('Request aborted'));
      };

      if (opts.signal.aborted) {
        onAbort();
        return;
      }

      opts.signal.addEventListener('abort', onAbort);
    }

    subscription = request$.subscribe({
      next: (response: HttpResponse<any>) => {
        if (aborted) return;

        const httpResult: HTTPResult = {
          json: response.body as TRPCResponse,
          meta: {
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              url: response.url ?? undefined,
              json: async () => response.body,
              text: async () => JSON.stringify(response.body),
            } as any,
            responseJSON: response.body,
          },
        };

        resolve(httpResult);
      },
      error: (error: any) => {
        if (aborted) return;

        if (error instanceof HttpErrorResponse) {
          const httpResult: HTTPResult = {
            json: {
              error: {
                message: error.message || 'HTTP Error',
                code: error.status,
                data: {
                  code:
                    error.status === 400
                      ? 'BAD_REQUEST'
                      : error.status === 401
                        ? 'UNAUTHORIZED'
                        : error.status === 403
                          ? 'FORBIDDEN'
                          : error.status === 404
                            ? 'NOT_FOUND'
                            : error.status === 500
                              ? 'INTERNAL_SERVER_ERROR'
                              : 'UNKNOWN_ERROR',
                  httpStatus: error.status,
                },
              },
            } as any,
            meta: {
              response: {
                status: error.status,
                statusText: error.statusText || 'Unknown Error',
                headers: error.headers,
                url: error.url ?? undefined,
                json: async () => error.error,
                text: async () => JSON.stringify(error.error),
              } as any,
              responseJSON: error.error,
            },
          };
          resolve(httpResult);
        } else {
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
