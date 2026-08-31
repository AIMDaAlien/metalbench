import { error } from "@sveltejs/kit";
import { catalog, getHardware } from "$lib/data/catalog.js";
import type { EntryGenerator, PageLoad } from "./$types";
export const entries: EntryGenerator = () =>
  catalog.hardware.map(({ slug }) => ({ slug }));
export const load: PageLoad = ({ params }) => {
  const hardware = getHardware(params.slug);
  if (!hardware) error(404, "Hardware not found");
  return {
    hardware,
    runs: catalog.runs.filter((run) => run.hardwareSlug === params.slug),
  };
};
