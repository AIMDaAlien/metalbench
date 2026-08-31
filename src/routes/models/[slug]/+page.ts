import { error } from "@sveltejs/kit";
import { catalog, getModel } from "$lib/data/catalog.js";
import type { EntryGenerator, PageLoad } from "./$types";
export const entries: EntryGenerator = () =>
  catalog.models.map(({ slug }) => ({ slug }));
export const load: PageLoad = ({ params }) => {
  const model = getModel(params.slug);
  if (!model) error(404, "Model not found");
  return {
    model,
    runs: catalog.runs.filter((run) => run.modelSlug === params.slug),
    siblings: catalog.models.filter((item) => item.familySlug === model.familySlug && item.slug !== model.slug),
    useCases: catalog.useCases.filter((item) => item.winnerModelSlug === model.slug || item.runnerUpModelSlug === model.slug),
  };
};
