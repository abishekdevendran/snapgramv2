<script lang="ts">
	import CloudUpload from 'lucide-svelte/icons/cloud-upload';
	import Dropzone from 'svelte-file-dropzone';
	import { toast } from 'svelte-sonner';

	let {
		file = $bindable(),
		toggleNext
	}: {
		file: File | null;
		toggleNext: () => void;
	} = $props();

	function handleFilesSelect(e: {
		detail: {
			acceptedFiles: File[];
			fileRejections: File[];
		};
	}) {
		const { acceptedFiles } = e.detail;
		if (!acceptedFiles.length) {
			toast.error('Please select a file to continue');
		}
		file = acceptedFiles[0];
		toggleNext();
	}
</script>

<Dropzone
	on:drop={handleFilesSelect}
	multiple={false}
	containerClasses="!bg-primary"
	containerStyles={'!bg-primary'}
	accept="image/*"
>
	Upload a file to continue
	<CloudUpload />
</Dropzone>
