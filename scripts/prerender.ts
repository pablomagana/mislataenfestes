import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Critters from "critters";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.resolve(root, "dist/public");

// Import the SSR render function from the compiled server entry
const { render } = await import(path.resolve(root, "dist/server/entry-server.js"));

// Import events data for route generation and SEO
const eventsFile = path.resolve(root, "src/data/events.json");
const events: Array<{
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  type: string;
  category: string;
  organizer: string;
}> = JSON.parse(fs.readFileSync(eventsFile, "utf-8"));

const SITE_URL = "https://mislataenfestes.es";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// Read the built index.html as template
const template = fs.readFileSync(path.resolve(distDir, "index.html"), "utf-8");

interface SeoData {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  jsonLd?: string;
}

function getSeoForRoute(routePath: string): SeoData {
  // Event detail pages
  const eventMatch = routePath.match(/^\/evento\/(.+)$/);
  if (eventMatch) {
    const event = events.find((e) => e.id === eventMatch[1]);
    if (event) {
      const title = `${event.name} · Fiestas de Mislata 2026`;
      const desc = `${event.name} — ${event.date} a las ${event.time} en ${event.location}, Mislata. ${event.description || "Consulta el programa de las Fiestas de Mislata 2026."}`;
      const eventUrl = `${SITE_URL}/evento/${event.id}`;
      const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": event.type === "concierto" || event.type === "música" ? "MusicEvent" : "Event",
        name: event.name,
        startDate: `${event.date}T${event.time}:00+02:00`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: event.location,
          address: { "@type": "PostalAddress", addressLocality: "Mislata", addressRegion: "Valencia", addressCountry: "ES" },
        },
        description: event.description || `${event.name} en las Fiestas de Mislata 2026`,
        organizer: { "@type": "Organization", name: event.organizer, url: SITE_URL },
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock", url: eventUrl },
        url: eventUrl,
        isAccessibleForFree: true,
        image: OG_IMAGE,
      });
      return { title, description: desc, canonical: eventUrl, ogTitle: title, ogDescription: desc, jsonLd };
    }
  }

  if (routePath === "/about") {
    return {
      title: "Programa Fiestas de Mislata 2026 · Patronales y Populares",
      description: "Guía de las Fiestas de Mislata 2026: música en directo, orquestas, mascletàs, Entrada Mora, procesiones, correfoc y actividades familiares del 23 de agosto al 6 de septiembre.",
      canonical: `${SITE_URL}/about`,
      ogTitle: "Programa Fiestas de Mislata 2026 · Patronales y Populares",
      ogDescription: "Guía de las Fiestas de Mislata 2026: música en directo, orquestas, mascletàs, procesiones y actividades familiares.",
    };
  }

  // Home (default)
  return {
    title: "Fiestas de Mislata 2026 · Conciertos Fangoria, Celtas Cortos, Dorian | Programa completo",
    description: "Conciertos y programa de las Fiestas de Mislata 2026: Fangoria, Celtas Cortos, Dorian, Zulú, orquestas y más. Del 20 de agosto al 6 de septiembre. Todos los eventos gratuitos.",
    canonical: SITE_URL,
    ogTitle: "Fiestas de Mislata 2026 · Conciertos: Fangoria, Celtas Cortos, Dorian",
    ogDescription: "Programa completo de las Fiestas de Mislata 2026. Conciertos de Fangoria, Celtas Cortos, Dorian, Zulú, orquestas y más. Del 20 de agosto al 6 de septiembre. Gratis.",
  };
}

function injectSeo(html: string, seo: SeoData): string {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*"/, `$1${seo.description}"`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*"/, `$1${seo.canonical}"`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*"/, `$1${seo.ogTitle}"`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${seo.ogDescription}"`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*"/, `$1${seo.canonical}"`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*"/, `$1${seo.ogTitle}"`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*"/, `$1${seo.ogDescription}"`);
  html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*"/, `$1${OG_IMAGE}"`);
  html = html.replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*"/, `$1${seo.ogTitle}"`);
  html = html.replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*"/, `$1${OG_IMAGE}"`);
  html = html.replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*"/, `$1${seo.ogTitle}"`);

  // For event pages, replace the JSON-LD blocks with the event-specific one
  if (seo.jsonLd) {
    // Remove the generic concert JSON-LD graph (keep the main Festival event)
    html = html.replace(/\s*<!-- Conciertos y eventos musicales individuales -->[\s\S]*?<\/script>/, "");
    // Insert event-specific JSON-LD before </head>
    html = html.replace("</head>", `    <script type="application/ld+json">${seo.jsonLd}</script>\n  </head>`);
  }

  return html;
}

function renderRoute(routePath: string): void {
  const appHtml = render(routePath);
  const seo = getSeoForRoute(routePath);

  let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  html = injectSeo(html, seo);

  // Determine output file path
  let outFile: string;
  if (routePath === "/") {
    outFile = path.resolve(distDir, "index.html");
  } else {
    // /about -> dist/public/about/index.html
    const dir = path.resolve(distDir, routePath.slice(1));
    fs.mkdirSync(dir, { recursive: true });
    outFile = path.resolve(dir, "index.html");
  }

  fs.writeFileSync(outFile, html);
}

// Generate all routes
const routes = [
  "/",
  "/about",
  ...events.map((e) => `/evento/${e.id}`),
];

console.log(`Prerendering ${routes.length} pages...`);
for (const route of routes) {
  renderRoute(route);
}

// Inline critical CSS for faster FCP
const critters = new Critters({
  path: distDir,
  preload: "media",      // defer full CSS with media="print" onload="this.media='all'"
  inlineFonts: false,     // don't inline Google Fonts
  pruneSource: false,     // keep original CSS file intact for other pages
});

console.log("Inlining critical CSS...");
for (const route of routes) {
  const filePath = route === "/"
    ? path.resolve(distDir, "index.html")
    : path.resolve(distDir, route.slice(1), "index.html");

  const html = fs.readFileSync(filePath, "utf-8");
  const optimized = await critters.process(html);
  fs.writeFileSync(filePath, optimized);
}

console.log(`Done! ${routes.length} pages written to ${distDir}`);
