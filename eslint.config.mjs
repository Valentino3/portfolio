import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Lint the project's own files only: src, tests and the config files at the root. Everything
  // else at the root (build output, reports, dependencies, local folders) is ignored.
  globalIgnores(["*", "!src/", "!tests/", "!*.ts", "!*.mts", "!*.mjs", "next-env.d.ts"]),
]);

export default eslintConfig;
