<script lang="ts">
	import { applyAction, enhance } from '$app/forms';

	import LogOut from 'lucide-svelte/icons/log-out';
	import { toast } from 'svelte-sonner';
</script>

<form
	method="post"
	use:enhance={({}) => {
		return async ({ result, update }) => {
			// Handle failure and success conditions
			if (result.type === 'failure') {
				if (typeof result.data?.message === 'string') {
					toast.error(result.data?.message || 'Something went wrong');
				}
			} else if (result.type === 'success' || result.type === 'redirect') {
				toast.success('Logged out successfully!');
				applyAction(result);
			}
		};
	}}
	action="/?/logout"
	class="items flex w-full pl-1"
>
	<button class="flex w-full items-center gap-2">
		<LogOut size={15} />
		Logout
	</button>
</form>
