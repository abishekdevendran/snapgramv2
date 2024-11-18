<script lang="ts">
	import Cropper from 'svelte-easy-crop';

	let {
		image
	}: {
		image: string;
	} = $props();
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
</script>

<div class="relative h-96 w-full">
	<Cropper showGrid aspect={1} restrictPosition {image} bind:crop bind:zoom on:cropcomplete={(e) => console.log(e.detail)} />
</div>
