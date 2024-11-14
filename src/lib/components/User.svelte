<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
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
					>{$page.data.user?.name
						?.split(' ')
						.map((el: string) => el.at(0))
						.join('')
						.toUpperCase()}</Avatar.Fallback
				>
			</Avatar.Root>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>Hey, {$page.data.user.username}!</DropdownMenu.GroupHeading>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => goto(`/${$page.data.user.username}`)}>
					Profile</DropdownMenu.Item
				>
				<DropdownMenu.Item>Billing</DropdownMenu.Item>
				<DropdownMenu.Item>Team</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="p-0">
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
					</form></DropdownMenu.Item
				>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else if $page.url.pathname !== '/login'}
	<Button href="/login">Login</Button>
{/if}
