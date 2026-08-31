<script lang="ts">
	import { resolve } from '$app/paths';
	let { children } = $props();
	const links = [['/compare','Compare'],['/methodology','Methodology'],['/findings','Findings']] as const;
</script>

<a class="skip" href="#content">Skip to content</a>
<header class="site-head">
	<a class="wordmark" href={resolve('/')}>METAL<span>BENCH</span></a>
	<nav aria-label="Primary navigation">
		{#each links as [href,label] (href)}<a href={resolve(href)}>{label}</a>{/each}
	</nav>
</header>
<main id="content">{@render children()}</main>
<footer><span>Evidence before leaderboard.</span><span>Static catalog · No tracking</span></footer>
