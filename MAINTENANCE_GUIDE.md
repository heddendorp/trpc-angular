# Maintenance Guide for tRPC Angular Packages

This guide provides comprehensive instructions for maintaining, testing, and publishing the `@heddendorp/trpc-link-angular` and `@heddendorp/tanstack-angular-query` packages.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Development Setup](#development-setup)
- [Building](#building)
- [Testing](#testing)
- [Local Testing](#local-testing)
- [Publishing](#publishing)
- [Troubleshooting](#troubleshooting)
- [Package-Specific Notes](#package-specific-notes)

## Repository Structure

This repository uses Angular workspace with multiple projects:

```
.
├── projects/
│   ├── trpc-link-angular/          # Angular HttpClient integration
│   │   ├── src/
│   │   ├── package.json
│   │   └── ng-package.json
│   └── tanstack-angular-query/     # TanStack Angular Query integration
│       ├── src/
│       ├── package.json
│       └── ng-package.json
├── examples/                       # Usage examples and guides
├── MAINTENANCE_GUIDE.md           # This file
├── README.md                      # Main project README
├── package.json                   # Root package.json
└── angular.json                   # Angular workspace configuration
```

## Development Setup

### Prerequisites

- Node.js 24+ (Node 24 is the default version)
- Yarn 4.9.2 (managed by Corepack)
- Angular CLI 20+

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/heddendorp/trpc-angular.git
   cd trpc-angular
   ```

2. **Enable Corepack (for Yarn 4.x)**:
   ```bash
   corepack enable
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   ```

4. **Verify setup**:
   ```bash
   yarn build
   ```

### Project Commands

Navigate to specific projects:

```bash
cd projects/trpc-link-angular
ng build
```

Or run commands from root:

```bash
ng build trpc-link-angular
ng build tanstack-angular-query
```

## Building

### Build All Packages

```bash
yarn build
```

### Build Individual Packages

```bash
# Build trpc-link-angular
ng build trpc-link-angular

# Build tanstack-angular-query
ng build tanstack-angular-query
```

### Development Build

```bash
# Watch mode for development
ng build trpc-link-angular --watch
ng build tanstack-angular-query --watch
```

### Output Structure

Built packages are output to:
- `dist/trpc-link-angular/`
- `dist/tanstack-angular-query/`

Each directory contains:
- `package.json` - Package manifest
- `*.d.ts` - TypeScript declarations
- `esm2022/` - ES2022 modules
- `fesm2022/` - Flat ES2022 modules
- `README.md` - Package documentation

## Testing

### Current State

⚠️ **Note**: Comprehensive test suite is not yet implemented. This is a priority for future development.

### Running Tests

```bash
# Run all tests
ng test

# Run tests for specific project
ng test trpc-link-angular
ng test tanstack-angular-query
```

### Adding Tests

To add proper tests:

1. **Install testing dependencies**:
   ```bash
   yarn add -D @angular/testing jasmine karma karma-chrome-headless
   ```

2. **Create test files**:
   ```bash
   # In projects/trpc-link-angular/src/
   touch angularHttpLink.spec.ts
   
   # In projects/tanstack-angular-query/src/
   touch lib/trpc-query.spec.ts
   ```

3. **Configure test environment** in `karma.conf.js` for each project

## Local Testing

### Link Packages Locally

1. **Build packages**:
   ```bash
   yarn build
   ```

2. **Link for local testing**:
   ```bash
   cd dist/trpc-link-angular
   yarn link
   
   cd ../tanstack-angular-query
   yarn link
   ```

3. **Use in test project**:
   ```bash
   cd /path/to/test-project
   yarn link @heddendorp/trpc-link-angular
   yarn link @heddendorp/tanstack-angular-query
   ```

### Test with Example Application

1. **Create test Angular application**:
   ```bash
   ng new test-app
   cd test-app
   ```

2. **Install tRPC dependencies**:
   ```bash
   yarn add @trpc/client @trpc/server
   ```

3. **Link local packages**:
   ```bash
   yarn link @heddendorp/trpc-link-angular
   yarn link @heddendorp/tanstack-angular-query
   ```

4. **Test integration** following the examples in the `examples/` directory

## Publishing

### Automated Publishing with Semantic Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated version management and publishing.

#### How it works:

1. **Commit messages** follow the [Conventional Commits](https://www.conventionalcommits.org/) format
2. **Semantic-release** analyzes commit messages to determine version bumps
3. **GitHub Actions** automatically publishes packages on push to main branch
4. **Changelog** and **GitHub releases** are automatically generated

#### Commit Message Format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Breaking Changes:**
- Add `BREAKING CHANGE:` in the commit footer
- Or use `feat!:` or `fix!:` for major version bump

#### Examples:

```bash
# Patch version bump
git commit -m "fix: resolve HTTP interceptor issue"

# Minor version bump
git commit -m "feat: add new query hook for mutations"

# Major version bump
git commit -m "feat!: change API signature

BREAKING CHANGE: The angularHttpLink function now requires HttpClient as a parameter"
```

### Manual Publishing

If needed, publish packages individually:

```bash
cd dist/trpc-link-angular
npm publish

cd ../tanstack-angular-query
npm publish
```

### Release Process

1. **Create feature branch** and make changes
2. **Follow conventional commits** for all commit messages
3. **Create PR** and merge to main
4. **Semantic-release** runs automatically and:
   - Analyzes commits since last release
   - Generates changelog
   - Bumps version numbers
   - Creates GitHub release
   - Publishes to npm (if version changed)

### Pre-publishing Checklist

- [ ] All packages build successfully
- [ ] Tests pass (when implemented)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Breaking changes are documented

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules
   yarn install
   
   # Clear Angular cache
   ng cache clean
   ```

2. **TypeScript Errors**:
   - Check peer dependency versions
   - Ensure TypeScript version compatibility
   - Verify Angular version compatibility

3. **Dependency Conflicts**:
   ```bash
   # Check for version conflicts
   yarn why [package-name]
   
   # Check workspace dependencies
   yarn workspaces list
   
   # Check dependency graph
   yarn info @heddendorp/trpc-link-angular
   
   # Verbose build for debugging
   ng build --verbose
   ```

### Build Debugging

For detailed build information:

```bash
ng build trpc-link-angular --verbose
ng build tanstack-angular-query --verbose
```

### Peer Dependencies

Keep peer dependencies updated:

```json
{
  "peerDependencies": {
    "@angular/common": ">=16.0.0",
    "@angular/core": ">=16.0.0",
    "@trpc/client": "11.4.3",
    "@trpc/server": "11.4.3",
    "rxjs": ">=7.0.0",
    "typescript": ">=5.7.2"
  }
}
```

## Release Process

### Version Management

1. **Update version numbers** in:
   - `projects/trpc-link-angular/package.json`
   - `projects/tanstack-angular-query/package.json`

2. **Update CHANGELOG.md** with new features and breaking changes

3. **Create release branch**:
   ```bash
   git checkout -b release/v1.0.0
   ```

4. **Verify publication**:
   ```bash
   npm info @heddendorp/trpc-link-angular
   npm info @heddendorp/tanstack-angular-query
   ```

### Semantic Versioning

Follow semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Breaking Changes

When introducing breaking changes:
1. Update major version number
2. Document migration guide
3. Update examples and documentation
4. Consider deprecation warnings in previous version

## Package-Specific Notes

### trpc-link-angular

- **Purpose**: Provides Angular HttpClient integration for tRPC
- **Key Files**: `src/lib/angular-http-link.ts`
- **Dependencies**: `@angular/common`, `@angular/core`, `@trpc/client`
- **Build Target**: ES2022 with TypeScript declarations

### tanstack-angular-query

- **Purpose**: Provides TanStack Angular Query integration for tRPC
- **Key Files**: `src/lib/`, `src/public-api.ts`
- **Dependencies**: `@tanstack/angular-query-experimental`, `@trpc/client`
- **Build Target**: ES2022 with TypeScript declarations

## Contributing

### Code Style

- Follow Angular coding style guidelines
- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

### Testing Guidelines

- Write unit tests for all new features
- Test with different Angular versions
- Test peer dependency compatibility
- Include integration tests

## Future Improvements

1. Add comprehensive test suite
2. Implement proper linting configuration
3. Add more detailed examples
4. Consider adding subscription support to trpc-link-angular
5. Optimize bundle size and tree-shaking

### Maintenance

- Regular dependency updates
- Angular version compatibility testing
- Performance monitoring
- Documentation updates
- Community feedback integration

## Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with reproduction steps
- Use discussion for general questions
- Follow security reporting guidelines for vulnerabilities