<script lang="ts">
	import { Package2 } from 'lucide-svelte';
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

<aside
	class="fixed inset-y-0 left-0 z-50 hidden w-14 flex-col items-center border-r bg-background p-2 sm:flex"
>
	<a
		href="##"
		class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
	>
		<Package2 class="h-4 w-4 transition-all group-hover:scale-110" />
		<span class="sr-only">Acme Inc</span>
	</a>
</aside>
