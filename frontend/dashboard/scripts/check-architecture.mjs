import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const sourceExtensions = new Set(['.ts', '.tsx']);
const approvedFeatureDirectories = new Set([
  'api',
  'components',
  'enums',
  'hooks',
  'schemas',
  'types',
]);
const approvedComponentDirectories = new Set(['buttons', 'cards', 'dialogs', 'forms', 'tables']);
const domainNamingPrefix = 'src/shared/entities/domain/';
const domainNamingExemptions = new Set([
  `${domainNamingPrefix}branch-wire.ts`,
  `${domainNamingPrefix}booking-wire.ts`,
  `${domainNamingPrefix}chair-wire.ts`,
  `${domainNamingPrefix}service-wire.ts`,
  `${domainNamingPrefix}stylist-wire.ts`,
]);
const snakeCaseTypeMember = /^\s*(?:readonly\s+)?[a-z][A-Za-z0-9]*_[A-Za-z0-9_]*\s*[?:]/gm;
const snakeCaseObjectKey = /^\s*'?[a-z][A-Za-z0-9]*_[A-Za-z0-9_]*'?\s*:/gm;
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (entry.isFile() && sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf('.'))))
      files.push(path);
  }

  return files;
}

function isApiModule(file) {
  const normalized = file.split(sep).join('/');
  return (
    normalized.includes('/src/shared/api/') || /\/src\/features\/[^/]+\/api\//.test(normalized)
  );
}

function checkFeatureDirectories(entries) {
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!approvedFeatureDirectories.has(entry.name)) {
      errors.push(
        `features may not contain '${entry.name}'; use an approved responsibility directory.`,
      );
    }
  }
}

async function checkStructure() {
  const featuresPath = join(root, 'src', 'features');
  try {
    const features = await readdir(featuresPath, { withFileTypes: true });
    for (const feature of features) {
      if (!feature.isDirectory()) {
        errors.push(`src/features/${feature.name} must be a feature directory.`);
        continue;
      }

      const featurePath = join(featuresPath, feature.name);
      const entries = await readdir(featurePath, { withFileTypes: true });
      checkFeatureDirectories(entries);
      const componentsPath = join(featurePath, 'components');
      try {
        const components = await readdir(componentsPath, { withFileTypes: true });
        for (const component of components) {
          if (!component.isDirectory() || !approvedComponentDirectories.has(component.name)) {
            errors.push(
              `src/features/${feature.name}/components/${component.name} must be a categorized component directory.`,
            );
          }
        }
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

function checkFile(file, source) {
  const path = relative(root, file).split(sep).join('/');
  const isPage = /^app\/.+\/page\.tsx$/.test(path) || path === 'app/page.tsx';
  const isComponent = path.includes('/components/');

  if (isPage && /^\s*['\"]use client['\"];?/m.test(source)) {
    errors.push(
      `${path}: route pages must remain server components; move interactivity to a child component.`,
    );
  }
  if (!isApiModule(file) && /\bfetch\s*\(/.test(source)) {
    errors.push(`${path}: raw fetch is allowed only in shared/feature API modules.`);
  }
  if (/\b(?:axios|Axios)\b/.test(source)) {
    errors.push(`${path}: axios is prohibited; use the typed shared API client.`);
  }
  if (/catch\s*\([^)]*\)\s*\{\s*\}/s.test(source)) {
    errors.push(`${path}: empty catch blocks are prohibited.`);
  }
  const isThemeDefinition = path === 'tailwind.config.ts' || path.startsWith('src/shared/theme/');
  if (
    !isThemeDefinition &&
    (/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/.test(source) ||
      /(?:bg|text|border|ring|fill|stroke)-\[#[^\]]+\]/.test(source))
  ) {
    errors.push(`${path}: raw or arbitrary colors are prohibited; use semantic design tokens.`);
  }
  if (/useEffect\s*\([\s\S]{0,700}?router\.(?:push|replace)\s*\(/.test(source)) {
    errors.push(`${path}: client-side authorization redirects are prohibited; use middleware.ts.`);
  }
  if (isComponent && /from\s+['\"]@\/features\/[^'\"]+\/api\//.test(source)) {
    errors.push(`${path}: UI components must consume hooks, not feature API modules.`);
  }
  checkDomainNaming(path, source);
}

/**
 * Domain records are camelCase end to end; snake_case is confined to the wire
 * translation module that talks to the backend. Both patterns are anchored to
 * key position so string values and import paths can never match.
 */
function checkDomainNaming(path, source) {
  if (!path.startsWith(domainNamingPrefix) || domainNamingExemptions.has(path)) {
    return;
  }

  for (const match of source.matchAll(snakeCaseTypeMember)) {
    errors.push(`${path}: '${match[0].trim()}' must be camelCase; domain records use camelCase.`);
  }
  for (const match of source.matchAll(snakeCaseObjectKey)) {
    errors.push(`${path}: '${match[0].trim()}' must be camelCase; domain records use camelCase.`);
  }
}

await checkStructure();
for (const file of await walk(root)) {
  checkFile(file, await readFile(file, 'utf8'));
}

if (errors.length > 0) {
  console.error('Dashboard architecture violations:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Dashboard architecture check passed.');
}
