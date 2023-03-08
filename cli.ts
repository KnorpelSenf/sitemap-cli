import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { join } from "./deps.ts";
import { generateSitemapXML } from "./gen.ts";

await new Command()
  .name("sitemap")
  .version("1.0.3")
  .description("sitemap generator for Deno")
  .option("-b, --basename <basename:string>", "Base URL", { required: true })
  .option("-r, --root <dir:string>", "Root working directory", { default: "." })
  .option("-o, --out <outfile:string>", "Output file, or - for standard out")
  .action(async ({ basename, root, out }) => {
    const xml = await generateSitemapXML(basename, root);
    if (out === "-") {
      console.log(xml);
    } else {
      out ??= join(root, "sitemap.xml");
      await Deno.writeTextFile(out, xml);
      console.log(`Sitemap written to %c${out}`, "color: blue");
    }
  })
  .parse(Deno.args);
