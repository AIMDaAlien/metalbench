import { error } from "@sveltejs/kit";
import { catalog, getFinding, getRun } from "$lib/data/catalog.js";
import type { EntryGenerator, PageLoad } from "./$types";
export const entries: EntryGenerator = () =>
  catalog.findings.map(({ slug }) => ({ slug }));
export const load: PageLoad = ({ params }) => {
  const finding = getFinding(params.slug);
  if (!finding) error(404, "Finding not found");
  return {
    finding,
    runs: finding.runIds.map(getRun).filter((run) => run !== undefined),
  };
};
