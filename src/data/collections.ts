import type { DisciplineSlug } from "./disciplines";

export interface CollectionDefinition {
  slug: string;
  name: string;
  description: string;
  query: string;
  disciplines?: readonly DisciplineSlug[];
  regions?: readonly string[];
  keywords?: readonly string[];
}

export const COLLECTIONS = [
  {
    slug: "global-climate-data",
    name: "Global Climate Data",
    description: "Verified records for worldwide climate observations and climate indicators.",
    query: "climate",
    disciplines: ["climate"],
    regions: ["Global"],
    keywords: ["temperature", "precipitation"],
  },
  {
    slug: "china-environmental-data",
    name: "China Environmental Data",
    description: "Verified records covering climate, soil, water, and urban environments in China.",
    query: "China",
    disciplines: ["earth-environmental-science", "climate", "urban-science"],
    regions: ["China"],
    keywords: ["environment", "meteorology", "soil"],
  },
  {
    slug: "global-disease-data",
    name: "Global Disease Data",
    description: "Verified, openly reusable records for disease and health research.",
    query: "disease",
    disciplines: ["medicine-health"],
    keywords: ["health", "epidemiology"],
  },
  {
    slug: "soil-agriculture",
    name: "Soil & Agriculture",
    description: "Verified records for soil properties, soil management, and agricultural yield.",
    query: "soil",
    disciplines: ["agriculture", "earth-environmental-science"],
    keywords: ["soil carbon", "crop yield", "rice"],
  },
  {
    slug: "genomics",
    name: "Genomics",
    description: "Verified records for genome variation across plants, people, and microbes.",
    query: "genomics",
    disciplines: ["biology"],
    keywords: ["genome", "variation", "sequencing"],
  },
] as const satisfies readonly CollectionDefinition[];

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];

export function getCollectionBySlug(slug: string): CollectionDefinition | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}
