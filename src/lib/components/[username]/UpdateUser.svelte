<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import type { FullUser } from '../../../routes/(protected)/[username]/+page.server';
	import { enhance } from '$app/forms';

	let {
		user
	}: {
		user: FullUser;
	} = $props();

	let fullName = $state('');
	let username = $state('');
	let open = $state(false);
</script>

{#if user}
	<Dialog bind:open>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Update User Information</DialogTitle>
				<DialogDescription
					>Change your full name and username here. Click save when you're done.</DialogDescription
				>
			</DialogHeader>

			<form
				action="?/patchUser"
				method="post"
				use:enhance={({}) => {
					let promiseCallbacks: { resolve: any; reject: any };
					const toastPromise = new Promise((resolve, reject) => {
						promiseCallbacks = { resolve, reject };
					});
					// Show the toast immediately
					toast.promise(toastPromise, {
						loading: 'Updating user information...',
						success: 'User information updated successfully!',
						error: (e) => `Error: ${e}`
					});
					// Return the callback that will handle the form submission result
					return async ({ result, update }) => {
						console.log('Action result: ', result);
						if (result.type === 'success' || result.type === 'redirect') {
							promiseCallbacks.resolve('User information updated successfully!');
						} else if (result.type === 'failure') {
							switch (result.status) {
								case 401:
									promiseCallbacks.reject('Unauthorized');
									break;
								case 400:
									promiseCallbacks.reject(result.data?.error);
								default:
									promiseCallbacks.reject('Unknown error');
									break;
							}
						} else {
							promiseCallbacks.reject('Unknown error');
						}
						update();
					};
				}}
			>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="fullName" class="text-right">Full Name</Label>
						<Input
							id="fullName"
							name="name"
							placeholder={user.name}
							bind:value={fullName}
							class="col-span-3"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">Username</Label>
						<Input
							id="username"
							name="username"
							placeholder={user.username}
							bind:value={username}
							class="col-span-3"
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose>
						<Button type="reset" variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit">Save changes</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>

	<Button variant="outline" class="mr-2" onclick={() => (open = !open)}>Edit Profile</Button>
{/if}
