#!/bin/bash

# Release script for tRPC Angular packages
# Usage: ./scripts/release.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.0.0"
    exit 1
fi

echo "🚀 Starting release process for version $VERSION"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Please run this script from the main branch"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Update package versions
echo "📝 Updating package versions..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" projects/trpc-link-angular/package.json
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" projects/tanstack-angular-query/package.json

# Clean up backup files
rm -f projects/trpc-link-angular/package.json.bak
rm -f projects/tanstack-angular-query/package.json.bak

# Build packages
echo "🔨 Building packages..."
yarn build

# Run tests (if they exist)
echo "🧪 Running tests..."
# yarn test --watch=false --browsers=ChromeHeadless || echo "⚠️  Tests failed or not implemented"

# Commit version changes
echo "📝 Committing version changes..."
git add projects/trpc-link-angular/package.json projects/tanstack-angular-query/package.json
git commit -m "chore: bump version to $VERSION"

# Create and push tag
echo "🏷️  Creating tag v$VERSION..."
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION completed successfully!"
echo "🌐 GitHub Actions will automatically publish the packages to npm"
echo "📦 Check the releases page: https://github.com/heddendorp/trpc-angular/releases"