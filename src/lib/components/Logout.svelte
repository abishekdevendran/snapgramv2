<!-- routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from './ui/button';
</script>

<form method="post" action="/?/logout" use:enhance>
	<Button type="submit">Sign out</Button>
</form>
