# Sitemap CLI

Deno CLI to create a sitemap from build output.

## Usage

Usage: `deno run https://deno.land/x/sitemap/cli.ts [args]`

Deno CLI to generate a XML sitemap from a local directory.

Options:

```sh
-h, --help                  - Show this help.                                                  
-V, --version               - Show the version number for this program.                        
-b, --basename  <basename>  - Base URL                                   (required)            
-r, --root      <dir>       - Root working directory                     (Default: ".")        
-o, --out       <outfile>   - Output file, or - for standard out                               
-m, --match     <glob>      - Glob patterns to match                     (Default: "**/*.html")
-i, --ignore    <glob>      - Glob patterns to ignore                    (Default: "404.html") 
--clean                     - Strip HTML file extensions                                       
```

Works well together with
[`deno install`](https://deno.land/manual/tools/script_installer).

## Contributions

All contributions are welcome!

Install [Deno](https://deno.land).

### Formatting

```sh
deno fmt
```

### Linting

```sh
deno lint
```

### Typechecks

```sh
deno check *.ts
```

## Credits

- <https://github.com/zerodevx/static-sitemap-cli> for inspiration.
- <https://github.com/dcdunken> for the initial implementation.
