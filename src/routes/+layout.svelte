<script lang="ts">
	import '../app.css';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';

	let {
		children,
		data
	}: {
		children: Snippet;
		data: LayoutData;
	} = $props();

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
<Toaster richColors />
<ProgressBar class="text-primary" zIndex={999} />
<QueryClientProvider client={data.queryClient}>
	<main class="flex min-h-[100svh] w-full flex-col bg-muted/40 font-poppins">
		{@render children()}
	</main>
	<SvelteQueryDevtools />
</QueryClientProvider>
