export const DEFAULT_LOCALE = "en" as const;

export const messages = {
  en: {
    navigation: {
      explore: "Explore",
      disciplines: "Disciplines",
      collections: "Collections",
      about: "About",
    },
    product: {
      subtitle: "Discover scientific datasets across disciplines.",
    },
    home: {
      title: "Find the data behind science.",
      description:
        "Explore source-verified open datasets linked from Nature Portfolio research articles across climate, health, biology, agriculture and more.",
      searchPlaceholder: "Search datasets, variables, regions, topics...",
      popularLabel: "Popular searches:",
      popularSearches: [
        "Global climate",
        "Soil carbon",
        "Disease",
        "Crop yield",
        "Genomics",
      ],
      disciplinesTitle: "Scientific Disciplines",
      featuredTitle: "Featured Datasets",
      viewAll: "View all",
    },
    explore: {
      title: "Explore datasets",
      searchPlaceholder: "Search datasets...",
      sortLabel: "Sort by",
    },
  },
} as const;

export type SupportedLocale = keyof typeof messages;

export function getMessages(locale: SupportedLocale = DEFAULT_LOCALE) {
  return messages[locale];
}
