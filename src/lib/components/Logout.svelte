<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
</script>

<form
	method="post"
	action="/?/logout"
	use:enhance={() => {
		let promiseCallbacks: { resolve: any; reject: any };
		const toastPromise = new Promise((resolve, reject) => {
			promiseCallbacks = { resolve, reject };
		});

		// Show the toast immediately
		toast.promise(toastPromise, {
			loading: 'Logging out...',
			success: 'Logged out successfully!',
			error: (e) => `Error: ${e}`
		});

		// Return the callback that will handle the form submission result
		return async ({ result, update }) => {
			console.log('Action result: ', result);
			switch (result.status) {
				case 200:
				case 302:
					promiseCallbacks.resolve('Logged out successfully!');
					break;
				case 401:
					promiseCallbacks.reject('Unauthorized');
					break;
				default:
					promiseCallbacks.reject('Unknown error');
					break;
			}
			update();
		};
	}}
	class="h-full w-full"
>
	<button type="submit" class="h-full w-full p-2">Sign out</button>
</form>
