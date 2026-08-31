<script lang="ts">
	import { resolve } from '$app/paths';
	import EvidenceBadge from '$lib/components/EvidenceBadge.svelte';
	import MetricDisplay from '$lib/components/MetricDisplay.svelte';
	import { catalog, modelName } from '$lib/data/catalog.js';
	const latest = [...catalog.runs].sort((a,b) => b.measuredAt.localeCompare(a.measuredAt));
</script>

<svelte:head><title>MetalBench — Local AI benchmarks with receipts</title><meta name="description" content="Deterministic local AI benchmarks on hardware you actually own, with provenance and failures attached." /></svelte:head>

<section class="hero home-hero">
	<p class="eyebrow">TWO LOCAL LABS / MACBOOK PRO + UNRAID</p>
	<h1>Local models, measured where they work.</h1>
	<p class="lede">Measured local inference, deterministic grading, and the failures that matter. No vendor numbers. No LLM judges.</p>
	<div class="verdict"><span>Current verdict</span><strong>Pick the model, runtime, and machine together.</strong></div>
	<div class="hero-actions"><a class="button" href={resolve('/compare/')}>Compare the runs</a><a class="text-link" href={resolve('/methodology/')}>Read the rules →</a></div>
</section>

<section class="section">
	<div class="section-head"><div><p class="eyebrow">RUN INDEX / {String(latest.length).padStart(3,'0')}</p><h2>Latest evidence</h2></div><p>Initial results are note-derived and clearly marked. Missing raw artifacts limit reproduction, not disclosure.</p></div>
	<div class="cards">
		{#each latest as run (run.id)}
			<article class="run-card"><div class="card-top"><time datetime={run.measuredAt}>{run.measuredAt.slice(0,10)}</time><EvidenceBadge level={run.evidence.level} /></div><h3><a href={resolve(`/runs/${run.id}/`)}>{modelName(run.modelSlug)}</a></h3><p class="mono">{run.runtime.name} · {run.runtime.quant}</p><div class="metric-row"><MetricDisplay value={`${run.score.passed}/${run.score.total}`} label={run.score.metric ?? 'quality'} /><MetricDisplay value={`${run.performance.decodeTokensPerSecond ?? '—'}`} label="tok/s decode" /></div><div class="scorebar"><i style:width={`${run.score.passed/run.score.total*100}%`}></i></div></article>
		{/each}
	</div>
</section>

<section class="finding-callout"><p class="eyebrow">FINDING 01</p><div><h2>Speculation doesn’t beat a memory bottleneck.</h2><p>{catalog.findings[0].summary}</p><a class="text-link" href={resolve('/findings/speculative-decoding-memory-wall/')}>Read the finding →</a></div><MetricDisplay value="0%" label="measured speedup" /></section>
