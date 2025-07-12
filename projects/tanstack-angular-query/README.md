# @heddendorp/tanstack-angular-query

[![npm version](https://badge.fury.io/js/@heddendorp/tanstack-angular-query.svg)](https://badge.fury.io/js/@heddendorp/tanstack-angular-query)

## ⚠️ PLACEHOLDER IMPLEMENTATION

This library is currently a **placeholder** due to API compatibility issues with tRPC 11.4.3 and TanStack Query 5.80.3+.

## Current Status

The original implementation needs to be updated to work with the latest versions of dependencies. This library will throw informative errors when used, indicating that the implementation is incomplete.

## What This Library Was Intended To Do

This library was designed to provide TanStack Angular Query integration for tRPC, offering:

- 🔄 Reactive query capabilities
- 📱 Optimistic updates
- 🔍 Infinite queries
- 📊 Caching and synchronization
- 🎯 Type-safe mutations

## Installation

```bash
npm install @heddendorp/tanstack-angular-query
# or
yarn add @heddendorp/tanstack-angular-query
```

## Current API

Currently, all exported functions will throw errors:

```typescript
import { 
  provideTRPC, 
  injectTRPC, 
  injectTRPCClient, 
  createTRPCInjectors 
} from '@heddendorp/tanstack-angular-query';

// These will all throw errors indicating the implementation is incomplete
```

## Migration Path

To fully implement this library, the following work needs to be done:

1. **Update tRPC Integration**: Adapt the original implementation to work with tRPC 11.4.3
2. **Update TanStack Query Integration**: Ensure compatibility with TanStack Query 5.80.3+
3. **Angular 20 Compatibility**: Update all Angular-specific code for Angular 20
4. **Type Safety**: Ensure all TypeScript types are properly exported and working
5. **Testing**: Add comprehensive tests for all functionality

## Alternative Solutions

Until this library is fully implemented, you can use:

1. **@heddendorp/trpc-link-angular**: For basic tRPC integration with Angular HttpClient
2. **Direct TanStack Query**: Use TanStack Angular Query directly with tRPC client
3. **Manual Integration**: Create your own integration layer

## Peer Dependencies

When fully implemented, this library will require:

- `@angular/core` ^20.0.0
- `@tanstack/angular-query-experimental` >=5.80.3
- `@trpc/client` ^11.4.3
- `@trpc/server` ^11.4.3

## Development

### Building

To build the library, run:

```bash
ng build tanstack-angular-query
```

### Running Tests

To execute unit tests with Karma:

```bash
ng test tanstack-angular-query
```

## Contributing

If you'd like to help implement this library, please:

1. Fork the repository
2. Create a feature branch
3. Implement the missing functionality
4. Add comprehensive tests
5. Submit a pull request

## License

MIT

## Support

- [GitHub Issues](https://github.com/heddendorp/trpc-angular/issues)
- [Documentation](https://github.com/heddendorp/trpc-angular#readme)
