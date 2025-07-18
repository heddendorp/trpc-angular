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

### Automated Publishing with Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for automated version management and publishing.

#### How it works:

1. **Changeset files** are created to describe changes and their impact
2. **Changesets** analyzes these files to determine version bumps
3. **GitHub Actions** automatically publishes packages when changesets are merged to main
4. **Changelog** and **GitHub releases** are automatically generated

#### Creating a changeset:

```bash
# Create a changeset describing your changes
yarn changeset

# This will prompt you to:
# 1. Select which packages are affected
# 2. Choose the type of change (major, minor, patch)
# 3. Write a summary of the changes
```

#### Changeset Types:

- **Major**: Breaking changes (e.g., API changes, removed features)
- **Minor**: New features, enhancements (backwards compatible)
- **Patch**: Bug fixes, small improvements

#### Example workflow:

```bash
# 1. Make your changes
git checkout -b feature/new-feature
# ... make changes ...

# 2. Create a changeset
yarn changeset
# Select packages: @heddendorp/trpc-link-angular
# Change type: minor
# Summary: "Add new query hook for mutations"

# 3. Commit and push
git add .
git commit -m "feat: add new query hook for mutations"
git push origin feature/new-feature

# 4. Create PR - the changeset file will be included
# 5. Merge PR to main
# 6. Changesets action will create a "Version Packages" PR
# 7. Merge the version PR to trigger release
```

### Manual Publishing

If needed, publish packages individually:

```bash
# Build first
yarn build

# Publish individual packages
cd dist/trpc-link-angular
npm publish --access public

cd ../tanstack-angular-query
npm publish --access public
```

### Release Process

1. **Create feature branch** and make changes
2. **Create changeset** using `yarn changeset`
3. **Create PR** and merge to main (changeset file included)
4. **Changesets action** creates a "Version Packages" PR with:
  - Updated version numbers
  - Generated changelog entries
  - Updated package.json files
5. **Merge version PR** to trigger automatic publishing to npm

### Prerelease Process

For testing changes before official releases, you can create prereleases using the GitHub Actions workflow:

#### Manual Prerelease (Recommended)

1. **Navigate to GitHub Actions**:
  - Go to the repository on GitHub
  - Click on "Actions" tab
  - Select "Prerelease" workflow

2. **Trigger Prerelease**:
  - Click "Run workflow"
  - Select the branch you want to release from
  - Choose a prerelease tag (e.g., `alpha`, `beta`, `rc`)
  - Click "Run workflow"

3. **The workflow will**:
  - Build and test the packages
  - Create snapshot versions (e.g., `0.1.0-alpha-20240101123456`)
  - Publish to npm with the prerelease tag
  - Clean up temporary files

#### Using Prerelease Packages

Install prerelease packages using the tag:

```bash
# Install alpha prerelease
npm install @heddendorp/trpc-link-angular@alpha
npm install @heddendorp/tanstack-angular-query@alpha

# Install beta prerelease
npm install @heddendorp/trpc-link-angular@beta
npm install @heddendorp/tanstack-angular-query@beta
```

#### Prerelease Notes

- Prereleases can be triggered from any branch
- No changesets are required - the workflow will create temporary ones
- Prerelease versions use timestamp-based naming
- Published packages are tagged with the specified prerelease tag
- Original package versions and changesets remain unchanged

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
