// Installs the extensionless-import resolver for the Node test runner.
import { register } from "node:module";
register(new URL("./resolve-extensionless.mjs", import.meta.url));
