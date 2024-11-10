<script lang="ts">
	import { Package2 } from 'lucide-svelte';
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
