<script lang="ts">
	import { Image } from '@unpic/svelte';
	import { blurhashToCssGradientString } from '@unpic/placeholder';
	import type { FullPosts } from '../../../routes/api/posts/+server';
	import { Heart, MessageCircle } from 'lucide-svelte';

	let {
		post
	}: {
		post: FullPosts[number];
	} = $props();
</script>

<div class="group relative overflow-hidden cursor-pointer">
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
