import { QueryClient } from '@tanstack/react-query'

// Wired now even though Phase 0 has no data fetching of its own yet, so
// Phase 1 (objectives/tasks/readiness) doesn't need to re-plumb this.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
