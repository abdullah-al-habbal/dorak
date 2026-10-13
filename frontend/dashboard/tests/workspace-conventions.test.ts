import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Guards workspace conventions: tests/x/y.test.ts must test src/x/y.ts(x), src/ holds no test artefacts,
// every module specifier (static, dynamic, require, vi.mock, CSS @import) uses the @/ alias, and src/
// follows the file taxonomy (*.enum.ts, *.constant.ts, *.types.ts, use-*.ts hooks, *.util.ts).
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SELF = "workspace-conventions.test.ts";
const SOURCE_FILE = /\.(tsx?|css)$/;
const RELATIVE_SPECIFIER =
  /(?:\bfrom|\bimport|\brequire\(|\bmock\(|@import)\s*\(?\s*["']\.\.?\//;
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const TEST_DIR = /(^|\/)(__tests__|__mocks__|__fixtures__|fixtures)(\/|$)/;
// Vendored design-system primitives and ambient declarations are exempt from the taxonomy.
const TAXONOMY_EXEMPT = /^components\/tailgrids\/|\.d\.ts$/;
const CODE_FILE = /\.tsx?$/;

function listFiles(dir: string): string[] {
  return readdirSync(`${ROOT}${dir}`, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      `${entry.parentPath.slice(`${ROOT}${dir}/`.length)}/${entry.name}`.replace(
        /^\//,
        "",
      ),
    );
}

describe("workspace conventions", () => {
  it("removes the manager branch creation route", () => {
    expect(
      existsSync(`${ROOT}src/app/(portals)/manager/branches/create/page.tsx`),
    ).toBe(false);
  });

  it("keeps src/ free of test files and test folders", () => {
    expect(
      listFiles("src").filter(
        (file) => TEST_FILE.test(file) || TEST_DIR.test(file),
      ),
    ).toEqual([]);
  });

  it("maps every test file to an existing src/ module", () => {
    const orphans = listFiles("tests")
      .filter((file) => file !== SELF)
      .filter((file) => {
        const base = file.replace(TEST_FILE, "");
        return (
          !TEST_FILE.test(file) ||
          ![".ts", ".tsx"].some((ext) => existsSync(`${ROOT}src/${base}${ext}`))
        );
      });
    expect(orphans).toEqual([]);
  });

  it("uses the @/ alias for every module specifier in src/ and tests/", () => {
    const offenders = ["src", "tests"].flatMap((dir) =>
      listFiles(dir)
        .filter((file) => SOURCE_FILE.test(file))
        .filter((file) =>
          RELATIVE_SPECIFIER.test(
            readFileSync(`${ROOT}${dir}/${file}`, "utf8"),
          ),
        )
        .map((file) => `${dir}/${file}`),
    );
    expect(offenders).toEqual([]);
  });

  describe("file taxonomy", () => {
    const sources = listFiles("src")
      .filter((file) => CODE_FILE.test(file) && !TAXONOMY_EXEMPT.test(file))
      .map((file) => ({
        file,
        code: readFileSync(`${ROOT}src/${file}`, "utf8"),
      }));
    const offenders = (rule: (file: string, code: string) => boolean) =>
      sources
        .filter(({ file, code }) => rule(file, code))
        .map(({ file }) => file);

    it("keeps exported types and interfaces in *.types.ts", () => {
      expect(
        offenders(
          (file, code) =>
            !file.endsWith(".types.ts") &&
            /^export (interface|type) /m.test(code),
        ),
      ).toEqual([]);
    });

    it("keeps *.types.ts free of runtime exports", () => {
      expect(
        offenders(
          (file, code) =>
            file.endsWith(".types.ts") &&
            /^export (const|let|function|async|class|enum|default)\b/m.test(
              code,
            ),
        ),
      ).toEqual([]);
    });

    it("keeps exported SCREAMING_CASE constants in *.constant.ts and nothing callable there", () => {
      expect(
        offenders(
          (file, code) =>
            !file.endsWith(".constant.ts") &&
            /^export const [A-Z][A-Z0-9_]*\b/m.test(code),
        ),
      ).toEqual([]);
      expect(
        offenders(
          (file, code) =>
            file.endsWith(".constant.ts") &&
            /^export (async )?(function|class)\b/m.test(code),
        ),
      ).toEqual([]);
    });

    it("keeps enums in *.enum.ts", () => {
      expect(
        offenders(
          (file, code) =>
            !file.endsWith(".enum.ts") && /^export (const )?enum\b/m.test(code),
        ),
      ).toEqual([]);
    });

    it("keeps exported hooks one per src/hooks/use-<name>.ts file", () => {
      expect(
        offenders(
          (file, code) =>
            !file.startsWith("hooks/") &&
            /^export (async )?(function|const) use[A-Z]/m.test(code),
        ),
      ).toEqual([]);
      expect(
        offenders((file, code) => {
          if (!file.startsWith("hooks/")) return false;
          const hooks = [
            ...code.matchAll(/^export function (use[A-Z]\w*)/gm),
          ].map((match) => match[1]);
          const expected = `hooks/${hooks[0]?.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.ts`;
          return hooks.length !== 1 || file !== expected;
        }),
      ).toEqual([]);
    });

    it("forbids bare catch-all module names", () => {
      expect(
        offenders((file) =>
          /(^|\/)(types|constants?|utils?|helpers?|enums?)\.tsx?$/.test(file),
        ),
      ).toEqual([]);
    });
  });
});
