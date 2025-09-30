/**
 * This module contains the CLI itself. You can run it with
 *
 * ```sh
 * deno run jsr:@knorpelsenf/sitemap/cli
 * ```
 *
 * but not use it programmatically as there are no exported members.
 *
 * @module
 */
import { Command } from "@cliffy/command";
import { join } from "@std/path";
import { generateSitemap, sitemapToXML } from "./gen.ts";

await new Command()
  .name("sitemap")
  .version("1.2.4")
  .description("sitemap generator for Deno")
  .option("-b, --basename <basename:string>", "Base URL", { required: true })
  .option("-r, --root <dir:string>", "Root working directory", { default: "." })
  .option("-o, --out <outfile:string>", "Output file, or - for standard out")
  .option("-m --match <glob:string>", "Glob patterns to match", {
    default: "**/*.html",
  })
  .option("-i, --ignore <glob:string>", "Glob patterns to ignore", {
    default: "404.html",
  })
  .option("--clean", "Strip HTML file extensions")
  .action(async ({ basename, root, out, match, ignore, clean }) => {
    const sitemap = await generateSitemap(basename, root, {
      include: match,
      exclude: ignore,
      clean,
    });
    const xml = sitemapToXML(sitemap);
    if (out === "-") {
      console.log(xml);
    } else {
      out ??= join(root, "sitemap.xml");
      await Deno.writeTextFile(out, xml);
      console.log(
        `Sitemap with ${sitemap.length} entries written to %c${out}`,
        "color: blue",
      );
    }
  })
  .parse(Deno.args);
