<script lang="ts">
	import ImagePicker from './ImagePicker.svelte';
	let {
		images = $bindable()
	}: {
		images: any[];
	} = $props();

	$inspect(images);
</script>

<div class="flex items-center justify-center">
	<div class="flex flex-wrap items-center justify-center gap-2 w-full">
		<ImagePicker bind:files={images} />
		{#each images as image, i}
			<div class="relative h-32 w-32">
				<!-- svelte-ignore a11y_img_redundant_alt -->
				<img src={image} alt="Post image" class="h-full w-full object-cover" />
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<!-- svelte-ignore event_directive_deprecated -->
				<button
					type="button"
					class="absolute right-0 top-0 rounded-full bg-white p-1 shadow-md"
					on:click={() => {
						images = images.filter((_, index) => index !== i);
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 text-red-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/each}
	</div>
</div>
