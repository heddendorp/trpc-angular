# Copilot Instructions for tRPC Angular

This is a monorepo containing Angular-specific tRPC packages that provide seamless integration between tRPC and Angular applications.

## Repository Overview

### Packages

1. **@heddendorp/trpc-link-angular** (`projects/trpc-link-angular/`)
   - Provides Angular HttpClient integration for tRPC
   - Exports `angularHttpLink` function as alternative to `httpLink`
   - Enables Angular HTTP interceptors, error handling, and Observable patterns
   - Main file: `src/lib/angular-http-link.ts`

2. **@heddendorp/tanstack-angular-query** (`projects/tanstack-angular-query/`)
   - Provides TanStack Angular Query integration for tRPC
   - Exports Angular-specific hooks and utilities for reactive data fetching
   - Includes query, mutation, and infinite query support
   - Main file: `src/lib/`

### Package Relationship
- Both packages are complementary but independent
- `trpc-link-angular` provides the transport layer (HTTP communication)
- `tanstack-angular-query` provides the query layer (caching, state management)
- They can be used together for a complete Angular-native tRPC solution

### Integration Pattern
```typescript
// Use trpc-link-angular for transport
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: inject(HttpClient),
    }),
  ],
});

// Use tanstack-angular-query for reactive queries
const userQuery = injectTRPCQuery((trpc) => 
  trpc.user.get.query({ id: 1 })
);
```

## Development Environment

### Tech Stack
- **Angular**: 20.x (supports 16+)
- **TypeScript**: 5.8.x
- **Node.js**: 18+ or 20+
- **Package Manager**: Yarn 4.9.2 (via Corepack)
- **Build System**: Angular CLI + ng-packagr

### Project Structure
```
/
├── projects/
│   ├── trpc-link-angular/
│   │   ├── src/
│   │   │   ├── lib/               # Library code
│   │   │   │   └── angular-http-link.ts
│   │   │   └── public-api.ts      # Public exports
│   │   ├── package.json
│   │   └── ng-package.json
│   └── tanstack-angular-query/
│       ├── src/
│       │   ├── lib/               # Library code
│       │   └── public-api.ts      # Public exports
│       ├── package.json
│       └── ng-package.json
├── examples/                      # Usage examples
├── dist/                         # Build outputs
├── package.json                  # Root package.json
└── angular.json                  # Angular workspace config
```

## Key Features

### trpc-link-angular
- Full Angular HttpClient integration
- HTTP interceptors support
- Error handling with HttpErrorResponse
- Observable patterns
- TypeScript type safety
- Dependency injection compatible

### tanstack-angular-query
- Reactive query management
- Angular signals integration
- Infinite queries support
- Mutation handling
- Cache management
- Background refetching
- Error boundaries

## Development Commands

### Building
```bash
# Build all packages
yarn build

# Build specific package
ng build trpc-link-angular
ng build tanstack-angular-query

# Watch mode
ng build trpc-link-angular --watch
```

### Testing
```bash
# Run all tests
ng test

# Run specific package tests
ng test trpc-link-angular
ng test tanstack-angular-query
```

### Local Development
```bash
# Install dependencies
yarn install

# Start development server
ng serve

# Link packages locally
cd dist/trpc-link-angular && yarn link
cd dist/tanstack-angular-query && yarn link
```

## Code Standards

### TypeScript
- Use strict mode
- Leverage type inference
- Avoid `any` types
- Use proper generic constraints

### Angular
- Use standalone components
- Implement OnPush change detection
- Use dependency injection
- Follow Angular style guide
- Use signals for reactive state

### tRPC Integration
- Maintain type safety across client-server boundary
- Use proper error handling
- Implement proper serialization
- Follow tRPC patterns and conventions

## Testing Guidelines

### Unit Tests
- Test all public APIs
- Mock external dependencies
- Test error scenarios
- Verify type safety

### Integration Tests
- Test package interactions
- Verify Angular integration
- Test HTTP interceptors
- Test error handling

### E2E Tests
- Test complete workflows
- Verify browser compatibility
- Test performance
- Test real server integration

## Documentation

### Structure
- Main README.md - Project overview
- Package READMEs - Package-specific documentation
- Examples - Usage examples and guides
- MAINTENANCE_GUIDE.md - Development workflow

### Content Guidelines
- Include installation instructions
- Provide clear examples
- Document API references
- Include migration guides
- Add troubleshooting sections

## Release Process

### Version Management
- Follow semantic versioning
- Update package.json versions
- Update CHANGELOG.md
- Create release tags

### Publishing
- Build packages first
- Test in local environment
- Publish to npm registry
- Update documentation

## Future Roadmap

### Planned Features
1. Add comprehensive test suite
2. Implement proper linting configuration
3. Add more detailed examples
4. Consider adding subscription support to trpc-link-angular
5. Optimize bundle size and tree-shaking

### Maintenance
- Regular dependency updates
- Angular version compatibility
- Performance optimizations
- Community feedback integration
- Security updates

## Support and Community

### Issues
- Use GitHub issues for bug reports
- Provide reproduction steps
- Include environment details
- Follow issue templates

### Contributions
- Fork repository
- Create feature branches
- Follow coding standards
- Add tests for new features
- Update documentation

### Communication
- Use GitHub discussions for questions
- Follow security reporting guidelines
- Provide feedback on improvements
- Share usage examples

## Security Considerations

### Dependencies
- Keep dependencies updated
- Monitor security advisories
- Use peer dependencies appropriately
- Avoid vulnerable packages

### Code Quality
- Use linting tools
- Follow security best practices
- Validate inputs
- Handle errors properly

This repository aims to provide the best possible tRPC integration for Angular applications while maintaining high code quality, comprehensive documentation, and strong community support.