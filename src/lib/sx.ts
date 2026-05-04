import * as stylex from "@stylexjs/stylex";

/**
 * Solid-friendly StyleX prop binder.
 *
 * StyleX returns `{ className, style }` (React naming). Solid wants `class`.
 * Spreading `sx(...)` directly onto a JSX element wires both correctly:
 *
 *   <div {...sx(styles.foo, condition && styles.bar)} />
 *
 * `stylex.attrs` is invariant on its style argument; we accept `unknown[]` and
 * defer validation to the StyleX compiler/runtime so conditional spreads stay
 * ergonomic.
 */
export function sx(...args: unknown[]) {
  return stylex.attrs(...(args as never[]));
}
