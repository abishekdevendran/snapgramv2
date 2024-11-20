<script lang="ts">
	import type { Snippet, SvelteComponent } from 'svelte';
	import { page } from '$app/stores';
	let {
		children
	}: {
		children: Snippet;
	} = $props();
	import User from '$lib/components/User.svelte';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { mode } from 'mode-watcher';
	import CreatePost from '$lib/components/[username]/CreatePost.svelte';
</script>

{#snippet extended(Component: any, title: string)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex cursor-pointer select-none items-center gap-2 rounded-lg p-1 transition-all duration-300 hover:bg-primary/20 max-lg:hidden"
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!e.isTrusted) return;
			// get first child
			const child = e.currentTarget.children[0].children[0] as HTMLElement;
			child.click();
			console.log(child);
		}}
	>
		<div class="pointer-events-none">
			<Component />
		</div>
		<span class="pointer-events-none max-lg:hidden">
			{title}
		</span>
	</div>
	<div class="lg:hidden">
		<Component />
	</div>
{/snippet}

<div class="flex h-full max-sm:flex-col">
	<NavBar />
	<aside
		class="fixed bottom-0 z-50 flex w-full gap-2 border-r bg-background p-4 max-lg:items-center max-sm:justify-around justify-between sm:sticky sm:top-0 sm:h-screen sm:w-16 sm:flex-col md:gap-4 lg:w-64"
	>
		<h1 class="font-poppins text-3xl font-black max-lg:hidden">SnapGram</h1>
		<h1 class="font-poppins text-3xl font-black max-sm:hidden lg:hidden">S</h1>
		<div class="flex gap-4 sm:flex-col max-lg:w-full max-lg:justify-around">
			{@render extended(User, $page.data.user.name)}
			{@render extended(CreatePost, 'Create Post')}
			{@render extended(LightSwitch, ($mode === 'dark' ? 'Dark' : 'Light') + ' mode')}
		</div>
	</aside>

	{@render children()}
</div>
