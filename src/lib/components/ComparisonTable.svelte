<script lang="ts">
	import EvidenceBadge from './EvidenceBadge.svelte';
	import { modelName } from '$lib/data/catalog.js';
	import type { BenchmarkRun } from '$lib/data/catalog.js';
	let { runs }: { runs: BenchmarkRun[] } = $props();
</script>
<div class="table-scroll" role="region" aria-label="Selected run comparison">
	<table><thead><tr><th scope="col">Run</th><th scope="col">Score</th><th scope="col">Decode</th><th scope="col">Runtime</th><th scope="col">Configuration</th><th scope="col">Evidence</th></tr></thead>
	<tbody>{#each runs as run (run.id)}<tr><th scope="row"><a href={`/runs/${run.id}/`}>{modelName(run.modelSlug)}</a><small>{run.id}</small></th><td>{run.score.passed}/{run.score.total}</td><td>{run.performance.decodeTokensPerSecond ?? '—'} tok/s</td><td>{run.runtime.name}</td><td>{run.runtime.quant} · {run.runtime.contextTokens.toLocaleString()} ctx · c{run.runtime.concurrency}</td><td><EvidenceBadge level={run.evidence.level} /></td></tr>{/each}</tbody></table>
</div>
