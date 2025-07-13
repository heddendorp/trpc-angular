import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { angularHttpLink } from '../public-api';
import { createTRPCClient } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

// Create a tRPC router with superjson transformer
const t = initTRPC.create({
  transformer: superjson,
});

const appRouterWithTransformer = t.router({
  getDate: t.procedure.query(() => {
    return new Date('2023-01-01T00:00:00Z');
  }),
  
  createPost: t.procedure
    .input(z.object({ 
      title: z.string(), 
      createdAt: z.date() 
    }))
    .mutation(({ input }) => {
      return { 
        id: 1, 
        title: input.title, 
        createdAt: input.createdAt 
      };
    }),
});

type AppRouterWithTransformer = typeof appRouterWithTransformer;

describe('angularHttpLink with transformers', () => {
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

  it('should create a TRPC client with superjson transformer', () => {
    // This test demonstrates that the main issue is fixed:
    // Users can now use transformer: superjson without TypeScript errors
    const client = createTRPCClient<AppRouterWithTransformer>({
      links: [angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        transformer: superjson, // This should compile without TypeScript errors
      })]
    });

    expect(client).toBeDefined();
    expect(client.getDate).toBeDefined();
    expect(client.createPost).toBeDefined();
  });

  it('should handle transformer types correctly', () => {
    // Test that various transformer types work
    const client1 = createTRPCClient<AppRouterWithTransformer>({
      links: [angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        transformer: superjson, // SuperJSON instance
      })]
    });

    const client2 = createTRPCClient<AppRouterWithTransformer>({
      links: [angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        transformer: {
          serialize: (data) => JSON.stringify(data),
          deserialize: (data) => JSON.parse(data)
        }, // Custom transformer
      })]
    });

    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
  });
});