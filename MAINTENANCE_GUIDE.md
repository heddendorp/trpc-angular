# Maintenance Guide for tRPC Angular Packages

This guide provides comprehensive instructions for maintaining, testing, and publishing the `@heddendorp/angular-http-client` and `@heddendorp/tanstack-angular-query` packages.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Package Management](#package-management)
3. [Building](#building)
4. [Testing](#testing)
5. [Publishing](#publishing)
6. [Versioning](#versioning)
7. [Troubleshooting](#troubleshooting)
8. [Workflow](#workflow)

## Development Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Yarn**: 4.3.0 or higher
- **Git**: For version control

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/heddendorp/trpc.git
   cd trpc
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Verify setup**:
   ```bash
   yarn build
   ```

## Package Management

### Workspace Structure

This repository uses Yarn workspaces:

```
packages/
├── angular-http-client/          # Angular HttpClient integration
│   ├── src/
│   ├── package.json
│   └── tsdown.config.ts
└── tanstack-angular-query/       # TanStack Query integration
    ├── src/
    ├── package.json
    └── tsdown.config.ts
```

### Available Scripts

- `yarn build` - Build all packages
- `yarn dev` - Build all packages in watch mode
- `yarn test` - Run tests (currently skipped)
- `yarn lint` - Run linting (currently skipped)
- `yarn clean` - Clean build artifacts and node_modules

### Working with Individual Packages

Navigate to specific packages:

```bash
cd packages/angular-http-client
yarn build
```

Or run commands from root:

```bash
yarn workspace @heddendorp/angular-http-client build
```

## Building

### Build System

- **Bundler**: `tsdown` (Rollup-based)
- **Output**: Dual ESM/CJS packages with TypeScript declarations
- **Configuration**: `tsdown.config.ts` in each package

### Build Commands

```bash
# Build all packages
yarn build

# Build in watch mode (for development)
yarn dev

# Build specific package
yarn workspace @heddendorp/angular-http-client build
```

### Output Structure

After building, each package generates:

```
dist/
├── index.cjs         # CommonJS bundle
├── index.d.cts       # CommonJS types
├── index.mjs         # ES modules bundle
├── index.d.mts       # ES modules types
└── *.map            # Source maps
```

## Testing

### Current Testing Status

Currently, both packages use placeholder test commands:
- Tests are skipped with message "Tests skipped - package builds successfully"
- The packages are validated by successful compilation

### Adding Tests

To add proper tests:

1. **Install testing dependencies**:
   ```bash
   yarn add -D vitest @testing-library/angular
   ```

2. **Create test files**:
   ```bash
   # In packages/angular-http-client/src/
   touch angularHttpLink.test.ts
   
   # In packages/tanstack-angular-query/src/
   touch index.test.ts
   ```

3. **Update package.json test scripts**:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch"
     }
   }
   ```

### Manual Testing

1. **Build the packages**:
   ```bash
   yarn build
   ```

2. **Link for local testing**:
   ```bash
   cd packages/angular-http-client
   yarn link
   
   cd ../tanstack-angular-query
   yarn link
   ```

3. **Use in test project**:
   ```bash
   cd /path/to/test-project
   yarn link @heddendorp/angular-http-client
   yarn link @heddendorp/tanstack-angular-query
   ```

## Publishing

### Publishing Process

The repository uses **Lerna** for coordinated publishing.

### Prerequisites

1. **npm account**: Ensure you have access to publish to the `@heddendorp` scope
2. **npm login**: 
   ```bash
   npm login
   ```

### Publishing Steps

1. **Ensure clean working directory**:
   ```bash
   git status
   # Should show "working tree clean"
   ```

2. **Build packages**:
   ```bash
   yarn build
   ```

3. **Publish with Lerna**:
   ```bash
   yarn publish
   ```
   
   This will:
   - Prompt for version bump (patch, minor, major)
   - Update package.json versions
   - Create git commit and tag
   - Publish to npm
   - Push to GitHub

### Manual Publishing

If needed, publish packages individually:

```bash
cd packages/angular-http-client
npm publish

cd ../tanstack-angular-query
npm publish
```

## Versioning

### Current Version Strategy

- Both packages start at version `0.0.1`
- Use semantic versioning (SemVer)
- Lerna keeps versions in sync

### Version Bumping

- **Patch** (0.0.1 → 0.0.2): Bug fixes
- **Minor** (0.0.1 → 0.1.0): New features (backward compatible)
- **Major** (0.0.1 → 1.0.0): Breaking changes

### Dependencies

Keep peer dependencies updated:

```json
{
  "peerDependencies": {
    "@angular/common": ">=16.0.0",
    "@angular/core": ">=16.0.0",
    "@trpc/client": "11.4.3",
    "@trpc/server": "11.4.3"
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear build cache
   yarn clean
   yarn install
   yarn build
   ```

2. **TypeScript Errors**:
   - Check `tsconfig.json` configuration
   - Ensure all dependencies are installed
   - Verify TypeScript version compatibility

3. **Peer Dependency Warnings**:
   ```bash
   # These are expected and can be ignored during development
   # They indicate missing peer dependencies that consuming apps should provide
   ```

4. **Yarn Issues**:
   ```bash
   # Reset yarn cache
   yarn cache clean
   rm -rf node_modules yarn.lock
   yarn install
   ```

### Debug Commands

```bash
# Check workspace structure
yarn workspaces list

# Check dependency graph
yarn info @heddendorp/angular-http-client

# Verbose build
yarn build --verbose
```

## Workflow

### Feature Development

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**:
   - Edit source files in `packages/*/src/`
   - Update documentation if needed

3. **Test changes**:
   ```bash
   yarn build
   # Manual testing with link
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   ```

### Release Workflow

1. **Merge to main**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Build and test**:
   ```bash
   yarn build
   ```

3. **Publish**:
   ```bash
   yarn publish
   ```

4. **Verify publication**:
   ```bash
   npm info @heddendorp/angular-http-client
   npm info @heddendorp/tanstack-angular-query
   ```

### Maintenance Tasks

#### Monthly

- [ ] Update dependencies
- [ ] Check for security vulnerabilities
- [ ] Review and update documentation

#### Quarterly

- [ ] Review Angular version compatibility
- [ ] Update TypeScript version
- [ ] Check TanStack Query compatibility
- [ ] Review and update peer dependencies

#### Before Major Releases

- [ ] Review breaking changes
- [ ] Update migration guides
- [ ] Test with multiple Angular versions
- [ ] Update README and documentation

## Package-Specific Notes

### angular-http-client

- **Purpose**: Provides Angular HttpClient integration for tRPC
- **Key Files**: `src/angularHttpLink.ts`, `src/httpUtils.ts`
- **Dependencies**: Angular Common, Angular Core, tRPC Client
- **Testing**: Focus on HTTP interceptors and error handling

### tanstack-angular-query

- **Purpose**: TanStack Query integration for tRPC with Angular
- **Key Files**: `src/index.ts`, `src/internals/`
- **Dependencies**: Angular Core, TanStack Angular Query, tRPC Client
- **Testing**: Focus on query/mutation providers and Angular DI

## Resources

- [Angular Package Format](https://angular.io/guide/angular-package-format)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/framework/angular/overview)
- [tRPC Documentation](https://trpc.io/docs)
- [Lerna Documentation](https://lerna.js.org/)
- [tsdown Documentation](https://github.com/so1ve/tsdown)

## Support

For issues or questions:

1. Check this maintenance guide
2. Search existing GitHub issues
3. Create a new issue with detailed reproduction steps
4. Join discussions in the repository