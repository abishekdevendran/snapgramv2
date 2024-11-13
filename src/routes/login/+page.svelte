<script lang="ts">
	import LoginForm from '$lib/components/login-form.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	// on mount, check if any errors are in the URL and toast
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const error = urlParams.get('error');
		if (error) {
			toast.error(error);
		}
		// clear the error from the URL by constructing a new URL without just the error param
		urlParams.delete('error');
		const newUrl =
			window.location.protocol +
			'//' +
			window.location.host +
			window.location.pathname +
			(urlParams.toString() ? '?' + urlParams.toString() : '');
		window.history.replaceState({ path: newUrl }, '', newUrl);
	});
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<LoginForm />
</div>
