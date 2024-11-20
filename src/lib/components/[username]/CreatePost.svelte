<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import DialogContent from './NewPost/DialogContent.svelte';
	import { Button } from '../ui/button';

	let {
		src,
		name
	}: {
		src: string | null;
		name: string | null;
	} = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="group overflow-clip">
		<Button variant="outline" size="icon">
			<SquarePlus size={12} class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new Post</Dialog.Title>
			<Dialog.Description>
				Select image(s) to upload. Add captions to your post and/or images.
			</Dialog.Description>
		</Dialog.Header>
		<DialogContent />
	</Dialog.Content>
</Dialog.Root>
