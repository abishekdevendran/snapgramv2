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
		return PUBLIC_R2_URL + '/post-image/' + fileName;
	}

	let images: {
		fileURL: string;
		caption: string | null;
	}[] = $state([]);
	$inspect(images);

	let caption = $state('');
	let isPrivate = $state(false);

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
		let compressedImages = await Promise.all(compPromises);

		if (!compressedImages) {
			toast.error('An error occurred while compressing the images. Please try again.');
			return;
		}

		// Make a GET call to /api/upload/images?uploadType=post-image?count=<count> to get presigned URLs
		let uploadUrls: string[] = [];
		let fileNames: string[] = [];
		const fetchUrl = `/api/upload/images?uploadType=post-image&count=${compressedImages!.length}`;
		try {
			const { urls, fileNames: fNames } = (
				(await (
					await fetch(fetchUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					})
				).json()) as {
					urls: ImageUploadType[];
				}
			).urls.reduce(
				(acc, { fileName, url }) => {
					acc.urls.push(url);
					acc.fileNames.push(fileName);
					return acc;
				},
				{ urls: [] as string[], fileNames: [] as string[] }
			);
			uploadUrls = urls;
			fileNames = fNames;
		} catch (error) {
			toast.error('An error occurred while getting the presigned URLs. Please try again.');
			return;
		}

		if (uploadUrls.length === 0) {
			toast.error('An error occurred while getting the presigned URLs. Please try again.');
			return;
		}
		if (uploadUrls.length !== compressedImages.length) {
			toast.error(
				'The number of presigned URLs does not match the number of images. Please try again.'
			);
			return;
		}
		// Make a PUT calls to the presigned URLs to upload the images
		try {
			await Promise.all(
				compressedImages!.map(async (image, index) => {
					const response = await fetch(uploadUrls[index], {
						method: 'PUT',
						body: image
					});
					if (!response.ok) {
						throw new Error('An error occurred while uploading the image. Please try again.');
					}
				})
			);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
				return;
			}
			toast.error('An error occurred while uploading the images. Please try again.');
			return;
		}
		if (fileNames.length === 0) {
			toast.error('An error occurred while uploading the images. Please try again.');
			return;
		}
		// Hit POST /api/posts with JSON imageUrls = getUploadFinalURL(fileNames), caption, isPrivate
		try {
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					images: fileNames.map((el)=>({
						url: getUploadFinalURL(el),
						caption: images.find((img) => img.fileURL === el)?.caption || null
					})) as {
						url: string;
						caption: string | null;
					}[],
					caption,
					isPrivate
				})
			});
			if (!response.ok) {
				throw new Error('An error occurred while creating the post. Please try again.');
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
				return;
			}
			toast.error('An error occurred while creating the post. Please try again.');
			return;
		}
		invalidateAll();
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
		<PostPreview bind:images bind:caption bind:isPrivate />
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
					await submitHandler();
					isProcessing = false;
				}}>Save changes</Button
			>
		</Dialog.Footer>
	</Tabs.Content>
</Tabs.Root>
