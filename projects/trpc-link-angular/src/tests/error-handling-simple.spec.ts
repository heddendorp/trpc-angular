import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { angularHttpLink } from '../public-api';
import { createTRPCClient } from '@trpc/client';
import { TRPCClientError } from '@trpc/client';
import { AppRouter } from './example-server';

/**
 * Essential tRPC error handling tests that verify our implementation
 * correctly handles the most common error scenarios from tRPC servers.
 */
describe('Essential tRPC Error Handling', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('Standard tRPC Server Errors', () => {
    it('should handle tRPC BAD_REQUEST error (400)', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.getUser.query({ id: -1 }).catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => 
        request.url.includes('http://localhost:3000/trpc/getUser')
      );

      // Exact tRPC server validation error response
      const trpcError = {
        error: {
          message: 'Invalid input: Expected positive number',
          code: -32600,
          data: {
            code: 'BAD_REQUEST',
            httpStatus: 400,
            path: 'getUser',
            zodError: {
              issues: [
                {
                  code: 'too_small',
                  minimum: 1,
                  type: 'number',
                  inclusive: true,
                  exact: false,
                  message: 'Number must be greater than or equal to 1',
                  path: ['id'],
                },
              ],
            },
          },
        },
      };

      req.flush(trpcError, { status: 400, statusText: 'Bad Request' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('BAD_REQUEST');
      expect(error.data?.httpStatus).toBe(400);
      expect(error.data?.path).toBe('getUser');
      expect(error.data?.zodError).toBeDefined();
      expect(error.message).toContain('Invalid input');
    });

    it('should handle tRPC UNAUTHORIZED error (401)', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            headers: { Authorization: 'Bearer invalid-token' },
          }),
        ],
      });

      const errorPromise = client.getUser.query({ id: 1 }).catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => 
        request.url.includes('http://localhost:3000/trpc/getUser')
      );

      const trpcError = {
        error: {
          message: 'UNAUTHORIZED',
          code: -32001,
          data: {
            code: 'UNAUTHORIZED',
            httpStatus: 401,
            path: 'getUser',
          },
        },
      };

      req.flush(trpcError, { status: 401, statusText: 'Unauthorized' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('UNAUTHORIZED');
      expect(error.data?.httpStatus).toBe(401);
      expect(error.message).toBe('UNAUTHORIZED');
    });

    it('should handle tRPC NOT_FOUND error (404)', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.getUser.query({ id: 99999 }).catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => 
        request.url.includes('http://localhost:3000/trpc/getUser')
      );

      const trpcError = {
        error: {
          message: 'User not found',
          code: -32004,
          data: {
            code: 'NOT_FOUND',
            httpStatus: 404,
            path: 'getUser',
          },
        },
      };

      req.flush(trpcError, { status: 404, statusText: 'Not Found' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('NOT_FOUND');
      expect(error.data?.httpStatus).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should handle tRPC INTERNAL_SERVER_ERROR (500)', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.createUser.mutate({ name: 'Test' }).catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/createUser');

      const trpcError = {
        error: {
          message: 'Database connection failed',
          code: -32603,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            httpStatus: 500,
            path: 'createUser',
          },
        },
      };

      req.flush(trpcError, { status: 500, statusText: 'Internal Server Error' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.data?.httpStatus).toBe(500);
      expect(error.message).toBe('Database connection failed');
    });
  });

  describe('tRPC Success Response with Error', () => {
    it('should handle HTTP 200 response containing tRPC error', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      // Some tRPC servers return HTTP 200 but with error in body
      const errorPromise = client.getUser.query({ id: 1 }).catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => 
        request.url.includes('http://localhost:3000/trpc/getUser')
      );

      const trpcErrorIn200 = {
        error: {
          message: 'Business logic validation failed',
          code: -32600,
          data: {
            code: 'BAD_REQUEST',
            httpStatus: 400,
            path: 'getUser',
          },
        },
      };

      // HTTP status is 200 OK, but response contains tRPC error
      req.flush(trpcErrorIn200, { status: 200, statusText: 'OK' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Business logic validation failed');
    });
  });

  describe('Network and Transport Errors', () => {
    it('should handle network connection errors', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.hello.query().catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      
      // Simulate network error
      req.error(new ProgressEvent('Network Error'));

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.cause).toBeDefined();
    });

    it('should handle server timeout (408)', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.hello.query().catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');

      const trpcTimeoutError = {
        error: {
          message: 'Request timeout',
          code: -32008,
          data: {
            code: 'TIMEOUT',
            httpStatus: 408,
            path: 'hello',
          },
        },
      };

      req.flush(trpcTimeoutError, { status: 408, statusText: 'Request Timeout' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.data?.code).toBe('TIMEOUT');
      expect(error.data?.httpStatus).toBe(408);
    });
  });

  describe('AbortSignal Support', () => {
    it('should handle AbortSignal cancellation', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const abortController = new AbortController();
      const errorPromise = client.hello.query(undefined, {
        signal: abortController.signal,
      }).catch((error) => error);

      // Cancel immediately
      abortController.abort();

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.cause?.name).toBe('AbortError');
    });

    it('should handle pre-aborted signal', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const abortController = new AbortController();
      abortController.abort(); // Abort before request

      const errorPromise = client.hello.query(undefined, {
        signal: abortController.signal,
      }).catch((error) => error);

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.cause?.name).toBe('AbortError');
    });
  });

  describe('Response Meta Information Preservation', () => {
    it('should preserve response meta in error responses', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.hello.query().catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      
      const trpcError = {
        error: {
          message: 'Test error for meta verification',
          code: -32600,
          data: {
            code: 'BAD_REQUEST',
            httpStatus: 400,
          },
        },
      };

      req.flush(trpcError, {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': 'test-request-123',
        },
      });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      expect(error.meta).toBeDefined();
      expect(error.meta?.response?.status).toBe(400);
      expect(error.meta?.responseJSON).toEqual(trpcError);
    });
  });

  describe('Malformed Response Handling', () => {
    it('should handle non-JSON error responses from proxies/gateways', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.hello.query().catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      
      // Simulate gateway error (HTML response instead of JSON)
      req.flush('<html><body>502 Bad Gateway</body></html>', { 
        status: 502, 
        statusText: 'Bad Gateway' 
      });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
      // Should handle non-JSON responses gracefully
    });

    it('should handle empty error responses', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const errorPromise = client.hello.query().catch((error) => error);

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      
      // Empty response body
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      const error = await errorPromise;
      expect(error).toBeInstanceOf(TRPCClientError);
    });
  });
});