export interface DisciplineDefinition {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  /** Stable Lucide icon name resolved by the presentation layer. */
  icon: string;
}

export const DISCIPLINES = [
  {
    slug: "earth-environmental-science",
    name: "Earth & Environmental Science",
    shortName: "Earth Science",
    description: "Earth systems, land, water, soils, hazards, and environmental change.",
    icon: "Globe2",
  },
  {
    slug: "climate",
    name: "Climate",
    description: "Weather observations, climate variability, and long-term change.",
    icon: "CloudSun",
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    description: "Crops, food systems, farming environments, and agricultural production.",
    icon: "Sprout",
  },
  {
    slug: "biology",
    name: "Biology",
    description: "Organisms, ecosystems, biodiversity, and biological processes.",
    icon: "Dna",
  },
  {
    slug: "medicine-health",
    name: "Medicine & Health",
    shortName: "Medicine",
    description: "Population health, disease, clinical research, and public health.",
    icon: "HeartPulse",
  },
  {
    slug: "neuroscience",
    name: "Neuroscience",
    description: "Brain imaging, neural signals, cognition, and nervous systems.",
    icon: "Brain",
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    description: "Molecules, reactions, spectra, materials, and chemical properties.",
    icon: "FlaskConical",
  },
  {
    slug: "physics",
    name: "Physics",
    description: "Physical systems, matter, energy, measurements, and materials.",
    icon: "Atom",
  },
  {
    slug: "astronomy",
    name: "Astronomy",
    description: "Sky surveys, stars, galaxies, exoplanets, and the wider universe.",
    icon: "Telescope",
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    description: "Computing systems, algorithms, machine learning, and benchmarks.",
    icon: "Cpu",
  },
  {
    slug: "social-science",
    name: "Social Science",
    description: "People, populations, communities, institutions, and society.",
    icon: "Users",
  },
  {
    slug: "urban-science",
    name: "Urban Science",
    description: "Cities, infrastructure, mobility, air quality, and urban environments.",
    icon: "Building2",
  },
  {
    slug: "ocean-science",
    name: "Ocean Science",
    description: "Marine environments, ocean circulation, chemistry, and ecosystems.",
    icon: "Waves",
  },
] as const satisfies readonly DisciplineDefinition[];

export type DisciplineSlug = (typeof DISCIPLINES)[number]["slug"];

export function getDisciplineBySlug(slug: string): DisciplineDefinition | undefined {
  return DISCIPLINES.find((discipline) => discipline.slug === slug);
}
