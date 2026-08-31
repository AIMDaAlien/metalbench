export type Evidence =
  | {
      level: "documented-local";
      sourceTitle: string;
      sourceDate: string;
      limitations: string[];
    }
  | {
      level: "artifact-backed-local";
      artifactUrl: string;
      sha256: string;
      harnessCommit: string;
    }
  | {
      level: "published-external";
      publisher: string;
      sourceUrl: string;
      accessedAt: string;
    };
export interface BenchmarkRun {
  id: string;
  measuredAt: string;
  modelSlug: string;
  hardwareSlug: string;
  benchmarkSlug: string;
  benchmarkVersion: string;
  taskSetHash: string;
  runtime: {
    name: string;
    version: string;
    quant: string;
    contextTokens: number;
    reasoningEffort?: "low" | "medium" | "xhigh";
    threadCount?: number;
    concurrency: number;
  };
  score: { passed: number; total: number; metric?: string };
  performance: {
    decodeTokensPerSecond?: number;
    prefillTokensPerSecond?: number;
    wallSeconds?: number;
    vramGiB?: number;
    memory?: { gib: number; kind: "warm-rss" | "peak-rss" | "weights-only" | "combined-ram" };
  };
  performanceDisplay?: string;
  evidence: Evidence;
  caveats: string[];
  supersedesRunId?: string;
}
export interface Model {
  slug: string;
  familySlug: string;
  name: string;
  family: string;
  parameters: string;
  parameterCount: { totalBillions: number; activeBillions: number };
  architecture: "dense" | "moe" | "dense-hybrid";
  modalities: string[];
  capabilities: string[];
  bestUseCases: string[];
  quant: { bits: number; family: string };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}
export interface UseCase {
  slug: string;
  name: string;
  winnerModelSlug: string;
  runnerUpModelSlug: string;
  runIds: string[];
  explanation: string;
  limitations: string[];
}
export interface Hardware {
  slug: string;
  name: string;
  cpu: string;
  memory: string;
  gpu: string;
  publicNotes: string[];
  memoryBudget: string;
  bottleneck: string;
}
export interface Finding {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  body: string[];
  runIds: string[];
  limitations: string[];
}
export const catalog: {
  models: Model[];
  hardware: Hardware[];
  benchmarks: {
    slug: string;
    name: string;
    version: string;
    description: string;
  }[];
  runs: BenchmarkRun[];
  useCases: UseCase[];
  findings: Finding[];
};
export function getModel(slug: string): Model | undefined;
export function getHardware(slug: string): Hardware | undefined;
export function getRun(id: string): BenchmarkRun | undefined;
export function getFinding(slug: string): Finding | undefined;
export function modelName(slug: string): string;
export function hardwareName(slug: string): string;
