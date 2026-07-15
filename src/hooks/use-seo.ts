import { useEffect } from "react";

export const SITE_URL = "https://mislataenfestes.es";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoOptions {
  title: string;
  description: string;
  /** Ruta absoluta desde la raíz, ej. "/", "/about", "/evento/fp001" */
  path: string;
  image?: string;
  /** Si es true, añade meta robots noindex (para páginas que no deben indexarse) */
  noindex?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/**
 * Actualiza title, description, canonical y etiquetas Open Graph/Twitter por ruta.
 * Funciona en cliente (Google renderiza JS). Para previsualizaciones sociales
 * de crawlers sin JS, index.html mantiene metadatos por defecto.
 */
export function useSeo({ title, description, path, image = DEFAULT_OG_IMAGE, noindex = false }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    if (noindex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      removeMeta("name", "robots");
    }
  }, [title, description, path, image, noindex]);
}
