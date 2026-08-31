<script lang="ts">
	let { level }: { level: string } = $props();
	const labels: Record<string,string> = { 'documented-local': 'Documented local result', 'artifact-backed-local': 'Artifact-backed local', 'published-external': 'Published external' };
</script>
<span class="evidence" data-level={level}>{labels[level] ?? level}</span>
