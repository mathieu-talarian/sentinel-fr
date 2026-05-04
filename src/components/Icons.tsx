import type { JSX } from 'solid-js'

interface IconProps {
  size?: number
  class?: string
  stroke?: string
}

const wrap = (
  paths: JSX.Element,
  { size, class: cls, stroke }: IconProps = {},
) => (
  <svg
    width={size ?? 16}
    height={size ?? 16}
    viewBox="0 0 16 16"
    fill="none"
    stroke={stroke ?? 'currentColor'}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={cls}
  >
    {paths}
  </svg>
)

export const Icon = {
  Plus: (p?: IconProps) => wrap(<><path d="M8 3.5v9M3.5 8h9" /></>, p),
  Search: (p?: IconProps) =>
    wrap(<><circle cx="7" cy="7" r="4" /><path d="m13 13-2.6-2.6" /></>, p),
  Book: (p?: IconProps) =>
    wrap(
      <>
        <path d="M3 3h6a2 2 0 0 1 2 2v8H5a2 2 0 0 1-2-2V3z" />
        <path d="M13 3H9a2 2 0 0 0-2 2v8h6V5a2 2 0 0 0 0-2z" opacity=".5" />
      </>,
      p,
    ),
  Coin: (p?: IconProps) =>
    wrap(
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M6 9c.4.6 1.1 1 2 1s2-.5 2-1.3-1-1.1-2-1.3-2-.5-2-1.3S6.8 5 7.7 5 9.7 5.5 10 6" />
        <path d="M8 4.2v.8M8 11v.8" />
      </>,
      p,
    ),
  Scroll: (p?: IconProps) =>
    wrap(
      <>
        <path d="M4 2.5h7a2 2 0 0 1 2 2v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-8a.5.5 0 0 1 1 0v8a1 1 0 0 0 2 0v-8a1 1 0 0 0-1-1z" />
        <path d="M6 5.5h5M6 8h5" />
      </>,
      p,
    ),
  Bell: (p?: IconProps) =>
    wrap(
      <>
        <path d="M4 6.5a4 4 0 0 1 8 0v2.5l1 2H3l1-2V6.5z" />
        <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
      </>,
      p,
    ),
  Clipboard: (p?: IconProps) =>
    wrap(
      <>
        <rect x="4" y="3" width="8" height="11" rx="1.5" />
        <path d="M6 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
      </>,
      p,
    ),
  Send: (p?: IconProps) =>
    wrap(<><path d="m13 3-10 5 4 1.5L9 13l4-10z" /></>, p),
  Stop: (p?: IconProps) =>
    wrap(
      <rect
        x="4"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />,
      p,
    ),
  Paperclip: (p?: IconProps) =>
    wrap(
      <path d="M11.5 7 7 11.5a2.5 2.5 0 0 1-3.5-3.5L8 3.5a1.5 1.5 0 0 1 2.1 2.1L5.6 10.1" />,
      p,
    ),
  Sparkle: (p?: IconProps) =>
    wrap(
      <>
        <path d="M8 2v3M8 11v3M2 8h3M11 8h3" opacity=".7" />
        <path
          d="M8 4.5 9 7l2.5 1L9 9l-1 2.5L7 9 4.5 8 7 7l1-2.5z"
          fill="currentColor"
          stroke="none"
        />
      </>,
      p,
    ),
  Chevron: (p?: IconProps) => wrap(<path d="m6 4 4 4-4 4" />, p),
  Check: (p?: IconProps) => wrap(<path d="m3.5 8.5 3 3 6-6" />, p),
  X: (p?: IconProps) => wrap(<path d="m4 4 8 8M12 4l-8 8" />, p),
  Side: (p?: IconProps) =>
    wrap(
      <>
        <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
        <path d="M10 3v10" />
      </>,
      p,
    ),
  Settings: (p?: IconProps) =>
    wrap(
      <>
        <circle cx="8" cy="8" r="2" />
        <path d="M8 1.5v2M8 12.5v2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M1.5 8h2M12.5 8h2M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
      </>,
      p,
    ),
  Hash: (p?: IconProps) =>
    wrap(<path d="M3 6h10M3 10h10M6.5 3 5 13M11 3 9.5 13" />, p),
  Copy: (p?: IconProps) =>
    wrap(
      <>
        <rect x="5" y="5" width="8" height="8" rx="1.5" />
        <path d="M3 10V4a1 1 0 0 1 1-1h6" />
      </>,
      p,
    ),
  Refresh: (p?: IconProps) =>
    wrap(
      <>
        <path d="M3 8a5 5 0 0 1 8.5-3.5L13 6" />
        <path d="M13 3v3h-3" />
        <path d="M13 8a5 5 0 0 1-8.5 3.5L3 10" />
        <path d="M3 13v-3h3" />
      </>,
      p,
    ),
  ThumbUp: (p?: IconProps) =>
    wrap(
      <path d="M6 7v6H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2zm0 0 2-4a1.5 1.5 0 0 1 1.5 1.5V6h2.5a1 1 0 0 1 1 1.2l-1 4.6a1 1 0 0 1-1 .7H6" />,
      p,
    ),
  ThumbDown: (p?: IconProps) =>
    wrap(
      <path d="M6 9V3H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2zm0 0 2 4a1.5 1.5 0 0 0 1.5-1.5V10h2.5a1 1 0 0 0 1-1.2l-1-4.6a1 1 0 0 0-1-.7H6" />,
      p,
    ),
  Arrow: (p?: IconProps) => wrap(<path d="m4 8h8m-3-3 3 3-3 3" />, p),
  Customs: (p?: IconProps) =>
    wrap(<path d="M2 13h12M3 13V7l5-3 5 3v6M6 13V9h4v4M8 6.5v.5" />, p),
}

export type IconKey = keyof typeof Icon
