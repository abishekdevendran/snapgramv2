import type { FullPosts } from '../../api/posts/+server.js'
import type { FullExtendedUser } from '../../api/user/+server.js'

export async function load({ parent, fetch }) {
    const { queryClient } = await parent()

    const fullExtendedUser = await (await fetch(`/api/user?extended=true`)).json() as FullExtendedUser
    if (fullExtendedUser) {
        // You need to use the SvelteKit fetch function here
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['posts'],
                queryFn: async () => await (await fetch(`/api/posts`)).json() as FullPosts
            }),
            queryClient.prefetchQuery({
                queryKey: ['followers'],
                queryFn: () => fullExtendedUser.followers,
            }),
            queryClient.prefetchQuery({
                queryKey: ['followings'],
                queryFn: () => fullExtendedUser.following,
            })
        ])
    }
}