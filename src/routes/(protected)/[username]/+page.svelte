<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { CircleAlert, Camera, Settings } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { Image } from '@unpic/svelte';
	import { blurhashToCssGradientString } from '@unpic/placeholder';
	import UpdateUser from '$lib/components/[username]/UpdateUser.svelte';

	let { data }: { data: PageData } = $props();

	let posts = $state([
		{ id: 1, imageUrl: '/images/placeholder.png' },
		{ id: 2, imageUrl: '/images/placeholder.png' },
		{ id: 3, imageUrl: '/images/placeholder.png' },
		{ id: 4, imageUrl: '/images/placeholder.png' },
		{ id: 5, imageUrl: '/images/placeholder.png' },
		{ id: 6, imageUrl: '/images/placeholder.png' }
	]);
</script>

{#if data?.user}
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8 flex flex-col items-center md:flex-row md:items-start">
			<Avatar class="h-24 w-24 md:h-32 md:w-32">
				<AvatarImage src={data.user?.profilePictureUrl} alt={'John Doe'} />
				<AvatarFallback
					>{data.user?.name
						?.split(' ')
						.map((el) => el.at(0))
						.join('')
						.toUpperCase() ?? 'JD'}</AvatarFallback
				>
			</Avatar>
			<div class="mt-4 md:ml-8 md:mt-0">
				<div class="mb-4 flex items-center">
					<h1 class="mr-4 text-2xl font-bold">{data.user?.name ?? 'John Doe'}</h1>
					<UpdateUser user={data.user} />
					<Button variant="ghost" size="icon">
						<Settings class="h-4 w-4" />
					</Button>
				</div>
				<div class="mb-4 flex">
					<span class="mr-6">
						<strong>{data.user?.posts?.length ?? 0}</strong>
						posts
					</span>
					<span class="mr-6">
						<strong>{data?.user?.followers?.length ?? 0}</strong>
						followers
					</span>
					<span>
						<strong>{data?.user?.following?.length ?? 0}</strong>
						following
					</span>
				</div>
				<div>
					<h2 class="font-bold">{data.user?.username ?? 'battletitan'}</h2>
					<p>{data?.user?.bio ?? `Hi, I'm New to SnapGram`}</p>
				</div>
			</div>
		</div>

		<Tabs value="posts" class="w-full">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="posts"><CircleAlert class="mr-2 h-4 w-4" /> Posts</TabsTrigger>
				<TabsTrigger value="reels"><Camera class="mr-2 h-4 w-4" /> Reels</TabsTrigger>
				<TabsTrigger value="tagged"><Avatar class="mr-2 h-4 w-4" /> Tagged</TabsTrigger>
			</TabsList>
			<TabsContent value="posts">
				<div class="grid grid-cols-3 gap-1">
					{#if data?.user?.posts?.length === 0}
						<p class="col-span-3 py-8 text-center">No posts to show</p>
					{:else}
						{#each data?.user?.posts ?? [] as post (post.id)}
							<Image
								layout="fullWidth"
								src={post.images[0].url}
								alt="Post {post.id}"
								class="aspect-square w-full object-cover"
								background={post.images[0]?.blurhash
									? blurhashToCssGradientString(post.images[0].blurhash)
									: undefined}
							/>
						{/each}
					{/if}
				</div>
			</TabsContent>
			<TabsContent value="reels">
				<p class="py-8 text-center">No reels to show</p>
			</TabsContent>
			<TabsContent value="tagged">
				<p class="py-8 text-center">No tagged posts</p>
			</TabsContent>
		</Tabs>
	</div>
{:else}
	Not signed in
{/if}
