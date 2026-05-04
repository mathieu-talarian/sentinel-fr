import { Outlet, createRootRouteWithContext } from '@tanstack/solid-router'
import { createEffect, lazy, Suspense } from 'solid-js'
import * as stylex from '@stylexjs/stylex'

import { useTweaks } from '~/lib/tweaks'
import { sx } from '~/lib/sx'
import type { RouterContext } from '~/router'

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/solid-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const [tweaks] = useTweaks()

  // Pin theme + density on <html> so the global CSS vars swap in one place.
  createEffect(() => {
    const t = tweaks()
    document.documentElement.dataset.theme = t.theme
    document.documentElement.dataset.density = t.density
    document.documentElement.lang = t.lang
  })

  return (
    <>
      <div {...sx(s.app)}>
        <Outlet />
      </div>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
}

const s = stylex.create({
  app: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    background: 'var(--paper)',
    color: 'var(--ink)',
  },
})
