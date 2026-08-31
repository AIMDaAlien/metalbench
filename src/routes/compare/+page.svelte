<script lang="ts">
	import ComparisonTable from '$lib/components/ComparisonTable.svelte';
	import { catalog, modelName } from '$lib/data/catalog.js';
	import { compareRuns } from '$lib/data/comparison.js';
	let selected = $state(catalog.runs.slice(0,2).map((run) => run.id));
	let runs = $derived(catalog.runs.filter((run) => selected.includes(run.id)));
	let comparison = $derived(compareRuns(runs));
	function toggle(id: string) { selected = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected,id]; }
</script>
<svelte:head><title>Compare runs — MetalBench</title><meta name="description" content="Compare local benchmark runs with compatibility checks and visible configuration differences." /></svelte:head>
<section class="page-head"><p class="eyebrow">COMPARISON DESK</p><h1>Compare runs without hiding the mismatches.</h1><p class="lede">A faster number means little if the hardware, task set, or concurrency changed.</p></section>
<section class="section compact"><fieldset><legend>Select two or more runs</legend><div class="check-grid">{#each catalog.runs as run (run.id)}<label><input type="checkbox" checked={selected.includes(run.id)} onchange={() => toggle(run.id)} /><span><strong>{modelName(run.modelSlug)}</strong><small>{run.benchmarkSlug} · {run.runtime.quant}</small></span></label>{/each}</div></fieldset>
	<div class:good={comparison.compatible} class="compat"><strong>{comparison.compatible ? 'Comparable' : 'Comparison blocked'}</strong>{#each comparison.reasons as reason (reason)}<span>{reason}</span>{/each}{#each comparison.warnings as warning (warning)}<span class="warning">Warning: {warning}</span>{/each}{#if comparison.compatible && !comparison.recommendationEligible}<span>External results cannot determine a local winner.</span>{/if}</div>
	{#if runs.length}<ComparisonTable {runs} />{/if}
</section>
