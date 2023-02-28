import { join, normalize, sep } from "./deps.ts";

/**
 * An object representing an entry in a sitemap
 */
export interface SiteMapEntry {
  /** Location in a <loc> tag of a sitemap */
  loc: string;
  /** Last modification as ISO string in a <lastmod> tag of a sitemap */
  lastmod: string;
}
/**
 * An object representing a sitemap
 */
export type Sitemap = SiteMapEntry[];

/**
 * Generates a sitemap for a given base URL and directory, and converts it to an
 * XML string.
 *
 * @param args Base URL and dist directory
 * @returns Generated XML
 */
export async function generateSitemapXML(
  ...args: Parameters<typeof generateSitemap>
) {
  const sitemap = await generateSitemap(...args);
  return sitemapToXML(sitemap);
}

/**
 * Generates a sitemap for a given base URL and directory, and returns it as a
 * sitemap object.
 *
 * @param basename Base URL
 * @param distDirectory Build output directory
 * @returns Generated sitemap object
 */
export async function generateSitemap(
  basename: string,
  distDirectory: string,
) {
  const sitemap: Sitemap = [];

  async function addDirectory(directory: string) {
    for await (const entry of Deno.readDir(directory)) {
      const path = join(directory, entry.name);
      if (entry.isDirectory) {
        await addDirectory(path);
      } else if (entry.isFile) {
        const { mtime } = await Deno.stat(path);
        const relPath = distDirectory === "." ? path : path.substring(distDirectory.length);
        const pathname = normalize(`/${relPath}`).split(sep).join("/");
        sitemap.push({
          loc: basename + pathname,
          lastmod: (mtime ?? new Date()).toISOString(),
        });
      } else {
        // ignore symlinks etc
      }
    }
  }

  await addDirectory(distDirectory);
  return sitemap.sort(({ loc: l0 }, { loc: l1 }) => l0.localeCompare(l1));
}

/**
 * Converts a sitemap to XML.
 *
 * @param sitemap A sitemap object
 * @returns The generated XML string
 */
export function sitemapToXML(sitemap: Sitemap) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
    sitemap
      .map(
        ({ loc, lastmod }) => `
    <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
    </url>`,
      )
      .join("\n")
  }
</urlset>
`;
}
