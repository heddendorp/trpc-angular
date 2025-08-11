# Publishing Process

This document describes the custom publishing process implemented to handle workspace dependencies correctly.

## Problem

The repository uses Yarn workspaces with workspace protocol dependencies (e.g., `"@heddendorp/trpc-link-angular": "workspace:^"`). When publishing packages using the default `npm publish` command, these workspace dependencies are not resolved to their actual version ranges, causing issues for consumers of the packages.

## Solution

The publishing process has been updated to use `yarn npm publish` instead of `npm publish`. This ensures that workspace dependencies are properly resolved before publishing.

### Key Changes

1. **Custom Publish Script**: Created `scripts/publish.js` that:
   - Uses `yarn npm publish` instead of `npm publish`
   - Properly resolves workspace dependencies
   - Handles both regular releases and prereleases
   - Creates git tags after successful publishing

2. **Updated Package Scripts**: Modified `package.json` to use the custom publish script:
   ```json
   {
     "scripts": {
       "changeset:publish": "yarn run build && node scripts/publish.js"
     }
   }
   ```

3. **Updated Workflows**: 
   - Updated `.github/workflows/prerelease.yml` to use the custom publish script
   - The main release workflow continues to use `yarn changeset:publish` which now uses the custom script

4. **Changeset Configuration**: Added `bumpVersionsWithWorkspaceProtocolOnly: false` to `.changeset/config.json` for explicit configuration.

## How It Works

### Regular Releases
1. GitHub Actions runs `yarn changeset:publish`
2. This builds the packages and runs `node scripts/publish.js`
3. The script checks which packages need publishing
4. For each package, it uses `yarn npm publish` to publish with resolved dependencies
5. Git tags are created after successful publishing

### Prereleases
1. GitHub Actions runs `CHANGESETS_PRERELEASE_TAG=alpha node scripts/publish.js`
2. The script publishes packages with the specified prerelease tag
3. Workspace dependencies are resolved during the publish process

## Benefits

- **Proper Dependency Resolution**: Workspace dependencies like `"workspace:^"` are resolved to actual version ranges
- **Consistent Publishing**: Both regular and prerelease workflows use the same underlying mechanism
- **Error Handling**: Better error messages and handling for publish failures
- **Backward Compatibility**: Existing changeset workflows continue to work as expected

## Testing

The custom publish script includes:
- Detection of already published packages (skips them)
- Proper error handling and cleanup
- Support for both regular and tagged releases
- Workspace dependency detection and resolution

## Usage

### Manual Publishing
```bash
# Regular publish
node scripts/publish.js

# Prerelease publish
CHANGESETS_PRERELEASE_TAG=alpha node scripts/publish.js
```

### Via Package Scripts
```bash
# Uses the custom publish script
yarn changeset:publish
```

## Dependencies

The solution relies on:
- Yarn 4.9.2+ (configured via `packageManager` in package.json)
- Node.js for the custom publish script
- Proper workspace configuration in the repository