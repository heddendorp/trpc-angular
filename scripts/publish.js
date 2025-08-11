#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Custom publish script that uses `yarn npm publish` instead of `npm publish`
 * to properly resolve workspace dependencies.
 */
async function publishPackages() {
  try {
    console.log('🚀 Starting custom publish process...');
    
    // First, let's get the list of packages to publish from changeset
    console.log('📋 Checking which packages need to be published...');
    
    const projectDirs = ['dist/trpc-link-angular', 'dist/tanstack-angular-query'];
    const packagesToPublish = [];
    
    for (const dir of projectDirs) {
      const packageJsonPath = path.join(process.cwd(), dir, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check if this version is already published
        try {
          const result = execSync(`yarn npm info ${packageJson.name}@${packageJson.version} --json`, { 
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          if (result.trim()) {
            console.log(`⚠️  ${packageJson.name}@${packageJson.version} is already published, skipping...`);
          } else {
            packagesToPublish.push({ dir, packageJson });
          }
        } catch (error) {
          // If the package doesn't exist or version doesn't exist, we can publish it
          if (error.message.includes('404') || error.message.includes('E404')) {
            packagesToPublish.push({ dir, packageJson });
          } else {
            console.log(`✅ ${packageJson.name}@${packageJson.version} can be published`);
            packagesToPublish.push({ dir, packageJson });
          }
        }
      }
    }
    
    if (packagesToPublish.length === 0) {
      console.log('📝 No packages to publish');
      return;
    }
    
    console.log(`📦 Publishing ${packagesToPublish.length} packages...`);
    
    // Publish each package using yarn npm publish
    for (const { dir, packageJson } of packagesToPublish) {
      console.log(`\n📤 Publishing ${packageJson.name}@${packageJson.version}...`);
      
      try {
        // Change to the package directory
        const packageDir = path.join(process.cwd(), dir);
        const originalCwd = process.cwd();
        process.chdir(packageDir);
        
        // Check if package.json has workspace dependencies that need to be resolved
        const packageJsonPath = path.join(packageDir, 'package.json');
        const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check for workspace dependencies and resolve them
        let needsWorkspaceResolution = false;
        ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].forEach(depType => {
          if (packageContent[depType]) {
            Object.keys(packageContent[depType]).forEach(depName => {
              if (packageContent[depType][depName].startsWith('workspace:')) {
                needsWorkspaceResolution = true;
              }
            });
          }
        });
        
        if (needsWorkspaceResolution) {
          console.log(`🔧 Resolving workspace dependencies for ${packageJson.name}...`);
        }
        
        // Use yarn npm publish to properly resolve workspace dependencies
        const publishCommand = process.env.CHANGESETS_PRERELEASE_TAG 
          ? `yarn npm publish --tag ${process.env.CHANGESETS_PRERELEASE_TAG}`
          : 'yarn npm publish';
        
        console.log(`Running: ${publishCommand}`);
        execSync(publishCommand, { stdio: 'inherit' });
        
        console.log(`✅ Successfully published ${packageJson.name}@${packageJson.version}`);
        
        // Change back to original directory
        process.chdir(originalCwd);
      } catch (error) {
        console.error(`❌ Failed to publish ${packageJson.name}:`, error.message);
        process.exit(1);
      }
    }
    
    // After publishing, create git tags
    console.log('\n🏷️  Creating git tags...');
    try {
      execSync('yarn changeset tag', { stdio: 'inherit' });
      console.log('✅ Git tags created successfully');
    } catch (error) {
      console.error('⚠️  Warning: Failed to create git tags:', error.message);
    }
    
    console.log('\n🎉 All packages published successfully!');
    
  } catch (error) {
    console.error('❌ Publish process failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Custom publish script for workspace dependencies

Usage: node scripts/publish.js [options]

Options:
  --help, -h     Show this help message
  
Environment variables:
  CHANGESETS_PRERELEASE_TAG  If set, publishes with this tag (e.g., 'alpha', 'beta')
  
This script uses 'yarn npm publish' instead of 'npm publish' to properly
resolve workspace dependencies (e.g., "workspace:^" protocol).
`);
  process.exit(0);
}

// Store prerelease tag from command line arguments
if (args.includes('--tag')) {
  const tagIndex = args.indexOf('--tag');
  if (tagIndex >= 0 && args[tagIndex + 1]) {
    process.env.CHANGESETS_PRERELEASE_TAG = args[tagIndex + 1];
  }
}

publishPackages();