<script lang="ts">
	import { resolve } from '$app/paths';
	import EvidenceBadge from '$lib/components/EvidenceBadge.svelte';
	import { catalog, hardwareName, modelName } from '$lib/data/catalog.js';
	import { cohortRuns, filterRuns, groupFamilies, normalizeBars } from '$lib/data/explorer.js';
	let capability = $state('');
	let hardware = $state('');
	let runtime = $state('');
	let family = $state('');
	let architecture = $state('');
	let quant = $state('');
	let memory = $state('');
	let evidence = $state('');
	let metric = $state<'quality' | 'decode' | 'prefill' | 'memory'>('quality');
	let cohort = $state(catalog.runs[0]?.id ?? '');
	const options = (values: string[]) => [...new Set(values)].sort();
	let filtered = $derived(filterRuns(catalog.runs, catalog.models, { capability, hardware, runtime, family, architecture, quant, memory, evidence }));
	let chartRuns = $derived(metric === 'quality' ? cohortRuns(filtered, cohort) : filtered);
	let bars = $derived(normalizeBars(chartRuns, metric));
	let families = $derived(groupFamilies(catalog.models.filter((model) => filtered.some((run: any) => run.modelSlug === model.slug)), filtered));
	let filtersActive = $derived([capability,hardware,runtime,family,architecture,quant,memory,evidence].some(Boolean));
	function reset() { capability = hardware = runtime = family = architecture = quant = memory = evidence = ''; }
	function exact(bar: any) {
		if (bar.value == null) return 'Not measured';
		if (metric === 'quality') return `${bar.run.score.passed}/${bar.run.score.total} (${bar.value.toFixed(1)}%)`;
		if (metric === 'memory') return `${bar.value} GiB ${bar.run.performance.memory.kind.replace('-', ' ')}`;
		return `${bar.value} tok/s`;
	}
</script>

<svelte:head><title>Explore local models — MetalBench</title><meta name="description" content="Explore local AI configurations by capability, hardware, runtime, measured memory, and evidence." /></svelte:head>

<section class="page-head explorer-head"><p class="eyebrow">EXPLORER / EVIDENCE-FIRST</p><h1>Start with the job. Then inspect the machine.</h1><p class="lede">Editorial recommendations tied to exact runs—not a synthetic intelligence score.</p></section>

