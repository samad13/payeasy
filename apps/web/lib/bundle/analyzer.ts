/**
 * Bundle size analysis and monitoring utilities.
 *
 * Reads Next.js build output to extract chunk sizes, compares them against
 * configurable budgets, and reports violations. Used both locally during
 * development (`npm run bundle:check`) and in CI to enforce size limits.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BundleBudget {
  /** Glob-style name pattern, e.g. "pages/browse" or "chunks/framework" */
  name: string;
  /** Maximum allowed size in kilobytes */
  maxSize: number;
}

export interface ChunkInfo {
  name: string;
  /** Raw size in bytes */
  size: number;
  /** Gzipped size in bytes (when available) */
  gzipSize?: number;
}

export interface BundleReport {
  totalSize: number;
  totalGzipSize: number;
  chunks: ChunkInfo[];
  timestamp: string;
}

export interface BudgetViolation {
  chunk: string;
  actualKB: number;
  budgetKB: number;
  overByKB: number;
}

export interface BudgetCheckResult {
  passed: boolean;
  violations: BudgetViolation[];
  report: BundleReport;
}

// ---------------------------------------------------------------------------
// Default budgets (KB) — tuned for the PayEasy application
// ---------------------------------------------------------------------------

export const DEFAULT_BUDGETS: BundleBudget[] = [
  { name: "First Load JS (total)", maxSize: 250 },
  { name: "pages/_app", maxSize: 120 },
  { name: "pages/browse", maxSize: 350 },
  { name: "pages/index", maxSize: 80 },
  { name: "pages/listings/[id]", maxSize: 100 },
  { name: "pages/dashboard", maxSize: 100 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bytesToKB(bytes: number): number {
  return Math.round((bytes / 1024) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Parse the Next.js build manifest to extract chunk sizes.
 *
 * @param buildDir Absolute path to the `.next` directory.
 */
export function parseBuildOutput(buildDir: string): BundleReport {
  const chunks: ChunkInfo[] = [];
  let totalSize = 0;
  let totalGzipSize = 0;

  // Parse build-manifest.json for page → chunk mappings
  const manifestPath = path.join(buildDir, "build-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const pages: Record<string, string[]> = manifest.pages ?? {};

    for (const [page, files] of Object.entries(pages)) {
      let pageSize = 0;

      for (const file of files) {
        const filePath = path.join(buildDir, file);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          pageSize += stat.size;
        }
      }

      const chunk: ChunkInfo = {
        name: `pages${page === "/" ? "/index" : page}`,
        size: pageSize,
      };

      chunks.push(chunk);
      totalSize += pageSize;
    }
  }

  // Also scan static chunks for shared bundles
  const staticChunksDir = path.join(buildDir, "static", "chunks");
  if (fs.existsSync(staticChunksDir)) {
    const staticFiles = fs.readdirSync(staticChunksDir).filter((f) => f.endsWith(".js"));
    for (const file of staticFiles) {
      const filePath = path.join(staticChunksDir, file);
      const stat = fs.statSync(filePath);

      // Only track significant chunks (>1KB)
      if (stat.size > 1024) {
        const chunk: ChunkInfo = {
          name: `chunks/${file}`,
          size: stat.size,
        };
        chunks.push(chunk);
        totalSize += stat.size;
      }
    }
  }

  return {
    totalSize,
    totalGzipSize,
    chunks: chunks.sort((a, b) => b.size - a.size),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check parsed bundle report against a set of budgets.
 */
export function checkBudgets(
  report: BundleReport,
  budgets: BundleBudget[] = DEFAULT_BUDGETS,
): BudgetCheckResult {
  const violations: BudgetViolation[] = [];

  // Check total budget
  const totalBudget = budgets.find((b) => b.name === "First Load JS (total)");
  if (totalBudget) {
    const totalKB = bytesToKB(report.totalSize);
    if (totalKB > totalBudget.maxSize) {
      violations.push({
        chunk: totalBudget.name,
        actualKB: totalKB,
        budgetKB: totalBudget.maxSize,
        overByKB: Math.round((totalKB - totalBudget.maxSize) * 100) / 100,
      });
    }
  }

  // Check per-page budgets
  for (const budget of budgets) {
    if (budget.name === "First Load JS (total)") continue;

    const matching = report.chunks.find((c) => c.name.includes(budget.name));
    if (matching) {
      const sizeKB = bytesToKB(matching.size);
      if (sizeKB > budget.maxSize) {
        violations.push({
          chunk: budget.name,
          actualKB: sizeKB,
          budgetKB: budget.maxSize,
          overByKB: Math.round((sizeKB - budget.maxSize) * 100) / 100,
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    report,
  };
}

/**
 * Format a budget check result for human-readable console output.
 */
export function formatReport(result: BudgetCheckResult): string {
  const lines: string[] = [];

  lines.push("=== Bundle Size Report ===");
  lines.push(`Generated: ${result.report.timestamp}`);
  lines.push(`Total size: ${bytesToKB(result.report.totalSize)} KB`);
  lines.push("");

  // Top chunks
  lines.push("Top chunks by size:");
  const topChunks = result.report.chunks.slice(0, 15);
  for (const chunk of topChunks) {
    lines.push(`  ${bytesToKB(chunk.size).toString().padStart(8)} KB  ${chunk.name}`);
  }
  lines.push("");

  // Budget results
  if (result.passed) {
    lines.push("All bundle budgets passed.");
  } else {
    lines.push(`${result.violations.length} budget violation(s):`);
    for (const v of result.violations) {
      lines.push(`  OVER BUDGET: ${v.chunk}`);
      lines.push(`    Actual: ${v.actualKB} KB | Budget: ${v.budgetKB} KB | Over by: ${v.overByKB} KB`);
    }
  }

  return lines.join("\n");
}

/**
 * Save the report as JSON for CI comparison.
 */
export function saveReport(report: BundleReport, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}

/**
 * Compare two reports to show size deltas.
 */
export function compareReports(
  baseline: BundleReport,
  current: BundleReport,
): { totalDelta: number; chunkDeltas: Array<{ name: string; delta: number }> } {
  const totalDelta = current.totalSize - baseline.totalSize;
  const chunkDeltas: Array<{ name: string; delta: number }> = [];

  for (const chunk of current.chunks) {
    const baseChunk = baseline.chunks.find((c) => c.name === chunk.name);
    if (baseChunk) {
      const delta = chunk.size - baseChunk.size;
      if (Math.abs(delta) > 512) {
        chunkDeltas.push({ name: chunk.name, delta });
      }
    }
  }

  return {
    totalDelta,
    chunkDeltas: chunkDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
  };
}
