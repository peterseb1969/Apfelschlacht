<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

{#if $page.url.pathname !== `${base}/` && $page.url.pathname !== base}
	<a class="back-link" href="{base}/">← Zurück zur Übersicht</a>
{/if}

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #1a1a1a;
		color: #eee;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.back-link {
		position: fixed;
		top: 8px;
		left: 12px;
		z-index: 50;
		color: #aaa;
		text-decoration: none;
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.6);
		padding: 4px 10px;
		border-radius: 4px;
		transition: color 0.15s;
	}

	.back-link:hover {
		color: #fff;
	}
</style>
