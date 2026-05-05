import * as stylex from "@stylexjs/stylex";

/**
 * StyleX prop binder for React.
 *
 * `stylex.props` returns `{ className, style }` — exactly the shape React
 * expects. Spread it onto a JSX element to wire both at once:
 *
 *   <div {...sx(styles.foo, condition && styles.bar)} />
 *
 * `stylex.props` is invariant on its style argument; we accept `unknown[]` and
 * defer validation to the StyleX compiler/runtime so conditional spreads stay
 * ergonomic.
 */
export function sx(...args: unknown[]) {
  return stylex.props(...(args as never[]));
}
