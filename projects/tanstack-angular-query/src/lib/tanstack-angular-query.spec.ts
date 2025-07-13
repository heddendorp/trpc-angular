import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TanstackAngularQuery } from './tanstack-angular-query';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TanstackAngularQuery', () => {
  let component: TanstackAngularQuery;
  let fixture: ComponentFixture<TanstackAngularQuery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TanstackAngularQuery, provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TanstackAngularQuery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
