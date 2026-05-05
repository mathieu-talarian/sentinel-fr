export interface SuggestionT {
  id: "classify" | "cost" | "alert";
  tag: string;
  text: string;
}

export const SUGGESTIONS: SuggestionT[] = [
  {
    id: "classify",
    tag: "CLASSIFY",
    text: "What's the HTS code for a leather handbag I'm shipping to the US?",
  },
  {
    id: "cost",
    tag: "LANDED COST",
    text: "What would be the landed cost on $20,000 of cotton t-shirts, ocean freight?",
  },
  {
    id: "alert",
    tag: "ALERT",
    text: "Subscribe me to alerts on HTS 8517.13 (smartphones) — email me at marie@exporter.fr",
  },
];

const TITLES: Record<string, string> = {
  classify: "Leather handbag — HTS classification",
  cost: "Landed cost — $20k cotton t-shirts (ocean)",
  alert: "Subscribe — alerts on HTS 8517.13 (smartphones)",
};

export function suggestionTitleFor(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("handbag") || t.includes("leather")) return TITLES.classify;
  if (t.includes("landed") || t.includes("cost") || t.includes("shirt"))
    return TITLES.cost;
  if (t.includes("alert") || t.includes("subscribe") || t.includes("8517"))
    return TITLES.alert;
  return null;
}
