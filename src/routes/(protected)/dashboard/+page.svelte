<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	// on mount, check if any errors are in the URL and toast
	$effect(() => {
		const urlParams = page.url.searchParams;
		const error = urlParams.get('error');
		if (error) {
			toast.error(error);
			// clear the error from the URL by constructing a new URL without just the error param
			urlParams.delete('error');
			const newUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				window.location.pathname +
				(urlParams.toString() ? '?' + urlParams.toString() : '');
			goto(newUrl);
		}
	});
</script>

Hi
