#!/bin/bash

# Development script to build only the working package
echo "🔨 Building trpcLinkAngular (working package)..."
ng build trpcLinkAngular

echo "✅ Build completed successfully!"
echo "📦 Package built to: dist/trpc-link-angular/"
echo ""
echo "To test locally:"
echo "  cd dist/trpc-link-angular"
echo "  yarn link"
echo "  # Then in your test project:"
echo "  yarn link @heddendorp/trpc-link-angular"