<script lang="ts">
	import { resolve } from '$app/paths';
	import EvidenceBadge from '$lib/components/EvidenceBadge.svelte';
	import MetricDisplay from '$lib/components/MetricDisplay.svelte';
	import { catalog, modelName, hardwareName } from '$lib/data/catalog.js';
	import { labPulse, outcomeState, artifactState } from '$lib/data/pulse.js';
	const pulse = labPulse(catalog);
	const latest = [...catalog.runs].sort((a,b) => b.measuredAt.localeCompare(a.measuredAt)).slice(0,6);
	const fmtDate = (iso: string) => iso.slice(0, 10);
	const memoryLabel = (kind?: string) => (kind === 'weights-only' ? 'Weights only' : kind ? kind : 'Memory');
</script>

<svelte:head><title>MetalBench — Local AI benchmarks with receipts</title><meta name="description" content="Deterministic local AI benchmarks on hardware you actually own, with provenance and failures attached." /></svelte:head>

<section class="hero home-hero">
	<p class="eyebrow">TWO LOCAL LABS / MACBOOK PRO + UNRAID</p>
	<h1>Local models, measured where they work.</h1>
	<p class="lede">Measured local inference, deterministic grading, and the failures that matter. No vendor numbers. No LLM judges.</p>
	<div class="verdict"><span>Current verdict</span><strong>Pick the model, runtime, and machine together.</strong></div>
	<div class="hero-actions"><a class="button" href={resolve('/explore/')}>Explore the models</a><a class="text-link" href={resolve('/compare/')}>Compare exact runs →</a></div>
</section>

<section class="section lab-pulse" aria-labelledby="lab-pulse-title">
	<div class="section-head"><div><p class="eyebrow">LAB PULSE / 02 MACHINES</p><h2 id="lab-pulse-title">Last recorded lab state</h2></div><p>No live telemetry feed yet. Every number below is the last measurement recorded on that machine, dated and traceable to its run.</p></div>
	<div class="cards">
		{#each pulse as card (card.machine.slug)}
			<article class="run-card pulse-card">
				<div class="card-top">
					<span class="pulse-state">{card.state.label}{#if card.state.measuredAt}<time datetime={card.state.measuredAt}>{fmtDate(card.state.measuredAt)}</time>{/if}</span>
					{#if card.latestRun}<EvidenceBadge level={card.latestRun.evidence.level} />{/if}
				</div>
				<h3><a href={resolve(`/hardware/${card.machine.slug}/`)}>{card.machine.name}</a></h3>
				<p class="mono">{card.model ? card.model.name : 'No model recorded'}{#if card.runtime} · {card.runtime.name}{#if card.runtime.quant} · {card.runtime.quant}{/if}{/if}</p>
				<div class="metric-row">
					<MetricDisplay value={card.decode ? `${card.decode.value}` : '—'} label="tok/s decode" detail={card.decode ? `recorded ${fmtDate(card.decode.measuredAt)}` : 'no decode record'} />
					<MetricDisplay value={card.memory ? `${card.memory.value} GiB` : '—'} label={memoryLabel(card.memory?.kind)} detail={card.memory ? `recorded ${fmtDate(card.memory.measuredAt)}` : 'no capture'} />
					{#if card.vram}<MetricDisplay value={`${card.vram.value} GiB`} label="GPU VRAM" detail={`recorded ${fmtDate(card.vram.measuredAt)}`} />{/if}
				</div>
				<dl class="facts">
					<div><dt>Context window</dt><dd>{card.contextTokens ? `${card.contextTokens.toLocaleString('en-GB')} tokens` : '—'}</dd></div>
					<div><dt>Memory</dt><dd>{card.machine.memory}</dd></div>
				</dl>
				<p class="chart-note">{card.machine.bottleneck}</p>
				{#if card.latestRun}<p class="mono"><a href={resolve(`/runs/${card.latestRun.id}/`)}>{card.latestRun.id}</a></p>{/if}
			</article>
		{/each}
	</div>
</section>

<section class="section">
	<div class="section-head"><div><p class="eyebrow">FIELD PICKS / {String(catalog.useCases.length).padStart(2,'0')}</p><h2>Start with the job</h2></div><p>Named recommendations with evidence and limitations—not one universal leaderboard.</p></div>
	<div class="recommendation-strip">{#each catalog.useCases as useCase (useCase.slug)}<a href={resolve(`/models/${useCase.winnerModelSlug}/`)}><span>{useCase.name}</span><strong>{modelName(useCase.winnerModelSlug)}</strong></a>{/each}</div>
</section>

<section class="section latest-section">
	<div class="section-head"><div><p class="eyebrow">LATEST EVIDENCE / {String(catalog.runs.length).padStart(3,'0')} RUNS</p><h2>The run index</h2></div><p>Each entry carries its cohort position (same hardware, benchmark, version, task set) and raw-artifact status. Missing artifacts limit reproduction, not disclosure.</p></div>
	{#if latest[0]}
		{@const run = latest[0]}
		{@const outcome = outcomeState(run, catalog.runs)}
		{@const artifact = artifactState(run)}
		<article class="featured">
			<div class="card-top"><time datetime={run.measuredAt}>{fmtDate(run.measuredAt)}</time><EvidenceBadge level={run.evidence.level} /></div>
			<p class="eyebrow">Most recent run</p>
			<h3><a href={resolve(`/runs/${run.id}/`)}>{modelName(run.modelSlug)}</a></h3>
			<p class="mono">{run.runtime.name}{#if run.runtime.quant} · {run.runtime.quant}{/if} · {hardwareName(run.hardwareSlug)}</p>
			<div class="metric-row large"><MetricDisplay value={`${run.score.passed}/${run.score.total}`} label={run.score.metric ?? 'quality'} /><MetricDisplay value={`${run.performance.decodeTokensPerSecond ?? '—'}`} label="tok/s decode" /></div>
			<div class="scorebar"><i style:width={`${run.score.passed/run.score.total*100}%`}></i></div>
			<div class="chips"><span class="state-chip" data-state={outcome.code}>{outcome.label}</span><span class="state-chip" data-artifact={artifact.code}>{artifact.label}</span></div>
		</article>
	{/if}
	<div class="run-stream">
		{#each latest.slice(1) as run (run.id)}
			{@const outcome = outcomeState(run, catalog.runs)}
			<a class="run-line" href={resolve(`/runs/${run.id}/`)}>
				<time datetime={run.measuredAt}>{fmtDate(run.measuredAt)}</time>
				<span class="run-line-model">{modelName(run.modelSlug)}<small>{run.runtime.name}{#if run.runtime.quant} · {run.runtime.quant}{/if}</small></span>
				<span class="run-line-score">{run.score.passed}/{run.score.total}</span>
				<span class="run-line-decode">{run.performance.decodeTokensPerSecond ?? '—'} tok/s</span>
				<span class="state-chip" data-state={outcome.code}>{outcome.label}</span>
			</a>
		{/each}
	</div>
</section>

<section class="finding-callout"><p class="eyebrow">FINDING 01</p><div><h2>Speculation doesn’t beat a memory bottleneck.</h2><p>{catalog.findings[0].summary}</p><a class="text-link" href={resolve('/findings/speculative-decoding-memory-wall/')}>Read the finding →</a></div><MetricDisplay value="0%" label="measured speedup" /></section>
