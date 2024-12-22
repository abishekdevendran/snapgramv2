<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import AppLogo from './AppLogo.svelte';
	import AppOptions from './AppOptions.svelte';
	import AppFooter from './AppFooter.svelte';
	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<AppLogo />
	</Sidebar.Header>
	<Sidebar.Content>
		<AppOptions />
	</Sidebar.Content>
	<Sidebar.Footer>
		<AppFooter/>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>