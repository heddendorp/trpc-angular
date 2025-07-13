#!/bin/bash

# Custom publish script for changesets
# This script builds the packages and publishes them to npm

set -e

echo "Building packages..."
yarn build

echo "Publishing packages..."

# Publish trpc-link-angular if it exists and built successfully
if [ -d "dist/trpc-link-angular" ]; then
  echo "Publishing @heddendorp/trpc-link-angular..."
  cd dist/trpc-link-angular
  npm publish --access public
  cd ../..
  echo "✅ Published @heddendorp/trpc-link-angular"
else
  echo "⚠️  dist/trpc-link-angular not found, skipping..."
fi

# Publish tanstack-angular-query if it exists and built successfully
if [ -d "dist/tanstack-angular-query" ]; then
  echo "Publishing @heddendorp/tanstack-angular-query..."
  cd dist/tanstack-angular-query
  npm publish --access public
  cd ../..
  echo "✅ Published @heddendorp/tanstack-angular-query"
else
  echo "⚠️  dist/tanstack-angular-query not found, skipping..."
fi

echo "Publishing completed!"