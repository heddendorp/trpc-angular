import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { 
  QueryClient, 
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental';
import { 
  injectTRPCQuery, 
  injectTRPCMutation, 
  injectTRPCInfiniteQuery,
  provideTRPC 
} from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

describe('tRPC Convenience Functions', () => {
  let queryClient: QueryClient;
  let trpcClient: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
      ],
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(queryClient),
        provideTRPC(trpcClient),
      ],
    });
  });

  it('should work with injectTRPCQuery', () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div>
          @if (query.isLoading()) {
            <p>Loading...</p>
          } @else if (query.error()) {
            <p>Error: {{ query.error()?.message }}</p>
          } @else {
            <p>{{ query.data() }}</p>
          }
        </div>
      `,
    })
    class TestComponent {
      query = injectTRPCQuery<AppRouter>((trpc) => 
        trpc.hello.queryOptions()
      );
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.query).toBeDefined();
    expect(component.query.isLoading).toBeDefined();
    expect(component.query.data).toBeDefined();
    expect(component.query.error).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should work with injectTRPCQuery with input', () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div>
          @if (query.isLoading()) {
            <p>Loading...</p>
          } @else if (query.error()) {
            <p>Error: {{ query.error()?.message }}</p>
          } @else {
            <p>{{ query.data() }}</p>
          }
        </div>
      `,
    })
    class TestComponent {
      query = injectTRPCQuery<AppRouter>((trpc) => 
        trpc.greet.queryOptions({ name: 'World' })
      );
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.query).toBeDefined();
    expect(component.query.isLoading).toBeDefined();
    expect(component.query.data).toBeDefined();
    expect(component.query.error).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should work with injectTRPCMutation', () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div>
          <button (click)="createUser()" [disabled]="mutation.isPending()">
            Create User
          </button>
          @if (mutation.isPending()) {
            <p>Creating...</p>
          } @else if (mutation.error()) {
            <p>Error: {{ mutation.error()?.message }}</p>
          } @else if (mutation.data()) {
            <p>Created user successfully</p>
          }
        </div>
      `,
    })
    class TestComponent {
      mutation = injectTRPCMutation<AppRouter>((trpc) => 
        trpc.createUser.mutationOptions()
      );

      createUser() {
        this.mutation.mutate({ name: 'John Doe' } as any);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.mutation).toBeDefined();
    expect(component.mutation.isPending).toBeDefined();
    expect(component.mutation.mutate).toBeDefined();
    expect(component.mutation.data).toBeDefined();
    expect(component.mutation.error).toBeDefined();
    expect(component.createUser).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should work with injectTRPCInfiniteQuery', () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div>
          @if (infiniteQuery.isLoading()) {
            <p>Loading...</p>
          } @else if (infiniteQuery.error()) {
            <p>Error: {{ infiniteQuery.error()?.message }}</p>
          } @else {
            <div>
              <p>Data loaded successfully</p>
            </div>
            @if (infiniteQuery.hasNextPage()) {
              <button 
                (click)="loadMore()"
                [disabled]="infiniteQuery.isFetchingNextPage()"
              >
                Load More
              </button>
            }
          }
        </div>
      `,
    })
    class TestComponent {
      infiniteQuery = injectTRPCInfiniteQuery<AppRouter>((trpc) => 
        trpc.getUsers.infiniteQueryOptions(
          { limit: 5 },
          {
            initialCursor: 0,
            getNextPageParam: (lastPage: any) => lastPage.nextCursor,
          }
        )
      );

      loadMore() {
        this.infiniteQuery.fetchNextPage();
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.infiniteQuery).toBeDefined();
    expect(component.infiniteQuery.isLoading).toBeDefined();
    expect(component.infiniteQuery.data).toBeDefined();
    expect(component.infiniteQuery.error).toBeDefined();
    expect(component.infiniteQuery.hasNextPage).toBeDefined();
    expect(component.infiniteQuery.fetchNextPage).toBeDefined();
    expect(component.infiniteQuery.isFetchingNextPage).toBeDefined();
    expect(component.loadMore).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should demonstrate the original user pattern', () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [],
      selector: 'app-members-hub',
      styles: ``,
      template: `
        <div>
          @if (rolesQuery.isLoading()) {
            <p>Loading roles...</p>
          } @else if (rolesQuery.error()) {
            <p>Error: {{ rolesQuery.error()?.message }}</p>
          } @else {
            <div>
              <p>Roles loaded successfully</p>
            </div>
          }
        </div>
      `,
    })
    class MembersHubComponent {
      readonly rolesQuery = injectTRPCQuery<AppRouter>((trpc) => 
        trpc.admin.roles.findMany.queryOptions({})
      );
    }

    const fixture = TestBed.createComponent(MembersHubComponent);
    const component = fixture.componentInstance;

    expect(component.rolesQuery).toBeDefined();
    expect(component.rolesQuery.isLoading).toBeDefined();
    expect(component.rolesQuery.data).toBeDefined();
    expect(component.rolesQuery.error).toBeDefined();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});