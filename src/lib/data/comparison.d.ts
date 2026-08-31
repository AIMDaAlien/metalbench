import type { BenchmarkRun } from "./catalog.js";
export function compareRuns(runs: BenchmarkRun[]): {
  compatible: boolean;
  reasons: string[];
  warnings: string[];
  recommendationEligible: boolean;
};
