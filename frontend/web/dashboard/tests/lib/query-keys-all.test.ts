import { describe, expect, it } from "vitest";

type Key = readonly unknown[];
type Factory = Record<string, Key | ((...args: string[]) => Key)>;

const modules = import.meta.glob<Record<string, unknown>>("/src/lib/query-keys/**/*-keys.ts", { eager: true });

function factories(): { file: string; name: string; keys: Factory }[] {
  const found: { file: string; name: string; keys: Factory }[] = [];
  for (const [file, exported] of Object.entries(modules)) {
    for (const [name, value] of Object.entries(exported)) {
      if (typeof value === "object" && value !== null && "all" in value) found.push({ file, name, keys: value as Factory });
    }
  }
  return found;
}

/** Builders that take a filters object cannot be called with strings; those are skipped (`undefined`). */
function resolve(key: Key | ((...args: string[]) => Key)): Key | undefined {
  if (typeof key !== "function") return key;
  try {
    return key(...Array.from({ length: key.length }, (_, index) => `arg${index}`));
  } catch {
    return undefined;
  }
}

describe("every module's query keys", () => {
  const all = factories();

  it("finds the key factories", () => {
    expect(all.length).toBeGreaterThanOrEqual(30);
  });

  it("starts every key with the module root, so invalidating `all` reaches it", () => {
    for (const { file, name, keys } of all) {
      const root = (keys.all as Key)[0];
      for (const [keyName, key] of Object.entries(keys)) {
        const resolved = resolve(key);
        // A single-segment key is a deliberate separate root (`serviceKeys.currencies`, `.categories`).
        if (resolved && resolved.length > 1) expect(resolved[0], `${file} ${name}.${keyName}`).toBe(root);
      }
    }
  });

  it("gives each key factory its own root", () => {
    const roots = all.map(({ keys }) => String((keys.all as Key)[0]));
    const duplicated = roots.filter((root, index) => roots.indexOf(root) !== index);
    expect(duplicated).toEqual([]);
  });
});
