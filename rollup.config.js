// @ts-check
import path from "path";

import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import { when, format } from "rollup-plugin-by-output";

if (!process.env.TARGET) {
  throw new Error("TARGET package must be specified via --environment flag.");
}

//const masterVersion = require('./package.json').version;
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);

const resolve = (p) => path.resolve(packageDir, p);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(resolve(`package.json`));
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
        include: ["packages/enigmajs-core/src"],
      },
    }),
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
