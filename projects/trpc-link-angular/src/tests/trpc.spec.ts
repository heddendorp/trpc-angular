import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Trpc } from './trpc';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

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
