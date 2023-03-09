import { globToRegExp, join, normalize, sep } from "./deps/std.ts";

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
 * Options for generating a sitemap.
 */
export interface SiteMapOptions {
  /** Glob pattern for files to include, overwritten by `exclude` */
  include?: string;
  /** Glob pattern for files to exclude, overwrites `include` */
  exclude?: string;
  /** Strip HTML file extensions */
  clean?: boolean;
}

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
  options: SiteMapOptions = {},
) {
  const sitemap: Sitemap = [];
  const include = options.include && globToRegExp(options.include);
  const exclude = options.exclude && globToRegExp(options.exclude);
  const skip: (path: string) => boolean = include
    ? exclude
      ? (path) => exclude.test(path) || !include.test(path)
      : (path) => !include.test(path)
    : exclude
    ? (path) => exclude.test(path)
    : () => false;

  async function addDirectory(directory: string) {
    for await (const path of stableRecurseFiles(directory)) {
      if (skip(path)) continue;
      const { mtime } = await Deno.stat(path);
      const relPath = distDirectory === "."
        ? path
        : path.substring(distDirectory.length);
      let pathname = normalize(`/${relPath}`).split(sep).join("/");
      if (options.clean && pathname.endsWith(".html")) {
        pathname = pathname.substring(0, pathname.length - ".html".length);
      }
      sitemap.push({
        loc: basename + pathname,
        lastmod: (mtime ?? new Date()).toISOString(),
      });
    }
  }

  await addDirectory(distDirectory);
  return sitemap;
}

async function* stableRecurseFiles(
  directory: string,
): AsyncGenerator<string> {
  // collect all entries
  const itr = Deno.readDir(directory);
  const files: Deno.DirEntry[] = [];
  for await (const entry of itr) {
    files.push(entry);
  }
  // sort them alphabetically with index.html first
  const sorted = files.sort(({ name: n0 }, { name: n1 }) => {
    if (n0 === "index.html") return -1;
    else if (n1 === "index.html") return 1;
    else return n0.localeCompare(n1);
  });
  // yield them recursively
  for (const entry of sorted) {
    const path = join(directory, entry.name);
    if (entry.isFile) {
      yield path;
    } else if (entry.isDirectory) {
      yield* stableRecurseFiles(path);
    } else {
      // ignore symlinks
    }
  }
}

/**
 * Converts a sitemap to XML.
 *
 * @param sitemap A sitemap object
 * @returns The generated XML string
 */
export function sitemapToXML(sitemap: Sitemap) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${
    sitemap
      .map(
        ({ loc, lastmod }) =>
          `    <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
    </url>`,
      )
      .join("\n")
  }
</urlset>
`;
}
