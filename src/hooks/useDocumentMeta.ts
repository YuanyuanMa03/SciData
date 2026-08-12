import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description: string;
  type?: "website" | "article";
}

function getOrCreateMeta(selector: string, attributes: Record<string, string>) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    return { element: existing, created: false };
  }

  const element = document.createElement("meta");
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  document.head.appendChild(element);

  return { element, created: true };
}

/**
 * Keeps the Vite SPA's document and Open Graph metadata in sync with the
 * active route. The previous values are restored when the page unmounts.
 */
export function useDocumentMeta({
  title,
  description,
  type = "website",
}: DocumentMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    const metadata = [
      getOrCreateMeta('meta[name="description"]', { name: "description" }),
      getOrCreateMeta('meta[property="og:title"]', { property: "og:title" }),
      getOrCreateMeta('meta[property="og:description"]', {
        property: "og:description",
      }),
      getOrCreateMeta('meta[property="og:type"]', { property: "og:type" }),
    ] as const;
    const previousContent = metadata.map(({ element }) =>
      element.getAttribute("content"),
    );

    document.title = title;
    metadata[0].element.setAttribute("content", description);
    metadata[1].element.setAttribute("content", title);
    metadata[2].element.setAttribute("content", description);
    metadata[3].element.setAttribute("content", type);

    return () => {
      document.title = previousTitle;

      metadata.forEach(({ element, created }, index) => {
        if (created) {
          element.remove();
          return;
        }

        const content = previousContent[index];
        if (content === null) {
          element.removeAttribute("content");
        } else {
          element.setAttribute("content", content);
        }
      });
    };
  }, [description, title, type]);
}
