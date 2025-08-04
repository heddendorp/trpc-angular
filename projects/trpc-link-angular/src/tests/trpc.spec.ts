import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Trpc } from './trpc';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { angularHttpLink } from '../public-api';
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from './example-server';

describe('Trpc', () => {
  let service: Trpc;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Trpc,
        provideZonelessChangeDetection(),
        // Provide HttpClient for the angularHttpLink
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(Trpc);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the hello endpoint', async () => {
    const response = service.client.hello.query();
    expect(response).toBeInstanceOf(Promise);

    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
    expect(req.request.method).toBe('GET');
    req.flush({ result: { data: 'Hello world' } });

    // Wait for the promise to resolve
    const result = await response;
    expect(result).toEqual('Hello world');
  });
});

describe('angularHttpLink', () => {
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

  describe('Basic functionality', () => {
    it('should create a TRPC client with angularHttpLink', () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      expect(client).toBeDefined();
      expect(client.hello).toBeDefined();
      expect(client.getUser).toBeDefined();
      expect(client.createUser).toBeDefined();
    });

    it('should handle query requests with GET method', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBeNull();

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });
  });

  describe('HTTP Methods and Procedure Types', () => {
    it('should use GET for query procedures', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.method).toBe('GET');

      req.flush({ result: { data: 'Hello world' } });
      await response;
    });

    it('should use POST for mutation procedures', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.createUser.mutate({ name: 'John' });

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne(
        'http://localhost:3000/trpc/createUser',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toBe('{"name":"John"}');

      req.flush({ result: { data: { id: 1, name: 'John' } } });
      const result = await response;
      expect(result).toEqual({ id: 1, name: 'John' });
    });

    it('should handle queries with input parameters', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.getUser.query({ id: 123 });

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => {
        return (
          request.url.includes('http://localhost:3000/trpc/getUser') &&
          request.url.includes('input=')
        );
      });
      expect(req.request.method).toBe('GET');

      req.flush({ result: { data: { id: 123, name: 'User 123' } } });
      const result = await response;
      expect(result).toEqual({ id: 123, name: 'User 123' });
    });
  });

  describe('Method Override', () => {
    it('should use POST for queries when methodOverride is set', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            methodOverride: 'POST',
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });
  });

  describe('Headers', () => {
    it('should handle static headers', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            headers: {
              Authorization: 'Bearer token123',
              'X-Custom-Header': 'custom-value',
            },
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });

    it('should handle function-based headers', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            headers: ({ op }) => ({
              Authorization: `Bearer ${op.path}-token`,
              'X-Operation-Type': op.type,
            }),
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer hello-token',
      );
      expect(req.request.headers.get('X-Operation-Type')).toBe('query');

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });

    it('should handle async function-based headers', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            headers: async ({ op }) => {
              // Simulate async header resolution
              await new Promise((resolve) => setTimeout(resolve, 10));
              return {
                Authorization: `Bearer async-${op.path}-token`,
              };
            },
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => setTimeout(resolve, 20));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer async-hello-token',
      );

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });

    it('should handle array headers', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
            headers: {
              Accept: ['application/json', 'text/plain'],
            },
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      expect(req.request.headers.get('Accept')).toBe(
        'application/json, text/plain',
      );

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
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
      req.flush(
        { error: 'Bad request' },
        { status: 400, statusText: 'Bad Request' },
      );

      const error = await errorPromise;
      expect(error).toBeDefined();
    });

    it('should handle 401 Unauthorized errors', async () => {
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
      req.flush(
        { error: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

      const error = await errorPromise;
      expect(error).toBeDefined();
    });

    it('should handle 404 Not Found errors', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      // Create a client that tries to call a non-existent procedure
      const errorPromise = new Promise((resolve) => {
        const link = angularHttpLink({
          url: 'http://localhost:3000/trpc',
          httpClient,
        });

        // We'll simulate this by making a request that will get a 404
        client.hello.query().catch((error) => resolve(error));
      });

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      req.flush(
        { error: 'Not found' },
        { status: 404, statusText: 'Not Found' },
      );

      const error = await errorPromise;
      expect(error).toBeDefined();
    });

    it('should handle 500 Internal Server Error', async () => {
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
      req.flush(
        { error: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      const error = await errorPromise;
      expect(error).toBeDefined();
    });

    it('should handle network errors', async () => {
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
      req.error(new ProgressEvent('Network error'));

      const error = await errorPromise;
      expect(error).toBeDefined();
    });
  });

  describe('Additional Mutation Tests', () => {
    it('should handle updateUser mutation', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.updateUser.mutate({
        id: 1,
        name: 'Updated John',
      });

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne(
        'http://localhost:3000/trpc/updateUser',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe('{"id":1,"name":"Updated John"}');

      req.flush({ result: { data: { id: 1, name: 'Updated John' } } });
      const result = await response;
      expect(result).toEqual({ id: 1, name: 'Updated John' });
    });

    it('should handle deleteUser mutation', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.deleteUser.mutate({ id: 1 });

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne(
        'http://localhost:3000/trpc/deleteUser',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe('{"id":1}');

      req.flush({ result: { data: { success: true, deletedId: 1 } } });
      const result = await response;
      expect(result).toEqual({ success: true, deletedId: 1 });
    });
  });

  describe('URL Building', () => {
    it('should handle URLs with existing query parameters', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc?version=1',
            httpClient,
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne((request) => {
        return (
          request.url.includes('version=1') &&
          request.url.includes('http://localhost:3000/trpc/hello')
        );
      });

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });

    it('should handle trailing slashes in URLs', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc/',
            httpClient,
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');

      req.flush({ result: { data: 'Hello world' } });
      const result = await response;
      expect(result).toEqual('Hello world');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      const client = createTRPCClient<AppRouter>({
        links: [
          angularHttpLink({
            url: 'http://localhost:3000/trpc',
            httpClient,
          }),
        ],
      });

      const response = client.hello.query();

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const req = httpTesting.expectOne('http://localhost:3000/trpc/hello');
      req.flush({ result: { data: null } });

      const result = await response;
      expect(result).toBeNull();
    });

    it('should handle malformed TRPC responses', async () => {
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
      req.flush({ error: { message: 'Invalid input', code: 'BAD_REQUEST' } });

      const error = await errorPromise;
      expect(error).toBeDefined();
    });
  });
});
