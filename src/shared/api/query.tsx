import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ApiError } from './client'
import type { ComponentType } from 'react'

// One client for every island of the page (each Astro island is its own React tree, D56)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => (error instanceof ApiError && error.status === 503 ? false : failureCount < 1),
      refetchOnWindowFocus: false,
    },
  },
})

// `export default withQuery(FixedCostTable)` so the island can use useQuery / useMutation
export function withQuery<P extends object>(Component: ComponentType<P>) {
  function WithQuery(props: P) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    )
  }
  WithQuery.displayName = `withQuery(${Component.displayName ?? Component.name})`
  return WithQuery
}
