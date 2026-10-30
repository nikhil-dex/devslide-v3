// Module resolve hook for the Node test runner.
//
// Application code is written for the Next.js bundler, which resolves
// extensionless specifiers ("./hero", "./components") that plain Node ESM
// does not. This hook adds the same resolution so tests can import the real
// modules without changing application source.
import { pathToFileURL } from "node:url";
import path from "node:path";

// Mirrors the "@/*" -> project-root alias from tsconfig.json.
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = pathToFileURL(path.join(PROJECT_ROOT, specifier.slice(2))).href;
    return resolve(target, context, nextResolve);
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.code === "ERR_UNSUPPORTED_DIR_IMPORT"
    ) {
      for (const suffix of [".js", "/index.js"]) {
        try {
          return await nextResolve(specifier + suffix, context);
        } catch {
          /* try the next suffix */
        }
      }
    }
    throw error;
  }
}
