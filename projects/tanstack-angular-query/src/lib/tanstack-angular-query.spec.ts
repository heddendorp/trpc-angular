import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { TanstackAngularQueryService } from './tanstack-angular-query';

describe('TanstackAngularQueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should throw error indicating placeholder implementation', () => {
    expect(() => {
      TestBed.inject(TanstackAngularQueryService);
    }).toThrowError(/TanStack Angular Query integration is not yet implemented/);
  });
});
