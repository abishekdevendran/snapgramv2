<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ImagePicker from './ImagePicker.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import ImageEditor from './ImageEditor.svelte';

	let tabStage = $state<'upload' | 'edit'>('upload');

	let file = $state<File | null>(null);
	let loadedFile = $derived.by(() => {
		if (file) {
			return URL.createObjectURL(file);
		}
	});
	$inspect(file, loadedFile);
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
			<ImageEditor image={loadedFile} />
		{/if}
		<Dialog.Footer>
			<Button
				type="reset"
				onclick={() => {
					file = null;
					tabStage = 'upload';
				}}>Change Image</Button
			>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer></Tabs.Content
	>
</Tabs.Root>
