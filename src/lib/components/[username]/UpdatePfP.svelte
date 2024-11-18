<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Upload, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import Pencil from 'lucide-svelte/icons/pencil';

	let {
		src,
		name
	}: {
		src: string | null;
		name: string | null;
	} = $props();

	let open = $state(false);
	let imageUrl = $state('/images/user.png');
	let file: File | null = $state(null);
</script>

<Dialog.Root>
	<Dialog.Trigger class="group rounded-full overflow-clip"
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
				class="absolute bottom-0 left-1/2 flex h-1/6 w-full -translate-x-1/2 items-center justify-center bg-gray-500 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none"
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
		<div>TBA</div>
		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
