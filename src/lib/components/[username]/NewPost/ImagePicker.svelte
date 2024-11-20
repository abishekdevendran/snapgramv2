<script lang="ts">
	import CloudUpload from 'lucide-svelte/icons/cloud-upload';
	import Dropzone from 'svelte-file-dropzone';
	import { toast } from 'svelte-sonner';

	let {
		files = $bindable()
	}: {
		files: any[];
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
		let proccedFiles = acceptedFiles.map((file) => URL.createObjectURL(file));
		files = [...files, ...proccedFiles];
	}
</script>

<div class="flex h-32 w-32 overflow-hidden">
	<Dropzone on:drop={handleFilesSelect} multiple={true} accept="image/*">
		<span class="flex grow basis-0 flex-col items-center justify-center gap-2 text-center">
			Upload an Image
			<CloudUpload />
		</span>
	</Dropzone>
</div>
