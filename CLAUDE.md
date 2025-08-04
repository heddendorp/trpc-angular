# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing two Angular-specific tRPC packages:

- `@heddendorp/trpc-link-angular` - Angular HttpClient integration for tRPC client
- `@heddendorp/tanstack-angular-query` - TanStack Angular Query integration for tRPC

## Common Development Commands

### Building

```bash
# Build all packages
yarn build

# Build specific packages
ng build trpc-link-angular
ng build tanstack-angular-query

# Watch mode for development
ng build trpc-link-angular --watch
```

### Testing

```bash
# Run all tests (uses Vitest)
ng test

# Run tests without watch mode
ng test --watch=false

# Run tests for specific project
ng test trpc-link-angular
ng test tanstack-angular-query
```

### Development

```bash
# Install dependencies
yarn install

# Format code
yarn format

# Start development server
ng serve
```

### Publishing

```bash
# Version and publish using changesets
yarn changeset:version
yarn changeset:publish
```

## Architecture

### Package Structure

- **projects/trpc-link-angular/**: HTTP transport layer using Angular HttpClient
  - Main export: `angularHttpLink` function
  - Key file: `src/lib/trpc-link-angular.ts`
  - Provides Angular-native HTTP requests with interceptor support

- **projects/tanstack-angular-query/**: Reactive query layer integration
  - Main exports: `provideTRPC`, `injectTRPC`, query/mutation options
  - Key files: `src/lib/context.ts`, `src/lib/createOptionsProxy.ts`
  - Provides Angular signals integration and reactive data fetching

### Complementary Architecture

- `trpc-link-angular` handles HTTP communication/transport
- `tanstack-angular-query` handles caching, state management, and reactivity
- Both packages can be used independently or together

### Integration Pattern

```typescript
// Transport layer
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: "http://localhost:3000/trpc",
      httpClient: inject(HttpClient),
    }),
  ],
});

// Query layer
const userQuery = injectTRPCQuery((trpc) => trpc.user.get.query({ id: 1 }));
```

## Tech Stack

- Angular 20.x (supports 16+)
- TypeScript 5.8.x with strict mode
- Yarn 4.9.2 workspaces
- Angular CLI + ng-packagr for building
- Vitest for testing

## Key Considerations

### TypeScript Configuration

- Uses strict TypeScript mode with additional checks
- Project references for efficient compilation
- Angular compiler options enabled for strict templates

### Build System

- Uses Angular's ng-packagr for library builds
- Outputs ES2022 modules with TypeScript declarations
- Built packages go to `dist/` directory

### Testing Framework

- Uses Vitest as test runner (configured in angular.json)
- Test files use `.spec.ts` extension
- Tests are co-located in each package's `src/` directory

### Workspace Structure

- Monorepo managed by Yarn workspaces
- Each package has its own `package.json` and build configuration
- Shared TypeScript configuration at root level

### Publishing Process

- Uses Changesets for automated versioning and publishing
- GitHub Actions handle CI/CD pipeline
- Supports prerelease workflow for testing
