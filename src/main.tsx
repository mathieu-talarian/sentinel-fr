/* @refresh reload */
import { render } from 'solid-js/web'
import { RouterProvider } from '@tanstack/solid-router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'

import { getRouter } from './router'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})
const router = getRouter(queryClient)

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root mount node')

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  ),
  root,
)
