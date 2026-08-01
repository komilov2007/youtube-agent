import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const workspace = resolve(process.cwd());
const buildDirectory = resolve(workspace, ".next");

if (
  buildDirectory !== `${workspace}\\.next` &&
  buildDirectory !== `${workspace}/.next`
) {
  throw new Error(
    "Refusing to clear an unexpected end-to-end build directory.",
  );
}

await rm(buildDirectory, {
  recursive: true,
  force: true,
  maxRetries: 3,
  retryDelay: 200,
});

console.info("Cleared the generated Next.js output before end-to-end tests.");
