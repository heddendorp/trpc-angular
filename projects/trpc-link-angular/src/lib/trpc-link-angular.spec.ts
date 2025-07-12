import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { angularHttpLink } from './trpc-link-angular';

describe('angularHttpLink', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: {
            get: jasmine.createSpy('get'),
            post: jasmine.createSpy('post'),
            patch: jasmine.createSpy('patch'),
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
  });

  it('should create angular http link', () => {
    const link = angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: httpClient,
    });
    
    expect(link).toBeDefined();
    expect(typeof link).toBe('function');
  });
});
