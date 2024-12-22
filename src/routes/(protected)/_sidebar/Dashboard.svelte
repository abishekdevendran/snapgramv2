<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import { page } from '$app/state';
</script>

<Button
	type="button"
	variant="ghost"
	class="m-0 flex h-fit w-full items-center justify-start gap-2 p-0"
	href={`/${page.data.user.username}`}
>
	<CircleUser size={15} />
	Profile
</Button>
