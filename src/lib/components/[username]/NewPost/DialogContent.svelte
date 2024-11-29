<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import Compressor from 'compressorjs';
	import { toast } from 'svelte-sonner';
	import type { ImageUploadType } from '../../../../routes/api/upload/images/+server';
	import { PUBLIC_R2_URL } from '$env/static/public';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import PostImages from './PostImages.svelte';
	import PostPreview from './PostPreview.svelte';

	let tabStage = $state<'upload' | 'finish-up'>('upload');
	let isProcessing = $state(false);

	function getUploadFinalURL(fileName: string): string {
		return PUBLIC_R2_URL + '/profile-picture/' + fileName;
	}

	let images: {
		fileURL: string;
		caption: string | null;
	}[] = $state([]);
	$inspect(images);

	let caption = $state('');
	$inspect(caption);

	// Client-side compression
	function compressImage(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.7, // 70% compression
				convertSize: 1000000, // Convert PNG/JPEG over 1MB
				success(result) {
					resolve(result);
				},
				error(err) {
					reject(err);
				}
			});
		});
	}

	// Submit handler
	async function submitHandler() {
		if (images.length === 0 || caption.trim() === '') {
			toast.error('Please add at least one image and a caption.');
			return;
		}
		// Compress the images
		let compPromises = images.map(async (image) => {
			const file = await fetch(image.fileURL).then((res) => res.blob());
			return compressImage(new File([file], image.fileURL.split('/').pop()!, { type: file.type }));
		});
		let compressedImages: Blob[] | undefined;
		toast.promise(
			async () => {
				compressedImages = await Promise.all(compPromises);
			},
			{
				loading: 'Compressing images...',
				success: 'Images compressed successfully!',
				error: 'An error occurred while compressing the images. Please try again.'
			}
		);

		if (!compressedImages) {
			return;
		}

		// Get presigned URLs
	}
</script>

<Tabs.Root class="w-full" value={tabStage} disabled controlledValue>
	<Tabs.List class="flex w-full items-center justify-center">
		<Tabs.Trigger disabled={tabStage !== 'upload'} value="upload" class="grow basis-0"
			>Upload image(s)</Tabs.Trigger
		>
		<Tabs.Trigger disabled={tabStage !== 'finish-up'} value="finish-up" class="grow basis-0"
			>Finish Up</Tabs.Trigger
		>
	</Tabs.List>
	<Tabs.Content value="upload">
		<PostImages bind:images />
		<Dialog.Footer class="gap-2 max-md:mt-2">
			<Button
				disabled={isProcessing || images.length === 0}
				type="submit"
				onclick={async (e) => {
					e.preventDefault();
					tabStage = 'finish-up';
				}}>Add post details</Button
			>
		</Dialog.Footer>
	</Tabs.Content>
	<Tabs.Content value="finish-up">
		<PostPreview bind:images bind:caption />
		<Dialog.Footer class="gap-2 max-md:mt-2">
			<Button
				disabled={isProcessing}
				type="reset"
				onclick={() => {
					tabStage = 'upload';
				}}>Change Image</Button
			>
			<Button
				disabled={isProcessing || images.length === 0 || caption.trim() === ''}
				type="submit"
				onclick={async (e) => {
					e.preventDefault();
					isProcessing = true;
					isProcessing = false;
				}}>Save changes</Button
			>
		</Dialog.Footer>
	</Tabs.Content>
</Tabs.Root>
