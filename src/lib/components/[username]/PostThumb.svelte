<script lang="ts">
	import { Image } from '@unpic/svelte';
	import { blurhashToCssGradientString } from '@unpic/placeholder';
	import type { FullPosts } from '../../../routes/api/posts/+server';
	import { Heart, MessageCircle } from 'lucide-svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import type { FullPost } from '../../../routes/api/posts/[id]/+server';

	let {
		post
	}: {
		post: FullPosts[number];
	} = $props();

	let hasHovered = $state(false);
	$effect(() => {
		if (hasHovered) {
			const qc = useQueryClient();
			qc.fetchQuery({
				queryKey: ['posts', post.id],
				queryFn: async () => (await (await fetch(`/api/posts/${post.id}`)).json()) as FullPost
			});
		}
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative cursor-pointer overflow-hidden"
	onmouseenter={() => {
		hasHovered = true;
	}}
>
	<Image
		layout="fullWidth"
		src={post.images[0].url}
		alt="Post {post.id}"
		class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
		background={post.images[0]?.blurhash
			? blurhashToCssGradientString(post.images[0].blurhash)
			: undefined}
	/>
	<div
		class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-50"
	>
		<div
			class="flex items-center space-x-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<div class="flex items-center">
				<Heart class="mr-2 h-6 w-6" />
				<span>{post.likeCount}</span>
			</div>
			<div class="flex items-center">
				<MessageCircle class="mr-2 h-6 w-6" />
				<span>{post.commentCount}</span>
			</div>
		</div>
	</div>
</div>
<!-- {#if $postFull.isLoading}{/if} -->
