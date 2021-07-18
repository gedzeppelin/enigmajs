/* eslint-disable @typescript-eslint/no-var-requires */
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
      file: resolve(pkg.browser),
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
    typescript({
      typescript: require("typescript"),
    }),
    terser(),
  ],
};
