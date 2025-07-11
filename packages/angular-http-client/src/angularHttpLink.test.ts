import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCClient, isTRPCClientError } from '@trpc/client';
import { angularHttpLink } from './angularHttpLink';

// Mock Angular HttpClient
interface MockAngularHttpClient {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  head: ReturnType<typeof vi.fn>;
  options: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
}

interface MockAngularObservable<T> {
  subscribe: ReturnType<typeof vi.fn>;
}

interface MockAngularSubscription {
  unsubscribe: ReturnType<typeof vi.fn>;
}

function createMockAngularHttpClient(): MockAngularHttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    request: vi.fn(),
  };
}

function createMockAngularObservable<T>(
  value?: T,
  error?: any,
): MockAngularObservable<T> {
  const subscription: MockAngularSubscription = {
    unsubscribe: vi.fn(),
  };

  return {
    subscribe: vi.fn((observerOrNext, errorFn, completeFn) => {
      const observer =
        typeof observerOrNext === 'function'
          ? { next: observerOrNext, error: errorFn, complete: completeFn }
          : observerOrNext;

      setTimeout(() => {
        if (error) {
          observer.error?.(error);
        } else {
          observer.next?.(value);
          observer.complete?.();
        }
      }, 0);

      return subscription;
    }),
  };
}

describe('angularHttpLink', () => {
  const t = initTRPC.create();

  const router = t.router({
    hello: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => `Hello ${input.name}!`),
    greeting: t.procedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input }) => `Greetings ${input.name}!`),
    error: t.procedure.query(() => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      });
    }),
  });

  type Router = typeof router;

  let mockHttpClient: MockAngularHttpClient;

  beforeEach(() => {
    mockHttpClient = createMockAngularHttpClient();
    vi.clearAllMocks();
  });

  it('should perform a GET request for queries', async () => {
    const mockResponse = {
      body: { result: { data: 'Hello World!' } },
      headers: {},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/hello',
    };

    mockHttpClient.get.mockReturnValue(
      createMockAngularObservable(mockResponse),
    );

    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
        }),
      ],
    });

    const result = await client.hello.query({ name: 'World' });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/hello'),
      expect.objectContaining({
        headers: {},
        observe: 'response',
        responseType: 'json',
      }),
    );

    expect(result).toBe('Hello World!');
  });

  it('should perform a POST request for mutations', async () => {
    const mockResponse = {
      body: { result: { data: 'Greetings World!' } },
      headers: {},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/greeting',
    };

    mockHttpClient.post.mockReturnValue(
      createMockAngularObservable(mockResponse),
    );

    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
        }),
      ],
    });

    const result = await client.greeting.mutate({ name: 'World' });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/greeting'),
      expect.stringContaining('"World"'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        observe: 'response',
        responseType: 'json',
      }),
    );

    expect(result).toBe('Greetings World!');
  });

  it('should handle HTTP errors', async () => {
    const mockError = {
      status: 500,
      statusText: 'Internal Server Error',
      message: 'Something went wrong',
      error: { message: 'Internal error' },
    };

    mockHttpClient.get.mockReturnValue(
      createMockAngularObservable(undefined, mockError),
    );

    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
        }),
      ],
    });

    await expect(client.hello.query({ name: 'World' })).rejects.toThrow();
  });

  it('should handle custom headers', async () => {
    const mockResponse = {
      body: { result: { data: 'Hello World!' } },
      headers: {},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/hello',
    };

    mockHttpClient.get.mockReturnValue(
      createMockAngularObservable(mockResponse),
    );

    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
          headers: {
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          },
        }),
      ],
    });

    await client.hello.query({ name: 'World' });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/hello'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        }),
        observe: 'response',
        responseType: 'json',
      }),
    );
  });

  it('should handle dynamic headers', async () => {
    const mockResponse = {
      body: { result: { data: 'Hello World!' } },
      headers: {},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/hello',
    };

    mockHttpClient.get.mockReturnValue(
      createMockAngularObservable(mockResponse),
    );

    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
          headers: () => ({
            Authorization: 'Bearer dynamic-token',
          }),
        }),
      ],
    });

    await client.hello.query({ name: 'World' });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/hello'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer dynamic-token',
        }),
        observe: 'response',
        responseType: 'json',
      }),
    );
  });

  it('should throw error for subscription operations', () => {
    const client = createTRPCClient<Router>({
      links: [
        angularHttpLink({
          url: 'http://localhost:3000',
          httpClient: mockHttpClient as any,
        }),
      ],
    });

    expect(() => {
      // Simulating a subscription operation by creating a subscription observable
      const link = angularHttpLink({
        url: 'http://localhost:3000',
        httpClient: mockHttpClient as any,
      });

      const linkFn = link();
      linkFn({
        op: {
          id: 1,
          type: 'subscription',
          input: {},
          path: 'test',
          context: {},
          signal: undefined,
        },
        next: () => null as any,
      });
    }).toThrow('Subscriptions are unsupported by `angularHttpLink`');
  });
});
