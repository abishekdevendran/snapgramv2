<script lang="ts">
	import { CircleX, Pencil } from 'lucide-svelte';
	import ImagePicker from './ImagePicker.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	let {
		images = $bindable()
	}: {
		images: {
			fileURL: string;
			caption: string | null;
		}[];
	} = $props();

	let isOpen = $state(-1);
</script>

<div class="flex items-center justify-center pb-2">
	<div
		class="flex max-h-[50dvh] w-full flex-wrap items-center justify-center gap-2 overflow-y-auto overflow-x-hidden"
	>
		<ImagePicker bind:files={images} />
		{#each images as image, i}
			<div class="relative h-32 w-32">
				<!-- svelte-ignore a11y_img_redundant_alt -->
				<img
					src={image.fileURL}
					alt={image.caption ?? 'Post image'}
					class="h-full w-full object-cover"
				/>
				<div class="absolute right-1 top-1 flex gap-1 overflow-visible">
					<Dialog.Root open={isOpen===i} onOpenChange={(e) => isOpen = e ? i : -1}>
						<Dialog.Trigger class="group">
							<button
								type="button"
								class={`flex h-8 w-8 items-center justify-center rounded-full p-2 ${image.caption ? 'bg-green-500 text-white' : 'bg-white text-black'} shadow-md transition-all duration-300 hover:scale-110`}
							>
								<Pencil />
							</button>
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Set Caption</Dialog.Title>
								<Dialog.Description>Add or edit the caption for this image.</Dialog.Description>
								<div>
									<img
										src={image.fileURL}
										alt={image.caption ?? 'Post image'}
										class="h-full w-full object-cover"
									/>
								</div>
								<form onsubmit={(e) => {e.preventDefault(); isOpen = -1}} class="flex gap-2">
									<Input
										type="text"
										placeholder="Add a caption"
										bind:value={image.caption}
										class="w-full"
									/>
									<Button type="submit">Save</Button>
								</form>
							</Dialog.Header>
						</Dialog.Content>
					</Dialog.Root>
					<button
						type="button"
						class="flex h-8 w-8 items-center justify-center rounded-full bg-white p-2 text-red-500 shadow-md transition-all duration-300 hover:scale-110"
						onclick={() => {
							images = images.filter((_, index) => index !== i);
						}}
					>
						<CircleX />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
