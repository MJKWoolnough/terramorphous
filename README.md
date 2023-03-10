<p align="center"><img src="src/icon.svg" style="width: 5em" /></p>
<h1><p align="center">Terramorphous</p></h1>

This project uses the [WorldTimeAPI](https://worldtimeapi.org) to view clocks from around the world.

The [`index.html`](index.html) file contains the compiled SPA, and can be used standalone.

## Compilation

The `index.html` can be compiled from the source with the following steps:

1. Use [TypeScript](https://github.com/microsoft/TypeScript/) to compile the source code to Javascript.
2. Run the `compile.sh` Bash script, which relies on the following non-standard commands:
   - [JSPacker](https://github.com/MJKWoolnough/jspacker), which combines all of the javascript code together.
   - [Terser](https://github.com/terser/terser), which minifies the javascript.
