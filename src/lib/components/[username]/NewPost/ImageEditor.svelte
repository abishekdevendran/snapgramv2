<script lang="ts">
	import Cropper from 'svelte-easy-crop';

	let {
		image,
		setFinalImage
	}: {
		image: string;
		setFinalImage: (image: Blob) => void;
	} = $props();
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
</script>

<div class="relative h-96 w-full">
	<Cropper
		showGrid
		aspect={1}
		restrictPosition
		{image}
		bind:crop
		bind:zoom
		on:cropcomplete={(e) => {
			const { x, y, width, height } = e.detail.pixels;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();
			img.src = image;
			img.onload = () => {
				canvas.width = width;
				canvas.height = height;
				if (!ctx) return;
				ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
				canvas.toBlob((blob) => {
					if (!blob) return;
					setFinalImage(blob);
				});
			};
		}}
	/>
</div>
