import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  ink: "oklch(0.24 0.04 255)",
  ink2: "oklch(0.34 0.035 255)",
  ink3: "oklch(0.48 0.025 255)",
  ink4: "oklch(0.62 0.018 255)",
  ink5: "oklch(0.78 0.012 255)",

  paper: "oklch(0.985 0.006 80)",
  paper2: "oklch(0.965 0.008 80)",
  paper3: "oklch(0.935 0.01 80)",
  paper4: "oklch(0.895 0.012 80)",

  line: "oklch(0.88 0.008 80)",
  lineStrong: "oklch(0.78 0.01 80)",

  gold: "oklch(0.72 0.1 75)",
  goldDeep: "oklch(0.55 0.1 75)",
  goldSoft: "oklch(0.92 0.04 80)",

  ok: "oklch(0.62 0.1 155)",
  okSoft: "oklch(0.94 0.04 155)",
  warn: "oklch(0.7 0.12 60)",
  warnSoft: "oklch(0.95 0.04 80)",
  err: "oklch(0.58 0.16 25)",
  errSoft: "oklch(0.95 0.03 30)",
});

export const fonts = stylex.defineConsts({
  sans: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'Source Serif 4', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
});

export const radii = stylex.defineConsts({
  sm: "4px",
  md: "8px",
  lg: "12px",
});

export const shadows = stylex.defineConsts({
  sm: "0 1px 2px oklch(0.24 0.04 255 / 0.04)",
  md: "0 1px 3px oklch(0.24 0.04 255 / 0.06), 0 4px 12px oklch(0.24 0.04 255 / 0.04)",
  lg: "0 8px 32px oklch(0.24 0.04 255 / 0.1)",
});

export const borders = stylex.defineConsts({
  thin: "1px",
  thick: "1.5px",
  bold: "2px",
  solid: "solid",
});
