<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from './_sidebar/AppSidebar.svelte';
	import Header from './_sidebar/Header.svelte';

	let {
		data,
		children
	}: {
		data: LayoutData;
		children: Snippet;
	} = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<Header />
		<div class="overflow-none flex h-0 w-full grow flex-col gap-2 p-2 pt-0">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
