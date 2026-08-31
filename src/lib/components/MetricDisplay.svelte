<script lang="ts">let { value, label, detail = '' }: { value: string; label: string; detail?: string } = $props();</script>
<div class="metric"><strong>{value}</strong><span>{label}</span>{#if detail}<small>{detail}</small>{/if}</div>
