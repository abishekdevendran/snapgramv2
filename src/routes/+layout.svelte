<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();

	const APP_NAME = 'SnapGram';
	// construct the title
	let title = $derived(
		$page.url.pathname.length > 1
			? $page.url.pathname.split('/').filter(Boolean).join(' - ') + ' | ' + APP_NAME
			: APP_NAME
	);
</script>

<ModeWatcher />
<Toaster />
<NavBar />
<svelte:head>
	<title>{title}</title>
</svelte:head>
{@render children()}
