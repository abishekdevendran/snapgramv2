<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Upload, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let open = $state(false);
	let imageUrl = $state('/images/user.png');
	let file: File | null = $state(null);

	function onFileSelected(event: Event) {
		const selectedFile = (event.target as HTMLInputElement).files?.[0];
		if (selectedFile) {
			file = selectedFile;
			imageUrl = URL.createObjectURL(selectedFile);
		}
	}

	function clearImage() {
		imageUrl = '/images/user.png';
		file = null;
	}

	function updateProfilePicture() {
		// Here you would typically upload the file to your server
		// For this example, we'll just show a success message
		toast.success('Profile picture updated successfully!');
		open = false;
	}
</script>

<Button onclick={() => (open = true)}>Update Profile Picture</Button>

<Dialog bind:open>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>Update Profile Picture</DialogTitle>
			<DialogDescription>Upload a new profile picture or clear the current one.</DialogDescription>
		</DialogHeader>
		<div class="grid gap-4 py-4">
			<div class="flex items-center justify-center">
				<Avatar class="h-24 w-24">
					<AvatarImage src={imageUrl} alt="Profile picture" />
					<AvatarFallback>User</AvatarFallback>
				</Avatar>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="picture" class="text-right">Picture</Label>
				<Input
					id="picture"
					type="file"
					accept="image/*"
					onchange={onFileSelected}
					class="col-span-3"
				/>
			</div>
		</div>
		<DialogFooter class="sm:justify-between">
			<Button variant="outline" onclick={clearImage} class="mr-2">
				<X class="mr-2 h-4 w-4" />
				Clear
			</Button>
			<div>
				<Button variant="outline" onclick={() => (open = false)} class="mr-2">Cancel</Button>
				<Button onclick={updateProfilePicture}>
					<Upload class="mr-2 h-4 w-4" />
					Update
				</Button>
			</div>
		</DialogFooter>
	</DialogContent>
</Dialog>
