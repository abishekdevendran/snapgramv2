<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
</script>

{#if $page.data.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Avatar.Root class="hover:bg-primary/90">
				<Avatar.Image
					class="hover:opacity-80"
					src={$page.data.user.profilePictureUrl}
					alt={$page.data.user.username}
				/>
				<Avatar.Fallback class="hover:opacity-80"
					>{$page.data.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback
				>
			</Avatar.Root>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>Hey, {$page.data.user.username}!</DropdownMenu.GroupHeading>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Profile</DropdownMenu.Item>
				<DropdownMenu.Item>Billing</DropdownMenu.Item>
				<DropdownMenu.Item>Team</DropdownMenu.Item>
        <DropdownMenu.Separator />
				<DropdownMenu.Item class="p-0">
					<form method="post" action="/?/logout" use:enhance class="h-full w-full">
						<button type="submit" class="h-full w-full p-2">Sign out</button>
					</form></DropdownMenu.Item
				>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else if $page.url.pathname !== '/login'}
	<Button href="/login">Login</Button>
{/if}
