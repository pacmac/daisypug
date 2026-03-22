#!/usr/bin/env node
/**
 * Bump version in both package.json and lib/dp.js
 * Usage: node scripts/bump.js [major|minor|patch]
 * Default: patch
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const DP_PATH = path.join(ROOT, 'lib', 'dp.js');

const type = process.argv[2] || 'patch';
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Usage: node scripts/bump.js [major|minor|patch]');
  process.exit(1);
}

// Read current version
const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

// Bump
const newVersion = type === 'major' ? `${major + 1}.0.0`
  : type === 'minor' ? `${major}.${minor + 1}.0`
  : `${major}.${minor}.${patch + 1}`;

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// Update dp.js
let dp = fs.readFileSync(DP_PATH, 'utf8');
dp = dp.replace(/dp\.version = '[^']+';/, `dp.version = '${newVersion}';`);
fs.writeFileSync(DP_PATH, dp, 'utf8');

console.log(`${pkg.version.replace(newVersion, pkg.version)} → v${newVersion}`);
