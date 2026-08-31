// @ts-nocheck
import data from "./catalog.json" with { type: "json" };
import { assertValidCatalog } from "./validator.js";

export const catalog = assertValidCatalog(data);
export const getModel = (slug) =>
  catalog.models.find((item) => item.slug === slug);
export const getHardware = (slug) =>
  catalog.hardware.find((item) => item.slug === slug);
export const getRun = (id) => catalog.runs.find((item) => item.id === id);
export const getFinding = (slug) =>
  catalog.findings.find((item) => item.slug === slug);
export const modelName = (slug) => getModel(slug)?.name || slug;
export const hardwareName = (slug) => getHardware(slug)?.name || slug;
