#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { getSlice } from "../src/registry/runtime.js";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const repoRoot = path.resolve(packageRoot, "../..");

const aliasTargets = {
  "@chatkit/shared": "components/chatkit/shared",
  "@chatkit/ui": "components/chatkit/ui",
  "@chatkit/ai-elements": "components/chatkit/ai-elements",
};

async function main() {
  const args = process.argv.slice(2);

  if (args[0] !== "add" || !args[1]) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const targetDir = getOption(args, "--cwd") || process.cwd();
  const command = args[1];
  const positionalArgs = args.filter((value, index) => {
    if (index < 2) return false;
    if (args[index - 1] === "--cwd") return false;
    if (value === "--cwd") return false;
    return true;
  });

  const result = resolveInstallRequest(command, positionalArgs);

  if (!result) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const { displayName, resolvedSliceNames } = result;

  if (!resolvedSliceNames.length) {
    console.error(`Unknown install target: ${command} ${positionalArgs.join(" ")}`.trim());
    process.exitCode = 1;
    return;
  }

  const copiedFiles = [];

  for (const currentSliceName of resolvedSliceNames) {
    const slice = getSlice(currentSliceName);
    if (!slice) continue;

    for (const entry of slice.files) {
      const sourcePath = await resolveSourcePath(entry.source);
      const targetPath = path.join(targetDir, entry.target);
      const stats = await fs.stat(sourcePath);

      if (stats.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        const files = await listFiles(sourcePath);
        for (const file of files) {
          const relative = path.relative(sourcePath, file);
          const destination = path.join(targetPath, relative);
          await fs.mkdir(path.dirname(destination), { recursive: true });
          await fs.copyFile(file, destination);
          copiedFiles.push(destination);
        }
      } else {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.copyFile(sourcePath, targetPath);
        copiedFiles.push(targetPath);
      }
    }
  }

  await rewriteInternalImports(copiedFiles, targetDir);
  await mergePackageJson(targetDir, resolvedSliceNames);

  console.log(
    `Installed ${displayName} into ${path.relative(process.cwd(), targetDir) || "."}`
  );
  console.log(`Included slices: ${resolvedSliceNames.join(", ")}`);
}

function printUsage() {
  console.log("Usage:");
  console.log("  chatkit add artifact <name> [--cwd <path>]");
  console.log("  chatkit add chat [header] [input] [messages] [sidebar] [--cwd <path>]");
}

function getOption(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function resolveIncludes(rootName) {
  const visited = new Set();
  const ordered = [];

  function visit(name) {
    if (visited.has(name)) return;
    const slice = getSlice(name);
    if (!slice) return;
    visited.add(name);
    for (const include of slice.includes || []) {
      visit(include);
    }
    ordered.push(name);
  }

  visit(rootName);
  return ordered;
}

function resolveInstallRequest(command, positionalArgs) {
  if (command === "artifact" && positionalArgs[0]) {
    const sliceName = `artifact-${positionalArgs[0]}`;
    return {
      displayName: sliceName,
      resolvedSliceNames: resolveIncludes(sliceName),
    };
  }

  if (command === "chat") {
    if (positionalArgs.length === 0) {
      return {
        displayName: "chat",
        resolvedSliceNames: resolveIncludes("chat"),
      };
    }

    const uniqueParts = [...new Set(positionalArgs)];
    const resolvedSliceNames = [
      ...new Set(
        uniqueParts.flatMap((part) => {
          const sliceName = part === "all" ? "chat" : `chat-${part}`;
          return resolveIncludes(sliceName);
        })
      ),
    ];

    return {
      displayName: `chat ${uniqueParts.join(" ")}`.trim(),
      resolvedSliceNames,
    };
  }

  return null;
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function resolveSourcePath(source) {
  const packagedSourcePath = path.join(packageRoot, "templates", source);

  try {
    await fs.stat(packagedSourcePath);
    return packagedSourcePath;
  } catch {}

  return path.join(repoRoot, source);
}

async function rewriteInternalImports(files, targetDir) {
  for (const file of files) {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue;

    let content = await fs.readFile(file, "utf8");
    let updated = content;

    for (const [alias, relativeTarget] of Object.entries(aliasTargets)) {
      const absoluteTarget = path.join(targetDir, relativeTarget);
      const fileDir = path.dirname(file);
      let replacement = path.relative(fileDir, absoluteTarget).replaceAll(path.sep, "/");
      if (!replacement.startsWith(".")) {
        replacement = `./${replacement}`;
      }

      updated = updated
        .replaceAll(`"${alias}"`, `"${replacement}"`)
        .replaceAll(`'${alias}'`, `'${replacement}'`);
    }

    if (updated !== content) {
      await fs.writeFile(file, updated);
    }
  }
}

async function mergePackageJson(targetDir, sliceNames) {
  const packageJsonPath = path.join(targetDir, "package.json");
  let packageJson;

  try {
    packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  } catch {
    throw new Error(`Could not read package.json in ${targetDir}`);
  }

  packageJson.dependencies ||= {};
  packageJson.peerDependencies ||= {};
  packageJson.devDependencies ||= {};

  for (const sliceName of sliceNames) {
    const slice = getSlice(sliceName);
    if (!slice) continue;

    for (const [name, version] of Object.entries(slice.dependencies || {})) {
      if (!(name in packageJson.dependencies) && !(name in packageJson.devDependencies)) {
        packageJson.dependencies[name] = version;
      }
    }

    for (const [name, version] of Object.entries(slice.peerDependencies || {})) {
      if (
        !(name in packageJson.dependencies) &&
        !(name in packageJson.devDependencies) &&
        !(name in packageJson.peerDependencies)
      ) {
        packageJson.peerDependencies[name] = version;
      }
    }
  }

  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
