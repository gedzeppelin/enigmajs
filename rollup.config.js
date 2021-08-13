// @ts-check
import path from "path";

import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

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
      file: resolve(pkg.unpkg),
      format: "iife",
      name: "EgCore",
      globals: {
        vue: "Vue",
        lodash: "_",
        notyf: "Notyf",
        uuid: "uuid",
        axios: "axios",
      },
    },
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript(),
    terser({
      compress: {
        ecma: 2015,
        pure_getters: true,
        // Fixes errors with inherited class initializations.
        sequences: false,
      },
      safari10: true,
    }),
  ],
};
