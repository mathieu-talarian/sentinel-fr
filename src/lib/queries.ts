import type { SessionT } from "./auth";
import type { AlertItemT } from "./types";

import { queryOptions } from "@tanstack/solid-query";

import { fetchMe, loadSessionHint, persistSessionHint } from "./auth";

export interface PriorConvoT {
  id: string;
  title: string;
  when: string;
}

/* In a real backend these endpoints would be wired in; for now we resolve
   client-side mock data so the screens have realistic content. The query
   shape stays correct so the swap is a one-liner later. */

const PRIOR_CONVOS: PriorConvoT[] = [
  {
    id: "c1",
    title: "Wine import duty — 2023 vintage Bordeaux",
    when: "Today",
  },
  { id: "c2", title: "Textile origin rules under USMCA", when: "Yesterday" },
  { id: "c3", title: "EU footwear → 6402 vs 6404 split", when: "Apr 28" },
  { id: "c4", title: "Section 232 steel surcharge — France", when: "Apr 25" },
  { id: "c5", title: "Cosmetics with botanical extracts", when: "Apr 22" },
  { id: "c6", title: "Smartphone accessories bundling", when: "Apr 19" },
  { id: "c7", title: "De minimis threshold for samples", when: "Apr 14" },
];

const ALERTS: AlertItemT[] = [
  {
    date: "2026-04-22",
    code: "8517.13",
    source: "CSMS #59812",
    status: "sent",
    subject: "USMCA: clarification on smartphone country-of-origin marking",
  },
  {
    date: "2026-03-08",
    code: "8517.13",
    source: "Federal Register 91 FR 14207",
    status: "sent",
    subject: "Section 232 Phase II: investigation into ICT imports",
  },
  {
    date: "2026-02-15",
    code: "8517.13",
    source: "CSMS #58441",
    status: "sent",
    subject: "Updated guidance on lithium-battery declarations",
  },
];

export interface CatalogStatsT {
  hts_codes_indexed: number;
  cross_rulings_since: number;
  active_alerts: number;
}

const CATALOG_STATS: CatalogStatsT = {
  hts_codes_indexed: 13_847,
  cross_rulings_since: 2002,
  active_alerts: 3,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ME_QUERY_KEY = ["auth", "me"] as const;

export const meQueryOptions = () =>
  queryOptions({
    queryKey: ME_QUERY_KEY,
    queryFn: async (): Promise<SessionT | null> => {
      const session = await fetchMe();
      persistSessionHint(session);
      return session;
    },
    initialData: () => loadSessionHint(),
    staleTime: 5 * 60_000,
    gcTime: Infinity,
    retry: false,
  });

export const priorConvosQuery = () =>
  queryOptions({
    queryKey: ["prior-convos"],
    queryFn: async () => {
      await sleep(40);
      return PRIOR_CONVOS;
    },
  });

export const alertsQuery = () =>
  queryOptions({
    queryKey: ["alerts"],
    queryFn: async () => {
      await sleep(40);
      return ALERTS;
    },
  });

export const catalogStatsQuery = () =>
  queryOptions({
    queryKey: ["catalog-stats"],
    queryFn: async () => {
      await sleep(20);
      return CATALOG_STATS;
    },
  });
