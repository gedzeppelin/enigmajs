// @ts-check
import path from "path";

import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import vue from "rollup-plugin-vue";
import { terser } from "rollup-plugin-terser";
import { when, format } from "rollup-plugin-by-output";

const target = process.env.TARGET;

if (!target) {
  throw new Error("TARGET package must be specified via --environment flag.");
}

//const masterVersion = require('./package.json').version;
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, target);

const resolve = (p) => path.resolve(packageDir, p);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(resolve("package.json"));
//const packageOptions = pkg.buildOptions || {};
//const name = packageOptions.filename || path.basename(packageDir);

export default {
  input: resolve("src/index.ts"),
  output: [
    {
      file: resolve(pkg.main),
      format: "cjs",
    },
    {
      file: resolve(pkg.module),
      format: "es",
    },
    {
      file: resolve(pkg.unpkg || pkg.jsdelivr || pkg.global),
      format: "iife",
      name: "EgCore",
      globals: {
        lodash: "_",
        notyf: "Notyf",
        axios: "axios",
      },
    },
  ],
  external: Object.keys(pkg.dependencies),
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          rootDir: resolve("src"),
          outDir: resolve("dist"),
          declaration: true,
        },
        include: ["packages/enigmajs-core/src", "packages/enigmajs-ui/src"],
      },
    }),
    vue({
      target: "browser",
      preprocessStyles: true,
      templatePreprocessOptions: {
        pug: { doctype: "html" },
      },
    }),
    postcss(),
    json(),
    when(
      format("iife"),
      terser({
        compress: {
          ecma: 2015,
          pure_getters: true,
          // Fixes errors with inherited class initializations.
          sequences: false,
        },
        safari10: true,
      })
    ),
  ],
};
