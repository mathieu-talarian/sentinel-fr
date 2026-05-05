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

/**
 * Merge a StyleX-produced class with a consumer-provided one.
 *
 * Atoms extend `JSX.*HTMLAttributes` so callers can pass `class` through; we
 * still need StyleX styles to win on collisions, but consumer classes should
 * compose. Returns `undefined` when both are empty so the attribute is dropped.
 */
export function cn(
  styled: string | undefined,
  passthrough: string | undefined,
): string | undefined {
  if (styled && passthrough) return `${styled} ${passthrough}`;
  return styled ?? passthrough;
}
