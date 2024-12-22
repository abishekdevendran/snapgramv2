<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import DialogContent from './NewPost/DialogContent.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class="group overflow-clip">
		{#snippet child({ props })}
			<Sidebar.MenuButton {...props}>
				<SquarePlus />
				<span>{'New Post'}</span>
			</Sidebar.MenuButton>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new Post</Dialog.Title>
			<Dialog.Description>
				Select image(s) to upload. Add captions to your post and/or images.
			</Dialog.Description>
		</Dialog.Header>
		<DialogContent bind:dialogOpen />
	</Dialog.Content>
</Dialog.Root>
