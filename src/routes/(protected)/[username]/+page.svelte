<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
	import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
	import { CircleAlert, Camera, Settings } from "lucide-svelte";;

	let username = $state("johndoe");
	let fullName = $state("John Doe");
	let bio = $state("Photography enthusiast | Travel lover | Coffee addict");
	let postCount = $state(42);
	let followerCount = $state(1234);
	let followingCount = $state(567);

	let posts = $state([
		{ id: 1, imageUrl: "/images/placeholder.png" },
		{ id: 2, imageUrl: "/images/placeholder.png" },
		{ id: 3, imageUrl: "/images/placeholder.png" },
		{ id: 4, imageUrl: "/images/placeholder.png" },
		{ id: 5, imageUrl: "/images/placeholder.png" },
		{ id: 6, imageUrl: "/images/placeholder.png" },
	]);
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col md:flex-row items-center md:items-start mb-8">
		<Avatar class="w-24 h-24 md:w-32 md:h-32">
			<AvatarImage src="/images/user.png" alt={username} />
			<AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
		</Avatar>
		<div class="md:ml-8 mt-4 md:mt-0">
			<div class="flex items-center mb-4">
				<h1 class="text-2xl font-bold mr-4">{username}</h1>
				<Button variant="outline" class="mr-2">Edit Profile</Button>
				<Button variant="ghost" size="icon">
					<Settings class="h-4 w-4" />
				</Button>
			</div>
			<div class="flex mb-4">
				<span class="mr-6">
					<strong>{postCount}</strong>
					 posts
				</span>
				<span class="mr-6">
					<strong>{followerCount}</strong>
					 followers
				</span>
				<span>
					<strong>{followingCount}</strong>
					 following
				</span>
			</div>
			<div>
				<h2 class="font-bold">{fullName}</h2>
				<p>{bio}</p>
			</div>
		</div>
	</div>

	<Tabs value="posts" class="w-full">
		<TabsList class="grid w-full grid-cols-3">
			<TabsTrigger value="posts"><CircleAlert class="h-4 w-4 mr-2" /> Posts</TabsTrigger>
			<TabsTrigger value="reels"><Camera class="h-4 w-4 mr-2" /> Reels</TabsTrigger>
			<TabsTrigger value="tagged"><Avatar class="h-4 w-4 mr-2" /> Tagged</TabsTrigger>
		</TabsList>
		<TabsContent value="posts">
			<div class="grid grid-cols-3 gap-1">
				{#each posts as post (post.id)}
					<img src={post.imageUrl} alt="Post {post.id}" class="w-full aspect-square object-cover" />
				{/each}
			</div>
		</TabsContent>
		<TabsContent value="reels">
			<p class="text-center py-8">No reels to show</p>
		</TabsContent>
		<TabsContent value="tagged">
			<p class="text-center py-8">No tagged posts</p>
		</TabsContent>
	</Tabs>
</div>
