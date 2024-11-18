<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { CircleAlert, Camera, Settings } from 'lucide-svelte';
	import type { PageData } from './$types';
	import UpdateUser from '$lib/components/[username]/UpdateUser.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { FullFollowers } from '../../api/followers/+server';
	import type { FullFollowings } from '../../api/followings/+server';
	import type { FullPosts } from '../../api/posts/+server';
	import PostThumb from '$lib/components/[username]/PostThumb.svelte';
	import UpdatePfP from '$lib/components/[username]/UpdatePfP.svelte';

	let { data }: { data: PageData } = $props();

	// This data is cached by prefetchQuery in +page.ts so no fetch actually happens here
	const posts = createQuery({
		queryKey: ['posts'],
		queryFn: async () => (await (await fetch('/api/posts')).json()) as FullPosts
	});

	const followers = createQuery({
		queryKey: ['followers'],
		queryFn: async () => (await (await fetch('/api/followers')).json()) as FullFollowers
	});

	const following = createQuery({
		queryKey: ['followings'],
		queryFn: async () => (await (await fetch('/api/followings')).json()) as FullFollowings
	});
</script>

{#if data?.user}
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8 flex flex-col items-center md:flex-row md:items-start">
			<UpdatePfP src={data?.user?.profilePictureUrl} name={data?.user?.name} />
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
						<strong>{$posts.data?.length ?? 0}</strong>
						posts
					</span>
					<span class="mr-6">
						<strong>{$followers.data?.length ?? 0}</strong>
						followers
					</span>
					<span>
						<strong>{$following.data?.length ?? 0}</strong>
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
					{#if $posts.isLoading}
						<p class="col-span-3 py-8 text-center">Loading...</p>
					{:else if $posts.isError}
						<p class="col-span-3 py-8 text-center">Error loading posts</p>
					{:else if $posts.data?.length === 0}
						<p class="col-span-3 py-8 text-center">No posts to show</p>
					{:else}
						{#each $posts.data ?? [] as post (post.id)}
							<PostThumb {post} />
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
