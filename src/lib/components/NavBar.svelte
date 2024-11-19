<script lang="ts">
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import User from '$lib/components/User.svelte';
</script>

<header
	class="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<div class="mr-4 hidden md:flex"></div>
		<div class="flex flex-1 items-center justify-center space-x-2 md:justify-end">
			<h1 class="font-poppins text-xl font-black">SnapGram</h1>
		</div>
	</div>
</header>
