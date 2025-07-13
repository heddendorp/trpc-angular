#!/bin/bash

# Script to update package versions for semantic-release
# This script is called by semantic-release to update package.json versions

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

echo "Updating package versions to $VERSION"

# Update package versions
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" projects/trpc-link-angular/package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" projects/tanstack-angular-query/package.json

echo "Package versions updated to $VERSION"