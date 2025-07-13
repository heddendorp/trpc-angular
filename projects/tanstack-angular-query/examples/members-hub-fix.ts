/**
 * This example demonstrates the fix for the @typeerror_options_fn.js issue
 * mentioned in the problem statement.
 */

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { injectTRPC } from '@heddendorp/tanstack-angular-query';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AppRouter } from '../../../server/trpc/app-router';

/**
 * BEFORE (causing @typeerror_options_fn.js error):
 * 
 * protected readonly rolesQuery = injectQuery(
 *   this.trpc.admin.roles.findMany.queryOptions({}),
 * );
 */

/**
 * AFTER (fixed version):
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  selector: 'app-members-hub',
  styles: ``,
  template: `
    <div>
      @if (rolesQuery.isLoading()) {
        <p>Loading roles...</p>
      } @else if (rolesQuery.error()) {
        <p>Error: {{ rolesQuery.error()?.message }}</p>
      } @else if (rolesQuery.data()) {
        <div>
          <h3>Roles:</h3>
          <pre>{{ rolesQuery.data() | json }}</pre>
        </div>
      } @else {
        <p>No roles data available</p>
      }
    </div>
  `,
})
export class MembersHubComponent {
  private readonly trpc = injectTRPC<AppRouter>();
  
  // ✅ FIXED: Use functional pattern with injectQuery
  protected readonly rolesQuery = injectQuery(() =>
    this.trpc.admin.roles.findMany.queryOptions({})
  );
  
  constructor() {
    effect(() => {
      const roles = this.rolesQuery.data();
      if (roles) {
        console.log('Roles:', roles);
      } else {
        console.warn('No roles data available');
      }
    });
  }
}

/**
 * Key changes:
 * 1. Wrap the queryOptions call in a function: () => this.trpc.admin.roles.findMany.queryOptions({})
 * 2. This ensures injectQuery receives a function that returns query options
 * 3. The function pattern is reactive and will re-execute when dependencies change
 * 4. This resolves the @typeerror_options_fn.js error by providing the correct type to injectQuery
 */