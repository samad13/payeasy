#!/usr/bin/env node
/**
 * Local verification script to test if the fixes work
 * Run this before pushing to GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function checkStep(name, fn) {
    try {
        log(`\n→ ${name}...`, 'blue');
        fn();
        log(`  ✓ ${name}`, 'green');
        return true;
    } catch (e) {
        log(`  ✗ ${name}: ${e.message}`, 'red');
        return false;
    }
}

log('\n========================================', 'blue');
log('  Payeasy CI Fix Verification Script', 'blue');
log('========================================\n', 'blue');

let passed = 0;
let failed = 0;

// Step 1: Validate root package.json
if (checkStep('Validate root package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    if (!pkg.name || !pkg.workspaces) throw new Error('Invalid package.json structure');
})) {
    passed++;
} else {
    failed++;
}

// Step 2: Validate apps/web/package.json
if (checkStep('Validate apps/web/package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('apps/web/package.json', 'utf-8'));
    if (!pkg.scripts || !pkg.scripts.build) throw new Error('Missing build script');
})) {
    passed++;
} else {
    failed++;
}

// Step 3: Check .gitignore configuration
if (checkStep('Check .gitignore for .next/ exclusion', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (!gitignore.includes('.next/')) throw new Error('.next/ not in .gitignore');
})) {
    passed++;
} else {
    failed++;
}

// Step 4: Verify settings files exist
if (checkStep('Verify system settings implementation files', () => {
    const files = [
        'apps/web/lib/settings/service.ts',
        'apps/web/app/actions/settings.ts',
        'apps/web/app/(admin)/settings/page.tsx',
    ];
    for (const file of files) {
        if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
    }
})) {
    passed++;
} else {
    failed++;
}

// Step 5: Check jest configuration
if (checkStep('Validate Jest configuration', () => {
    const config = fs.readFileSync('apps/web/jest.config.js', 'utf-8');
    if (!config.includes('jest-environment-jsdom')) throw new Error('Jest config incomplete');
})) {
    passed++;
} else {
    failed++;
}

// Step 6: Verify workflow file
if (checkStep('Verify GitHub Actions workflow', () => {
    const workflow = fs.readFileSync('.github/workflows/bundle-size.yml', 'utf-8');
    if (!workflow.includes('npm run bundle:check')) throw new Error('Bundle check step missing');
})) {
    passed++;
} else {
    failed++;
}

// Summary
log('\n========================================', 'blue');
log(`Results: ${passed} passed, ${failed} failed`, passed === 6 ? 'green' : 'red');
log('========================================\n', 'blue');

if (failed === 0) {
    log('✓ All local verifications passed!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Run: npm ci', 'yellow');
    log('2. Run: npm run build', 'yellow');
    log('3. Run: npm run bundle:check', 'yellow');
    log('4. Run: npm test (in apps/web)', 'yellow');
    log('5. Commit and push changes', 'yellow');
    process.exit(0);
} else {
    log('✗ Some verifications failed. Please review the errors above.', 'red');
    process.exit(1);
}
