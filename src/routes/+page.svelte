<script lang="ts">
	import EvidenceBadge from '$lib/components/EvidenceBadge.svelte';
	import MetricDisplay from '$lib/components/MetricDisplay.svelte';
	import { catalog, modelName } from '$lib/data/catalog.js';
	const latest = [...catalog.runs].sort((a,b) => b.measuredAt.localeCompare(a.measuredAt));
</script>

<svelte:head><title>MetalBench — Local AI benchmarks with receipts</title><meta name="description" content="Deterministic local AI benchmarks on hardware you actually own, with provenance and failures attached." /></svelte:head>

<section class="hero home-hero">
	<p class="eyebrow">UNRAID LAB / 128 GB DDR4 / RTX 3060</p>
	<h1>The fast model isn’t the reliable one.</h1>
	<p class="lede">Measured local inference, deterministic grading, and the failures that matter. No vendor numbers. No LLM judges.</p>
	<div class="verdict"><span>Current verdict</span><strong>Qwen for speed. Flash-Next for strict work.</strong></div>
	<div class="hero-actions"><a class="button" href="/compare/">Compare the runs</a><a class="text-link" href="/methodology/">Read the rules →</a></div>
</section>

<section class="section">
	<div class="section-head"><div><p class="eyebrow">RUN INDEX / {String(latest.length).padStart(3,'0')}</p><h2>Latest evidence</h2></div><p>Initial results are note-derived and clearly marked. Missing raw artifacts limit reproduction, not disclosure.</p></div>
	<div class="cards">
		{#each latest as run (run.id)}
			<article class="run-card"><div class="card-top"><time datetime={run.measuredAt}>{run.measuredAt.slice(0,10)}</time><EvidenceBadge level={run.evidence.level} /></div><h3><a href={`/runs/${run.id}/`}>{modelName(run.modelSlug)}</a></h3><p class="mono">{run.runtime.name} · {run.runtime.quant}</p><div class="metric-row"><MetricDisplay value={`${run.score.passed}/${run.score.total}`} label="quality" /><MetricDisplay value={`${run.performance.decodeTokensPerSecond ?? '—'}`} label="tok/s decode" /></div><div class="scorebar"><i style:width={`${run.score.passed/run.score.total*100}%`}></i></div></article>
		{/each}
	</div>
</section>

<section class="finding-callout"><p class="eyebrow">FINDING 01</p><div><h2>Speculation doesn’t beat a memory bottleneck.</h2><p>{catalog.findings[0].summary}</p><a class="text-link" href="/findings/speculative-decoding-memory-wall/">Read the finding →</a></div><MetricDisplay value="0%" label="measured speedup" /></section>
