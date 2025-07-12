# tRPC Angular

[![npm version](https://badge.fury.io/js/@heddendorp/trpc-link-angular.svg)](https://badge.fury.io/js/@heddendorp/trpc-link-angular)
[![npm version](https://badge.fury.io/js/@heddendorp/tanstack-angular-query.svg)](https://badge.fury.io/js/@heddendorp/tanstack-angular-query)

A collection of Angular libraries for tRPC integration, built with Angular 20 and modern tooling.

## Libraries

### 🚀 @heddendorp/trpc-link-angular

A fully functional Angular HttpClient link for tRPC client that allows seamless integration between tRPC and Angular applications.

**Features:**
- ✅ Angular HttpClient integration
- ✅ Full HTTP method support (GET, POST, PATCH)
- ✅ Headers and error handling
- ✅ AbortSignal support
- ✅ TypeScript strict mode
- ✅ Angular 20 compatibility

**Installation:**
```bash
npm install @heddendorp/trpc-link-angular
# or
yarn add @heddendorp/trpc-link-angular
```

**Usage:**
```typescript
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import { HttpClient } from '@angular/common/http';

// In your component or service
constructor(private httpClient: HttpClient) {}

const trpcClient = createTRPCClient({
  links: [
    angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: this.httpClient,
    }),
  ],
});
```

### ⚠️ @heddendorp/tanstack-angular-query

A placeholder implementation for TanStack Angular Query integration with tRPC.

**Current Status:** This library is currently a placeholder due to API compatibility issues with tRPC 11.4.3 and TanStack Query 5.80.3+. The original implementation needs to be updated to work with the latest versions of these dependencies.

**Installation:**
```bash
npm install @heddendorp/tanstack-angular-query
# or
yarn add @heddendorp/tanstack-angular-query
```

**Note:** This library will throw informative errors when used, indicating that the implementation is incomplete.

## Development

This repository is structured as an Angular 20 workspace with two libraries:

### Prerequisites
- Node.js 18+
- Yarn 4.3+
- Angular CLI 20+

### Setup
```bash
# Install dependencies
yarn install

# Build all libraries
yarn build

# Run tests
ng test trpc-link-angular
ng test tanstack-angular-query
```

### Project Structure
```
├── projects/
│   ├── trpc-link-angular/          # Fully functional tRPC Angular link
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── trpc-link-angular.ts
│   │   │   │   ├── http-utils.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── public-api.ts
│   │   └── package.json
│   └── tanstack-angular-query/     # Placeholder implementation
│       ├── src/
│       │   ├── lib/
│       │   │   ├── tanstack-angular-query.ts
│       │   │   └── *.spec.ts
│       │   └── public-api.ts
│       └── package.json
├── angular.json
├── package.json
└── tsconfig.json
```

## Migration from Previous Version

This repository was migrated from a tsdown/lerna-based build system to Angular CLI 20 workspace structure. The migration includes:

- ✅ Modern Angular 20 workspace structure
- ✅ Angular CLI build system
- ✅ Proper TypeScript configuration
- ✅ Karma/Jasmine testing setup
- ✅ Consistent package management with Yarn

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT

## Support

- [GitHub Issues](https://github.com/heddendorp/trpc-angular/issues)
- [Documentation](https://github.com/heddendorp/trpc-angular#readme)

## Star History

<a href="https://www.star-history.com/#heddendorp/trpc&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=heddendorp/trpc&type=Date" />
 </picture>
</a>
