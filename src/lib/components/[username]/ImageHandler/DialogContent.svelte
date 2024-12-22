<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ImagePicker from './ImagePicker.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import ImageEditor from './ImageEditor.svelte';
	import Compressor from 'compressorjs';
	import { toast } from 'svelte-sonner';
	import type { ImageUploadType } from '../../../../routes/api/upload/images/+server';
	import { PUBLIC_R2_URL } from '$env/static/public';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';

	let tabStage = $state<'upload' | 'edit'>('upload');
	let isProcessing = $state(false);

	function getPfPFinalURL(fileName: string): string {
		return PUBLIC_R2_URL + '/profile-picture/' + fileName;
	}

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

	let file = $state<File | null>(null);
	let loadedFile = $derived.by(() => {
		if (file) {
			return URL.createObjectURL(file);
		}
	});
	let finalImage = $state<Blob | null>(null);

	async function finalImageSubmitHandler() {
		if (!finalImage || !file) {
			toast.error('No image selected. How did you even get here?');
			return;
		}
		let compressedImage;
		try {
			// convert the blob to a file
			const finalFile = new File([finalImage!], file.name, { type: file.type });
			// compress the image
			compressedImage = await compressImage(finalFile);
			toast.success('Image compressed successfully!');
		} catch (error) {
			toast.error('An error occurred while compressing the image. Please try again.');
			return;
		}
		let uploadUrl, fileName;
		try {
			// Make a GET call to /api/upload/images?uploadType=profile-picture to get presigned URL
			const fetchUrl = '/api/upload/images?uploadType=profile-picture';
			let { fileName: fName, url } = (await (
				await fetch(fetchUrl, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})
			).json()) as ImageUploadType;
			uploadUrl = url;
			fileName = fName;
		} catch (error) {
			toast.error('An error occurred while fetching the presigned URL. Please try again.');
			return;
		}
		try {
			// Make a PUT call to the presigned URL to upload the image
			const response = await fetch(uploadUrl, {
				method: 'PUT',
				body: compressedImage
			});
			if (response.ok) {
				toast.success('Image uploaded successfully!');
			} else {
				toast.error('An error occurred while uploading the image. Please try again.');
			}
		} catch (error) {
			toast.error('An error occurred while uploading the image. Please try again.');
			return;
		}
		// Hit POST /${username}/?/patchUser with formData profilePictureUrl = getPfPFinalURL(fileName)
		try {
			const formData = new FormData();
			formData.append('profilePictureUrl', getPfPFinalURL(fileName));
			const response = await fetch(`/${page.data.user.username}?/patchUser`, {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				toast.success('Profile picture updated successfully!');
				await invalidateAll();
			} else {
				toast.error('An error occurred while updating the profile picture. Please try again.');
			}
		} catch (error) {
			toast.error('An error occurred while updating the profile picture. Please try again.');
			return;
		}
	}
</script>

<Tabs.Root class="w-full" value={tabStage} disabled controlledValue>
	<Tabs.List class="flex w-full items-center justify-center">
		<Tabs.Trigger disabled={tabStage !== 'upload'} value="upload" class="grow"
			>Upload image</Tabs.Trigger
		>
		<Tabs.Trigger disabled={tabStage !== 'edit'} value="edit" class="grow"
			>Edit and save</Tabs.Trigger
		>
	</Tabs.List>
	<Tabs.Content value="upload">
		<ImagePicker bind:file toggleNext={() => (tabStage = 'edit')} />
	</Tabs.Content>
	<Tabs.Content value="edit">
		{#if loadedFile}
			<ImageEditor image={loadedFile} setFinalImage={(image) => (finalImage = image)} />
		{/if}
		<Dialog.Footer class="gap-2 max-md:mt-2">
			<Button
				disabled={isProcessing}
				type="reset"
				onclick={() => {
					file = null;
					tabStage = 'upload';
				}}>Change Image</Button
			>
			<Button
				disabled={isProcessing}
				type="submit"
				onclick={async (e) => {
					e.preventDefault();
					isProcessing = true;
					await finalImageSubmitHandler();
					isProcessing = false;
				}}>Save changes</Button
			>
		</Dialog.Footer>
	</Tabs.Content>
</Tabs.Root>
