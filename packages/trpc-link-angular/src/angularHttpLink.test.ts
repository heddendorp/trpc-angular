import { angularHttpLink } from './angularHttpLink';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AnyRouter } from '@trpc/server/unstable-core-do-not-import';

describe('angularHttpLink (Angular HttpClient)', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should make a GET request and return the result', (done) => {
    const opts = {
      url: '/trpc',
      httpClient,
    };
    const link = angularHttpLink<AnyRouter>(opts)();
    const op = {
      path: 'test',
      input: undefined,
      type: 'query' as const,
      signal: undefined,
      id: 1,
      context: {},
    };
    link({ op }).subscribe({
      next: (result) => {
        expect(result.result).toEqual({ hello: 'world' });
        done();
      },
      error: (err) => {
        fail(err);
        done();
      },
    });
    const req = httpMock.expectOne('/trpc/test');
    expect(req.request.method).toBe('GET');
    req.flush({ hello: 'world' });
  });

  it('should make a POST request and return the result', (done) => {
    const opts = {
      url: '/trpc',
      httpClient,
    };
    const link = angularHttpLink<AnyRouter>(opts)();
    const op = {
      path: 'greeting',
      input: { name: 'World' },
      type: 'mutation' as const,
      signal: undefined,
      id: 2,
      context: {},
    };
    link({ op }).subscribe({
      next: (result) => {
        expect(result.result).toEqual({ greetings: 'Greetings World!' });
        done();
      },
      error: (err) => {
        fail(err);
        done();
      },
    });
    const req = httpMock.expectOne('/trpc/greeting');
    expect(req.request.method).toBe('POST');
    req.flush({ greetings: 'Greetings World!' });
  });

  it('should handle HTTP errors', (done) => {
    const opts = {
      url: '/trpc',
      httpClient,
    };
    const link = angularHttpLink<AnyRouter>(opts)();
    const op = {
      path: 'error',
      input: undefined,
      type: 'query' as const,
      signal: undefined,
      id: 3,
      context: {},
    };
    link({ op }).subscribe({
      next: () => {
        fail('Should not succeed');
        done();
      },
      error: (err) => {
        expect(err).toBeTruthy();
        done();
      },
    });
    const req = httpMock.expectOne('/trpc/error');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
