# tRPC Angular Packages

This repository contains two Angular packages for tRPC:

- `@heddendorp/angular-http-client` - Angular HttpClient link for tRPC client
- `@heddendorp/tanstack-angular-query` - TanStack Angular Query Integration for tRPC

## Overview

These packages have been extracted from the main tRPC repository and simplified for easier maintenance and publishing to the `@heddendorp` npm scope.

## Packages

### @heddendorp/angular-http-client

An Angular HttpClient link for tRPC client that allows you to use Angular's HttpClient with tRPC.

- **Location**: `packages/angular-http-client`
- **Main Purpose**: Provides HTTP transport for tRPC client using Angular's HttpClient
- **Peer Dependencies**:
  - `@angular/common >=16.0.0`
  - `@angular/core >=16.0.0`
  - `@trpc/client 11.4.3`
  - `@trpc/server 11.4.3`
  - `rxjs >=7.0.0`

### @heddendorp/tanstack-angular-query

TanStack Angular Query Integration for tRPC that provides reactive query capabilities for Angular applications.

- **Location**: `packages/tanstack-angular-query`
- **Main Purpose**: Integrates tRPC with TanStack Angular Query for reactive data fetching
- **Peer Dependencies**:
  - `@angular/core >=16.0.0`
  - `@tanstack/angular-query-experimental >=5.80.3`
  - `@trpc/client 11.4.3`
  - `@trpc/server 11.4.3`

## Development

### Prerequisites

- Node.js 18+
- Yarn 4.x

### Installation

```bash
yarn install
```

### Building

```bash
yarn build
```

### Running Tests

```bash
yarn test
```

### Publishing

```bash
yarn publish
```

## Context7 Integration

This project is configured to work with Context7, an AI documentation tool. The `context7.json` file defines how AI coding assistants should interpret and use this project's documentation.

### Using with Context7

When working with AI coding assistants that support Context7, you can reference this project by:

1. **Using the library name**: Mention "tRPC Angular packages" or "heddendorp angular trpc" in your prompts
2. **Using the direct library ID**: Use `/heddendorp/trpc` if available in the Context7 registry
3. **Adding "use context7"** to your prompts to get up-to-date documentation

### Examples

```
Create an Angular service that uses tRPC with HttpClient. use context7
```

```
Set up TanStack Angular Query with tRPC in an Angular 16+ app. use context7
```

## GitHub Actions

The repository includes a simplified CI/CD pipeline:

- **CI**: Runs on push to main/next branches and PRs
- **Publishing**: Automatically publishes packages to npm when changes are pushed to main

## Architecture

The repository is structured as a monorepo with:

- **Root**: Contains shared configuration and scripts
- **packages/**: Contains the two Angular packages
- **Build System**: Uses `tsdown` for building TypeScript packages
- **Package Manager**: Uses `yarn` with workspaces
- **Publishing**: Uses `lerna` for coordinated publishing

## Star History

<a href="https://www.star-history.com/#heddendorp/trpc&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date" />
 </picture>
</a>
