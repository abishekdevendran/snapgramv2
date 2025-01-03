import { browser } from '$app/environment'
import { QueryClient } from '@tanstack/svelte-query'

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        staleTime: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  return { queryClient }
}