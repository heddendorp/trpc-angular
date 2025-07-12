import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TanstackAngularQueryService {
  constructor() {
    throw new Error(
      'TanStack Angular Query integration is not yet implemented. ' +
      'This is a placeholder service. The original implementation has ' +
      'API compatibility issues with tRPC 11.4.3 and TanStack Query 5.80.3+ ' +
      'that need to be resolved before this service can be fully functional.'
    );
  }
}

// Placeholder exports for the expected API
export function provideTRPC() {
  throw new Error('provideTRPC is not implemented yet');
}

export function injectTRPC() {
  throw new Error('injectTRPC is not implemented yet');
}

export function injectTRPCClient() {
  throw new Error('injectTRPCClient is not implemented yet');
}

export function createTRPCInjectors() {
  throw new Error('createTRPCInjectors is not implemented yet');
}

export function createTRPCOptionsProxy() {
  throw new Error('createTRPCOptionsProxy is not implemented yet');
}

export function injectTRPCSubscription() {
  throw new Error('injectTRPCSubscription is not implemented yet');
}
