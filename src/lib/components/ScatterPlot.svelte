<script lang="ts">
	import { modelName, hardwareName } from '$lib/data/catalog.js';
	import { scatterScales } from '$lib/data/scatter.js';
	let { runs }: { runs: any[] } = $props();

	const W = 660, H = 324, PAD = { l: 44, r: 16, t: 40, b: 42 };
	const decode = (r: any) => r.performance?.decodeTokensPerSecond ?? null;
	const foot = (r: any) => r.performance?.memory?.gib ?? r.performance?.vramGiB ?? null;
	const quality = (r: any) => (r.score.passed / r.score.total) * 100;

	const s = $derived(scatterScales(runs, { w: W, h: H, pad: PAD }));
	const sx = (v: number) => s.sx(v);
	const sy = (q: number) => s.sy(q);
	const rOf = (r: any) => s.radius(r);
	const ticks = $derived(s.ticks);
</script>

<div class="scatter">
	<svg viewBox="0 0 {W} {H}" role="group" aria-label="Quality versus decode speed for the selected comparable runs">
		<line class="axis" x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} />
		<line class="axis" x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} />
		{#each [0, 50, 100] as q (q)}
			<g>
				<line class="grid" x1={PAD.l} y1={sy(q)} x2={W - PAD.r} y2={sy(q)} />
				<text class="tick" x={PAD.l - 8} y={sy(q) + 3} text-anchor="end">{q}%</text>
			</g>
		{/each}
		{#each ticks as t (t.k)}<text class="tick" x={t.x} y={H - PAD.b + 16} text-anchor="middle">{Number(t.v.toFixed(1))}</text>{/each}
		<text class="axis-label" x={(W + PAD.l) / 2} y={H - 4} text-anchor="middle">decode tokens/s (cohort: same hardware, benchmark, version, task set)</text>
		{#each runs as run, i (run.id)}
			{@const q = quality(run)}
			{#if decode(run) != null}
				<circle class="dot" cx={sx(decode(run))} cy={sy(q)} r={rOf(run)} data-machine={run.hardwareSlug} style:animation-delay={i * 70}ms><title>{modelName(run.modelSlug)} · {q.toFixed(0)}% · {decode(run)} tok/s</title></circle>
				<text class="dot-label" x={sx(decode(run))} y={sy(q) - rOf(run) - 4} text-anchor="middle">{run.runtime.quant ?? modelName(run.modelSlug)}</text>
			{:else}
				<text class="tick" x={PAD.l + 4} y={sy(q)}>○ {modelName(run.modelSlug)} — no decode measurement</text>
			{/if}
		{/each}
	</svg>
	<div class="receipt-scroll">
		<table class="receipt">
			<thead><tr><th>Run</th><th>Model / quant</th><th>Machine</th><th>Quality</th><th>Decode</th><th>Footprint</th><th>Evidence</th></tr></thead>
			<tbody>
				{#each runs as run (run.id)}
					<tr>
						<td><a href={`/runs/${run.id}/`}>{run.id}</a></td>
						<td>{modelName(run.modelSlug)}{#if run.runtime.quant} · {run.runtime.quant}{/if}</td>
						<td>{hardwareName(run.hardwareSlug)}</td>
						<td>{run.score.passed}/{run.score.total} ({quality(run).toFixed(0)}%)</td>
						<td>{decode(run) ?? '—'} tok/s</td>
						<td>{foot(run) ? `${foot(run)} GiB` : 'not measured'}</td>
						<td>{run.evidence.level}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
