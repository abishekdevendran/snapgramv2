<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import Pencil from 'lucide-svelte/icons/pencil';
	import DialogContent from './ImageHandler/DialogContent.svelte';

	let {
		src,
		name
	}: {
		src: string | null;
		name: string | null;
	} = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="group overflow-clip rounded-full"
		><Avatar class="h-24 w-24 md:h-32 md:w-32">
			<AvatarImage {src} alt={'John Doe'} />
			<AvatarFallback
				>{name
					?.split(' ')
					.map((el) => el.at(0))
					.join('')
					.toUpperCase() ?? 'JD'}
			</AvatarFallback>
			<div
				class="pointer-events-none absolute bottom-0 left-1/2 flex h-1/6 w-full -translate-x-1/2 items-center justify-center bg-gray-500 opacity-0 transition-all duration-300 group-hover:opacity-100"
			>
				<Pencil size={12} />
			</div>
		</Avatar></Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update Profile Picture</Dialog.Title>
			<Dialog.Description>
				Make changes to your profile picture here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<DialogContent />
	</Dialog.Content>
</Dialog.Root>
