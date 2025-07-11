# tRPC Angular Packages - Copilot Instructions

## Project Overview

This is a monorepo containing Angular-specific tRPC packages that provide seamless integration between tRPC and Angular applications.

### Packages

1. **@heddendorp/angular-http-client** (`packages/angular-http-client/`)
   - Provides Angular HttpClient integration for tRPC
   - Exports `angularHttpLink` function as alternative to `httpLink`
   - Enables Angular HTTP interceptors, error handling, and Observable patterns
   - Peer dependencies: Angular 16+, tRPC 11.4.3, RxJS 7+

2. **@heddendorp/tanstack-angular-query** (`packages/tanstack-angular-query/`)
   - TanStack Angular Query integration for tRPC
   - Provides Angular DI providers (`provideTRPC`, `injectTRPC`)
   - Type-safe query/mutation options with Angular signals
   - Peer dependencies: Angular 16+, TanStack Angular Query 5.80.3+

## Architecture

### Package Relationship
- Both packages are complementary but independent
- `angular-http-client` provides the transport layer (HTTP communication)
- `tanstack-angular-query` provides the query layer (caching, state management)
- They can be used together for a complete Angular-native tRPC solution

### Integration Pattern
```typescript
// Use angular-http-client for transport
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: '/trpc',
      httpClient: inject(HttpClient),
    }),
  ],
});

// Use tanstack-angular-query for queries
provideTRPC(trpcClient);
```

## Development Workflow

### Package Manager
- **Current**: Using Yarn workspaces (migrated from pnpm)
- **Commands**: `yarn`, `yarn build`, `yarn dev`, `yarn test`

### Build System
- **Bundler**: tsdown (Rollup-based)
- **Output**: Dual ESM/CJS packages with TypeScript declarations
- **Config**: `tsdown.config.ts` in each package

### Scripts
- `yarn build`: Build all packages
- `yarn dev`: Watch mode development
- `yarn test`: Run tests (currently skipped - packages build successfully)
- `yarn lint`: Lint code (currently skipped)
- `yarn clean`: Clean build artifacts and node_modules

## File Structure

```
/
├── packages/
│   ├── angular-http-client/
│   │   ├── src/
│   │   │   ├── index.ts          # Main exports
│   │   │   ├── angularHttpLink.ts # Core implementation
│   │   │   └── httpUtils.ts      # HTTP utilities
│   │   ├── package.json
│   │   └── tsdown.config.ts
│   └── tanstack-angular-query/
│       ├── src/
│       │   ├── index.ts          # Main exports
│       │   └── internals/        # Internal implementation
│       ├── examples/             # Usage examples
│       ├── package.json
│       └── tsdown.config.ts
├── package.json                  # Root workspace config
└── lerna.json                    # Publishing config
```

## Key Features

### angular-http-client
- Full Angular HttpClient integration
- HTTP interceptors support
- Error handling with HttpErrorResponse
- Headers support (static and dynamic)
- Request cancellation with AbortSignal
- TypeScript support with Angular types

### tanstack-angular-query
- Type-safe tRPC procedures
- Angular dependency injection
- Signal-based reactivity
- Query/mutation/subscription support
- Optimistic updates
- SSR compatibility

## Common Development Tasks

### Adding New Features
1. Make changes in relevant package's `src/` directory
2. Update exports in `index.ts`
3. Add TypeScript types as needed
4. Update package.json if adding dependencies
5. Test with `yarn build`

### Testing Integration
1. Check examples in `packages/tanstack-angular-query/examples/`
2. Use examples to test new features
3. Verify type safety in TypeScript

### Publishing
1. Use Lerna for coordinated publishing
2. Ensure both packages have compatible versions
3. Update peer dependencies if needed

## Best Practices

### Code Style
- Use TypeScript strict mode
- Follow Angular naming conventions
- Prefer dependency injection over direct imports
- Use Angular signals for reactivity

### Package Design
- Keep packages focused on single responsibilities
- Maintain peer dependency compatibility
- Provide comprehensive TypeScript types
- Include practical examples

### Documentation
- Update README files for any API changes
- Include code examples for new features
- Document breaking changes clearly
- Keep peer dependency requirements updated

## Troubleshooting

### Build Issues
- Check TypeScript configuration in `tsconfig.json`
- Verify peer dependencies are installed
- Ensure tsdown config is correct

### Type Issues
- Check `@trpc/client` and `@trpc/server` versions match
- Verify Angular version compatibility
- Check TypeScript version requirements

### Integration Issues
- Ensure proper provider setup in Angular
- Check DI token configuration
- Verify HTTP client injection

## Future Considerations

### Potential Improvements
1. Add comprehensive test suite
2. Implement proper linting configuration
3. Add more detailed examples
4. Consider adding subscription support to angular-http-client
5. Optimize bundle size and tree-shaking

### Maintenance
- Keep up with Angular releases
- Monitor TanStack Query experimental status
- Update tRPC versions as needed
- Consider adding automated testing