import type { WatchSubscribeResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

export function SubscribeConfirm(
  props: Readonly<{ result: WatchSubscribeResponseT }>,
) {
  const showTech = !!props.result.cadence || !!props.result.subscriptionId;

  return (
    <div>
      <div {...sx(sb.banner)}>
        <Icon.Check />
        <div {...sx(sb.body)}>
          <strong>Subscription active</strong>
          <div {...sx(sb.line)}>
            Watching <strong>{props.result.codes.join(", ")}</strong> for{" "}
            <strong>{props.result.email}</strong>.
          </div>
        </div>
      </div>
      <div {...sx(sb.sources)}>
        <div {...sx(sb.sourcesLabel)}>Sources monitored</div>
        <ul {...sx(sb.sourcesList)}>
          {props.result.sources.map((src) => (
            <li key={src}>{src}</li>
          ))}
        </ul>
        {showTech && (
          <div {...sx(sb.tech)}>
            {props.result.cadence && (
              <>
                cadence: {props.result.cadence}
                <br />
              </>
            )}
            {props.result.subscriptionId && (
              <>subscription: {props.result.subscriptionId}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const sb = stylex.create({
  banner: {
    padding: "10px 12px",
    borderColor: colors.ok,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: colors.okSoft,
    color: colors.ok,
    display: "flex",
  },
  body: { color: colors.ink, fontSize: 12.5 },
  line: { color: colors.ink3, marginTop: 4 },
  sources: {
    color: colors.ink3,
    fontSize: 12,
    marginTop: 12,
  },
  sourcesLabel: {
    color: colors.ink2,
    fontWeight: 500,
    marginBottom: 4,
  },
  sourcesList: { margin: 0, paddingLeft: 18 },
  tech: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 8,
  },
});
