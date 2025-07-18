# tRPC Angular

This repository contains two Angular packages for tRPC:

- `@heddendorp/trpc-link-angular` - Angular HttpClient link for tRPC client
- `@heddendorp/tanstack-angular-query` - TanStack Angular Query Integration for tRPC

## Overview

These packages have been extracted from the main tRPC repository and simplified for Angular-specific use cases.

## Packages

### @heddendorp/trpc-link-angular

An Angular HttpClient link for tRPC client that allows you to use Angular's HttpClient with tRPC.

- **Location**: `projects/trpc-link-angular`
- **Main Purpose**: Provides HTTP transport for tRPC client using Angular's HttpClient
- **Peer Dependencies**:
  - `@angular/common >=16.0.0`
  - `@angular/core >=16.0.0`
  - `@trpc/client 11.4.3`
  - `@trpc/server 11.4.3`
  - `rxjs >=7.0.0`
  - `typescript >=5.7.2`

### @heddendorp/tanstack-angular-query

TanStack Angular Query integration for tRPC that provides reactive data fetching capabilities.

- **Location**: `projects/tanstack-angular-query`
- **Main Purpose**: Provides TanStack Query integration for tRPC with Angular-specific features
- **Peer Dependencies**:
  - `@angular/common >=16.0.0`
  - `@angular/core >=16.0.0`
  - `@tanstack/angular-query-experimental ^5.83.0`
  - `@trpc/client 11.4.3`
  - `@trpc/server 11.4.3`
  - `rxjs >=7.0.0`
  - `typescript >=5.7.2`

## Development

### Installation

```bash
yarn install
```

### Building

To build all packages:

```bash
yarn build
```

To build a specific package:

```bash
ng build trpc-link-angular
ng build tanstack-angular-query
```

### Development server

To start a local development server:

```bash
ng serve
```

### Running tests

To execute unit tests:

```bash
ng test
```

## Documentation

- [Integration Guide](examples/integration-guide.md) - How to use both packages together
- [Standalone Examples](examples/) - Individual package examples  
- [Maintenance Guide](MAINTENANCE_GUIDE.md) - Development and publishing workflow
- [Publishing Process](docs/PUBLISHING.md) - Custom publishing process for workspace dependencies

## Contributing

Please see the [Maintenance Guide](MAINTENANCE_GUIDE.md) for information on contributing to this project.

## License

This project is licensed under the MIT License.
