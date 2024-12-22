<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { LayoutDashboard, MessagesSquare, SquarePlus } from 'lucide-svelte';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';

	let isNavigating = $state(false);
	beforeNavigate(() => {
		isNavigating = true;
	});
	afterNavigate(() => {
		isNavigating = false;
	});
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Data management</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/app')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<SquarePlus />
				<span>{'New Post'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group>
<Sidebar.Group>
	<Sidebar.GroupLabel>Views</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/app')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<MessagesSquare />
				<span>{'Chat'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/dashboard')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<LayoutDashboard />
				<span>{'Dashboard'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group>
