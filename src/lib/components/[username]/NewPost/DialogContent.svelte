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

	let tabStage = $state<'upload' | 'finish-up'>('upload');
	let isProcessing = $state(false);

	function getUploadFinalURL(fileName: string): string {
		return PUBLIC_R2_URL + '/profile-picture/' + fileName;
	}

    let images = $state([]);
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
				disabled={isProcessing}
				type="submit"
				onclick={async (e) => {
					e.preventDefault();
					tabStage = 'finish-up';
				}}>Add post details</Button
			>
		</Dialog.Footer>
    </Tabs.Content>
	<Tabs.Content value="finish-up">
		<Dialog.Footer class="gap-2 max-md:mt-2">
			<Button
				disabled={isProcessing}
				type="reset"
				onclick={() => {
					tabStage = 'upload';
				}}>Change Image</Button
			>
			<Button
				disabled={isProcessing}
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
