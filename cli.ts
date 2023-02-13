import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { join } from "./deps.ts";
import { generateSitemapXML } from "./gen.ts";

await new Command()
  .name("sitemap")
  .version("1.0.2")
  .description("sitemap generator for Deno")
  .option("-b, --basename <basename:string>", "Base URL", { required: true })
  .option("-r, --root <dir:string>", "Root working directory", { default: "." })
  .option("-o, --out <outfile:string>", "Output file, or - for standard out")
  .action(async ({ basename, root, out }) => {
    const xml = await generateSitemapXML(basename, root);
    if (out === "-") {
      console.log(xml);
    } else {
      await Deno.writeTextFile(out ?? join(root, "sitemap.xml"), xml);
      console.log("Sitemap written to", out);
    }
  })
  .parse(Deno.args);
