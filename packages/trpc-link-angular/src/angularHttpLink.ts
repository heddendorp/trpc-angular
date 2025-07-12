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
} from './httpUtils';

// Angular HttpClient interfaces (minimal definitions needed)
interface AngularHttpClient {
  get<T = any>(url: string, options?: AngularHttpOptions): AngularObservable<T>;
  post<T = any>(
    url: string,
    body: any,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  put<T = any>(
    url: string,
    body: any,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  patch<T = any>(
    url: string,
    body: any,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  delete<T = any>(
    url: string,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  head<T = any>(
    url: string,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  options<T = any>(
    url: string,
    options?: AngularHttpOptions,
  ): AngularObservable<T>;
  request<T = any>(
    method: string,
    url: string,
    options?: AngularHttpOptions & { body?: any },
  ): AngularObservable<T>;
}

interface AngularHttpOptions {
  headers?: Record<string, string | string[]> | AngularHttpHeaders;
  params?: Record<
    string,
    | string
    | string[]
    | number
    | boolean
    | ReadonlyArray<string | number | boolean>
  >;
  observe?: 'body' | 'response' | 'events';
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  reportProgress?: boolean;
  withCredentials?: boolean;
}

interface AngularHttpHeaders {
  has(name: string): boolean;
  get(name: string): string | null;
  keys(): string[];
  getAll(name: string): string[] | null;
  append(name: string, value: string | string[]): AngularHttpHeaders;
  set(name: string, value: string | string[]): AngularHttpHeaders;
  delete(name: string, value?: string | string[]): AngularHttpHeaders;
}

interface AngularObservable<T> {
  subscribe(observer: {
    next?: (value: T) => void;
    error?: (error: any) => void;
    complete?: () => void;
  }): AngularSubscription;
  subscribe(
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void,
  ): AngularSubscription;
}

interface AngularSubscription {
  unsubscribe(): void;
}

interface AngularHttpResponse<T = any> {
  body: T;
  headers: AngularHttpHeaders;
  status: number;
  statusText: string;
  url: string | null;
}

export type AngularHttpLinkOptions<TRoot extends AnyClientTypes> =
  HTTPLinkBaseOptions<TRoot> & {
    /**
     * Angular HttpClient instance
     */
    httpClient: AngularHttpClient;
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
  httpClient: AngularHttpClient,
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

    // Convert headers to Angular format
    const angularHeaders: Record<string, string> = {};
    if (opts.headers) {
      // Check if headers is iterable
      if (
        opts.headers &&
        typeof opts.headers === 'object' &&
        typeof (opts.headers as any)[Symbol?.iterator] === 'function'
      ) {
        // Handle iterable headers
        for (const [key, value] of opts.headers as any) {
          angularHeaders[key] = value;
        }
      } else {
        // Handle object headers
        const headerObj = opts.headers as Record<string, string | string[]>;
        for (const [key, value] of Object.entries(headerObj)) {
          if (typeof value === 'string') {
            angularHeaders[key] = value;
          } else if (Array.isArray(value)) {
            angularHeaders[key] = value.join(', ');
          }
        }
      }
    }

    // Set content type for POST requests
    if (method === 'POST' || method === 'PATCH') {
      angularHeaders['Content-Type'] = 'application/json';
    }

    const requestOptions: AngularHttpOptions = {
      headers: angularHeaders,
      observe: 'response' as const,
      responseType: 'json' as const,
    };

    let request: AngularObservable<AngularHttpResponse>;

    if (method === 'GET') {
      request = httpClient.get(urlWithParams, requestOptions);
    } else if (method === 'POST') {
      // For POST requests, body comes from getInput if it's not a query or if methodOverride is POST
      let body: string | undefined;
      if (opts.type !== 'query' || opts.methodOverride === 'POST') {
        const input = getInput({
          input: opts.input || undefined,
          transformer: opts.transformer,
        });
        body = input !== undefined ? JSON.stringify(input) : undefined;
      }
      request = httpClient.post(urlWithParams, body, requestOptions);
    } else if (method === 'PATCH') {
      const input = getInput({
        input: opts.input || undefined,
        transformer: opts.transformer,
      });
      const body = input !== undefined ? JSON.stringify(input) : undefined;
      request = httpClient.patch(urlWithParams, body, requestOptions);
    } else {
      reject(new Error(`Unsupported HTTP method: ${method}`));
      return;
    }

    let subscription: AngularSubscription | undefined;
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

    subscription = request.subscribe({
      next: (response: AngularHttpResponse) => {
        if (aborted) return;

        const httpResult: HTTPResult = {
          json: response.body as TRPCResponse,
          meta: {
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              url: response.url,
              json: async () => response.body,
              text: async () => JSON.stringify(response.body),
            } as any,
            responseJSON: response.body,
          },
        };

        resolve(httpResult);
      },
      error: (error) => {
        if (aborted) return;

        // Handle Angular HTTP errors
        if (error.status !== undefined) {
          // Angular HttpErrorResponse
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
                headers: error.headers || {},
                url: error.url,
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
