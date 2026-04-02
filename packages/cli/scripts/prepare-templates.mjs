import fs from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);

const repoRoot = path.resolve(packageRoot, "../..");
const templatesRoot = path.join(packageRoot, "templates");

const templateSources = [
  "packages/shared/src",
  "packages/ui/src",
  "packages/ai-elements/src",
  "packages/chat-react/src",
  "packages/artifacts/src",
];

async function main() {
  await fs.rm(templatesRoot, { recursive: true, force: true });
  await fs.mkdir(templatesRoot, { recursive: true });

  for (const relativeSource of templateSources) {
    const sourcePath = path.join(repoRoot, relativeSource);
    const targetPath = path.join(templatesRoot, relativeSource);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.cp(sourcePath, targetPath, { recursive: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
