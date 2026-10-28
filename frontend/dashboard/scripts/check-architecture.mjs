import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "tests"];
const sourceExtensions = new Set([".ts", ".tsx"]);
const errors = [];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (
      entry.isFile() &&
      sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf(".")))
    )
      files.push(path);
  }
  return files;
}

function pathFor(file) {
  return relative(root, file).replaceAll("\\", "/");
}
function isDashboardTypeHome(path) {
  return (
    path.startsWith("src/services/api/dashboard/") && path.endsWith(".types.ts")
  );
}
function isMapperBoundary(path) {
  return /mapper\.util\.ts$/.test(path);
}
function isExternalContractBoundary(path) {
  return (
    isMapperBoundary(path) ||
    path.startsWith("src/services/api/auth/") ||
    path.startsWith("src/app/api/") ||
    path.startsWith("src/i18n/messages/") ||
    /^src\/services\/api\/.+\.constant\.ts$/.test(path) ||
    /^src\/services\/api\/.+\/schemas\//.test(path) ||
    path.startsWith("src/components/tailgrids/core/") ||
    path.startsWith("tests/")
  );
}

function checkAbsoluteImports(path, code) {
  const imports = code.matchAll(
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
  );
  for (const match of imports) {
    const specifier = match[1];
    if (specifier.startsWith(".") || specifier.startsWith("/"))
      errors.push(
        `${path}: relative or root import '${specifier}' is forbidden; use @/.`,
      );
  }
}

function checkDashboardTypeHome(path, code) {
  if (!isDashboardTypeHome(path)) return;
  const declarations = [
    ...code.matchAll(/^\s*export\s+(?:interface|type)\s+([A-Za-z_$][\w$]*)/gm),
  ];
  if (declarations.length !== 1)
    errors.push(
      `${path}: dashboard type files must declare exactly one exported type or interface.`,
    );
  for (const declaration of declarations) {
    if (declaration[0].includes("interface") && !declaration[1].startsWith("I"))
      errors.push(`${path}: interfaces must start with I.`);
  }
}

function checkCamelCase(path, code) {
  if (isExternalContractBoundary(path)) return;
  const snakeCaseMember =
    /^\s*(?:readonly\s+)?[a-z][A-Za-z0-9]*_[A-Za-z0-9_]*\s*[?:]/gm;
  for (const match of code.matchAll(snakeCaseMember))
    errors.push(`${path}: '${match[0].trim()}' must use camelCase.`);
}

function checkBoundaries(path, code) {
  if (!path.startsWith("src/services/api/") && /\bfetch\s*\(/.test(code))
    errors.push(`${path}: raw fetch belongs only in services/api.`);
  if (/\b(?:axios|Axios)\b/.test(code))
    errors.push(`${path}: axios is prohibited.`);
  if (
    /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/.test(code) &&
    !path.startsWith("src/app/css/")
  )
    errors.push(`${path}: raw colors are prohibited.`);
}

for (const sourceRoot of sourceRoots) {
  for (const file of await walk(join(root, sourceRoot))) {
    const path = pathFor(file);
    const code = await readFile(file, "utf8");
    checkAbsoluteImports(path, code);
    checkDashboardTypeHome(path, code);
    checkCamelCase(path, code);
    checkBoundaries(path, code);
  }
}

if (errors.length > 0) {
  console.error("Dorak architecture violations:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Dorak architecture check passed.");
}
