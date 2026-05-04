import * as stylex from '@stylexjs/stylex'

type StyleArg = stylex.StyleXStyles | null | false | undefined

/**
 * Solid-friendly StyleX prop binder.
 *
 * StyleX returns `{ className, style }` (React naming). Solid wants `class`.
 * Spreading `sx(...)` directly onto a JSX element wires both correctly:
 *
 *   <div {...sx(styles.foo, condition && styles.bar)} />
 */
export function sx(...args: Array<StyleArg>) {
  return stylex.attrs(...(args as any))
}
