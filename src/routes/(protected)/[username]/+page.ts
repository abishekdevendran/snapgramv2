export async function load({ parent, fetch }) {
    const { queryClient } = await parent()

    // You need to use the SvelteKit fetch function here
    await queryClient.prefetchQuery({
        queryKey: ['posts'],
        queryFn: async () => (await fetch('/api/posts')).json(),
    })

    await queryClient.prefetchQuery({
        queryKey: ['followers'],
        queryFn: async () => (await fetch('/api/followers')).json(),
    })

    await queryClient.prefetchQuery({
        queryKey: ['followings'],
        queryFn: async () => (await fetch('/api/followings')).json(),
    })
}