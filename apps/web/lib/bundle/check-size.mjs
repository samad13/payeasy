#!/usr/bin/env node

/**
 * CLI script to check bundle sizes after a Next.js build.
 *
 * Usage:
 *   npm run build && npm run bundle:check
 *
 * Exits with code 1 if any budget is exceeded, making it suitable for CI.
 */

import fs from "node:fs";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";
import { Writable } from "node:stream";

const BUILD_DIR = path.resolve(process.cwd(), ".next");
const REPORT_OUTPUT = path.resolve(process.cwd(), ".next/bundle-report.json");

// Budget limits in KB (gzipped) — adjust as the app evolves.
// These are per-route "First Load JS" budgets matching Next.js build output.
const PAGE_BUDGETS = {
  "/": 180,
  "/browse": 200,
  "/auth/login": 300,
  "/auth/register": 300,
  "/listings/[id]/pay": 180,
  "/dashboard": 200,
  "/favorites": 190,
  "/listings": 190,
};

// Overall shared JS budget (gzipped KB)
const SHARED_JS_BUDGET = 170;

function bytesToKB(bytes) {
  return Math.round((bytes / 1024) * 100) / 100;
}

async function gzipSize(filePath) {
  let size = 0;
  const counter = new Writable({
    write(chunk, _encoding, cb) {
      size += chunk.length;
      cb();
    },
  });
  await pipeline(createReadStream(filePath), createGzip({ level: 9 }), counter);
  return size;
}

async function getFileSizes(files, useGzip) {
  let total = 0;
  for (const file of files) {
    const filePath = path.join(BUILD_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    if (useGzip) {
      total += await gzipSize(filePath);
    } else {
      total += fs.statSync(filePath).size;
    }
  }
  return total;
}

async function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error("No .next directory found. Run `npm run build` first.");
    process.exit(1);
  }

  // Prefer App Router manifest, fallback to Pages Router manifest
  const appManifestPath = path.join(BUILD_DIR, "app-build-manifest.json");
  const pagesManifestPath = path.join(BUILD_DIR, "build-manifest.json");

  let pages = {};
  let manifestSource = "";

  if (fs.existsSync(appManifestPath)) {
    const appManifest = JSON.parse(fs.readFileSync(appManifestPath, "utf-8"));
    pages = appManifest.pages ?? {};
    manifestSource = "app-build-manifest.json";
  } else if (fs.existsSync(pagesManifestPath)) {
    const pagesManifest = JSON.parse(
      fs.readFileSync(pagesManifestPath, "utf-8")
    );
    pages = pagesManifest.pages ?? {};
    manifestSource = "build-manifest.json";
  } else {
    console.error("No build manifest found. Build may have failed.");
    process.exit(1);
  }

  console.log(`\n=== Bundle Size Report (source: ${manifestSource}) ===\n`);

  // Compute shared chunks (from /layout entry in App Router)
  const layoutFiles = pages["/layout"] ?? [];
  const sharedSize = await getFileSizes(layoutFiles, true);

  // Compute per-page sizes (gzipped)
  const chunks = [];
  for (const [page, files] of Object.entries(pages)) {
    if (page === "/layout" || page.endsWith("/loading")) continue;

    // Page-specific files = all files minus shared layout files
    const pageOnlyFiles = files.filter((f) => !layoutFiles.includes(f));
    const pageOnlySize = await getFileSizes(pageOnlyFiles, true);
    const firstLoadSize = sharedSize + pageOnlySize;

    // Normalize route name: /page -> /, /browse/page -> /browse, etc.
    const route = page
      .replace(/\/page$/, "")
      .replace(/^\/_not-found$/, "/_not-found")
      || "/";

    chunks.push({
      route,
      pageOnlySize,
      firstLoadSize,
      fileCount: files.length,
    });
  }

  // Sort largest first
  chunks.sort((a, b) => b.firstLoadSize - a.firstLoadSize);

  console.log(`Shared JS (gzipped): ${bytesToKB(sharedSize)} KB`);
  console.log("");
  console.log("Routes by First Load JS (gzipped):");
  for (const chunk of chunks) {
    const marker =
      chunk.route in PAGE_BUDGETS
        ? bytesToKB(chunk.firstLoadSize) > PAGE_BUDGETS[chunk.route]
          ? " !!!"
          : " ok"
        : "";
    console.log(
      `  ${String(bytesToKB(chunk.firstLoadSize)).padStart(8)} KB  ${chunk.route}${marker}`
    );
  }

  // Check budgets
  const violations = [];

  if (bytesToKB(sharedSize) > SHARED_JS_BUDGET) {
    violations.push({
      name: "Shared JS",
      actual: bytesToKB(sharedSize),
      budget: SHARED_JS_BUDGET,
    });
  }

  for (const [route, maxKB] of Object.entries(PAGE_BUDGETS)) {
    const match = chunks.find((c) => c.route === route);
    if (match && bytesToKB(match.firstLoadSize) > maxKB) {
      violations.push({
        name: route,
        actual: bytesToKB(match.firstLoadSize),
        budget: maxKB,
      });
    }
  }

  console.log("");
  if (violations.length > 0) {
    console.log(`${violations.length} budget violation(s):\n`);
    for (const v of violations) {
      console.log(`  OVER BUDGET: ${v.name}`);
      console.log(
        `    Actual: ${v.actual} KB | Budget: ${v.budget} KB | Over by: ${(v.actual - v.budget).toFixed(2)} KB\n`
      );
    }
    console.log("Run `npm run analyze` to inspect bundle composition.\n");
  } else {
    console.log("All bundle budgets passed.\n");
  }

  // Save report for CI comparison
  const report = {
    sharedSize: bytesToKB(sharedSize),
    routes: chunks.map((c) => ({
      route: c.route,
      firstLoadKB: bytesToKB(c.firstLoadSize),
      pageOnlyKB: bytesToKB(c.pageOnlySize),
    })),
    violations,
    timestamp: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(REPORT_OUTPUT), { recursive: true });
  fs.writeFileSync(REPORT_OUTPUT, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${REPORT_OUTPUT}`);

  if (violations.length > 0) {
    process.exit(1);
  }
}

main();
