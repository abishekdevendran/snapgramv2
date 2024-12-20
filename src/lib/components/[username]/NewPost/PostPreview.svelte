<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from "$lib/components/ui/switch/index.js";
	let {
		images = $bindable(),
		caption = $bindable(),
		isPrivate = $bindable(),
	}: {
		images: {
			fileURL: string;
			caption: string | null;
		}[];
		caption: string;
		isPrivate: boolean;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center gap-2 pb-2">
	<Carousel.Root class="w-full max-w-xs">
		<Carousel.Content>
			{#each images as image, i}
				<Carousel.Item>
					<div class="relative flex h-full w-full items-center justify-center object-contain">
						<img src={image.fileURL} alt={image.caption ?? 'Post image'} />
						{#if image.caption}
							<div
								class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white transition-all duration-300 hover:opacity-20"
							>
								{image.caption}
							</div>
						{/if}
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
	<form class="flex w-full flex-col justify-center gap-2">
		<Label for="caption">Post Caption</Label>
		<Input type="text" id="caption" bind:value={caption} class="w-full" />
		<div class="flex items-center justify-between">
			<Label for="isPrivate">Private Post</Label>
			<Switch id="isPrivate" bind:checked={isPrivate} />
		</div>
	</form>
</div>