<section class="section recommendation-section"><div class="section-head"><div><p class="eyebrow">FIELD PICKS / {catalog.useCases.length}</p><h2>Named recommendations</h2></div><p>Each verdict has a runner-up, evidence trail, and a visible ceiling.</p></div>
	<div class="recommendation-grid">{#each catalog.useCases as useCase (useCase.slug)}{@const run = catalog.runs.find((item) => item.id === useCase.runIds[0])}<article class="recommendation-card"><p class="eyebrow">{useCase.name}</p><h3><a href={resolve(`/models/${useCase.winnerModelSlug}/`)}>{modelName(useCase.winnerModelSlug)}</a></h3>{#if run}<p class="badge-line"><span>{hardwareName(run.hardwareSlug)}</span><span>{run.runtime.name}</span><EvidenceBadge level={run.evidence.level} /></p>{/if}<p>{useCase.explanation}</p><details><summary>Evidence and limits</summary><p>Runner-up: <a href={resolve(`/models/${useCase.runnerUpModelSlug}/`)}>{modelName(useCase.runnerUpModelSlug)}</a></p><ul>{#each useCase.runIds as id (id)}<li><a href={resolve(`/runs/${id}/`)}>{id}</a></li>{/each}{#each useCase.limitations as item (item)}<li>{item}</li>{/each}</ul></details></article>{/each}</div>
</section>

<section class="section explorer-workbench"><div class="section-head"><div><p class="eyebrow">CONFIGURATION DESK</p><h2>Filter measured runs</h2></div><p aria-live="polite">{filtered.length} of {catalog.runs.length} runs shown</p></div>
	<div class="filter-grid">
		<label>Use case / capability<select bind:value={capability}><option value="">All capabilities</option>{#each options([...catalog.models.flatMap((m) => m.capabilities), ...catalog.useCases.map((u) => u.slug)]) as item (item)}<option value={item}>{item.replaceAll('-', ' ')}</option>{/each}</select></label>
		<label>Hardware<select bind:value={hardware}><option value="">All hardware</option>{#each catalog.hardware as item (item.slug)}<option value={item.slug}>{item.name}</option>{/each}</select></label>
		<label>Runtime<select bind:value={runtime}><option value="">All runtimes</option>{#each options(catalog.runs.map((r) => r.runtime.name)) as item (item)}<option>{item}</option>{/each}</select></label>
		<label>Model family<select bind:value={family}><option value="">All families</option>{#each options(catalog.models.map((m) => m.familySlug)) as item (item)}<option value={item}>{catalog.models.find((m) => m.familySlug === item)?.family}</option>{/each}</select></label>
		<label>Architecture<select bind:value={architecture}><option value="">All architectures</option>{#each options(catalog.models.map((m) => m.architecture)) as item (item)}<option value={item}>{item}</option>{/each}</select></label>
		<label>Quant range<select bind:value={quant}><option value="">All quants</option><option value="2-or-less">2-bit or lower</option><option value="3-4">3–4-bit</option><option value="5-6">5–6-bit</option><option value="7-8">7–8-bit</option><option value="special">Special formats</option></select></label>
		<label>Measured memory<select bind:value={memory}><option value="">All memory</option><option value="under-6">Under 6 GiB</option><option value="6-12">6–12 GiB</option><option value="12-plus">12+ GiB</option><option value="unmeasured">Not measured</option></select></label>
		<label>Evidence level<select bind:value={evidence}><option value="">All evidence</option>{#each options(catalog.runs.map((r) => r.evidence.level)) as item (item)}<option value={item}>{item}</option>{/each}</select></label>
	</div><button class="reset" onclick={reset} disabled={!filtersActive}>Reset filters</button>

	<div class="chart-shell"><div class="chart-tabs" role="tablist" aria-label="Chart metric">{#each [['quality','Quality percentage'],['decode','Decode speed'],['prefill','Prefill speed'],['memory','Measured memory']] as tab (tab[0])}<button role="tab" aria-selected={metric === tab[0]} onclick={() => metric = tab[0] as typeof metric}>{tab[1]}</button>{/each}</div>
		{#if metric === 'quality'}<label class="cohort-picker">Quality cohort<select bind:value={cohort}>{#each filtered as run (run.id)}<option value={run.id}>{run.benchmarkSlug} · {run.score.total} tasks · {run.taskSetHash.slice(-10)}</option>{/each}</select></label><p class="chart-note">Only identical benchmark versions and task-set hashes appear together.</p>{:else}<p class="chart-note">Grouped labels keep hardware and {metric === 'memory' ? 'measurement kind' : 'runtime'} visible. Bar length is relative only within this view.</p>{/if}
		<div class="bars" aria-label={`${metric} results`}>{#each bars as bar (bar.run.id)}<a class="bar-row" href={resolve(`/runs/${bar.run.id}/`)}><span class="bar-label"><strong>{modelName(bar.run.modelSlug)}</strong><small>{hardwareName(bar.run.hardwareSlug)} · {bar.run.runtime.name} · {bar.run.runtime.quant}</small></span><span class="bar-track"><i style:width={`${bar.width ?? 0}%`}></i></span><span class="bar-value">{exact(bar)}</span></a>{:else}<p class="empty-state">No measured runs match these filters.</p>{/each}</div>
	</div>
</section>

<section class="section family-section"><div class="section-head"><div><p class="eyebrow">MODEL FAMILIES</p><h2>Configurations stay separate</h2></div><p>Families group siblings; every quant and runtime keeps its own model and run page.</p></div>{#each families as group (group.slug)}<details class="family-group" open><summary><strong>{group.name}</strong><span>{group.configurations.length} configuration{group.configurations.length === 1 ? '' : 's'}</span></summary><div>{#each group.configurations as item (item.model.slug)}<article><h3><a href={resolve(`/models/${item.model.slug}/`)}>{item.model.name}</a></h3><p>{item.model.parameterCount.totalBillions}B total{item.model.parameterCount.activeBillions !== item.model.parameterCount.totalBillions ? ` / ${item.model.parameterCount.activeBillions}B active` : ''} · {item.model.architecture} · {item.model.quant.family}</p><span>{item.runs.length} matching run{item.runs.length === 1 ? '' : 's'}</span></article>{/each}</div></details>{/each}</section>
