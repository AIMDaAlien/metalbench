import { error } from "@sveltejs/kit";
import { catalog, getRun, getModel, getHardware } from "$lib/data/catalog.js";
import type { EntryGenerator, PageLoad } from "./$types";
export const entries: EntryGenerator = () =>
  catalog.runs.map(({ id }) => ({ id }));
export const load: PageLoad = ({ params }) => {
  const run = getRun(params.id);
  if (!run) error(404, "Run not found");
  const model = getModel(run.modelSlug);
  const hardware = getHardware(run.hardwareSlug);
  const benchmark = catalog.benchmarks.find(
    (item) => item.slug === run.benchmarkSlug,
  );
  if (!model || !hardware || !benchmark)
    error(500, "Run references invalid catalog data");
  return { run, model, hardware, benchmark };
};
