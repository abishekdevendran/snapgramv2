<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
<NavBar />
{@render children()}
