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

<svelte:head>
	<title>{title}</title>
</svelte:head>
<ModeWatcher />
<Toaster />
<main class="h-[100svh] flex w-full flex-col bg-muted/40">
	<NavBar />
	{@render children()}
</main>
