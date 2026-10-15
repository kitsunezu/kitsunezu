import { createHash } from "node:crypto";
import { mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archify = join(process.env.ARCHIFY_DIR ?? join(homedir(), ".codex/skills/archify"), "bin/archify.mjs");
const scratch = await mkdtemp(join(tmpdir(), "kitsunet-diagrams-"));
const receipts = [];

function run(...args) {
  const result = spawnSync(process.execPath, [archify, ...args], { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message ?? result.stderr + result.stdout);
  }
  return JSON.parse(result.stdout);
}

function fingerprint(content) {
  return { sha256: createHash("sha256").update(content).digest("hex"), bytes: Buffer.byteLength(content) };
}

try {
  for (const locale of ["en", "zh-TW", "ja"]) {
    const spec = join(root, `docs/architecture/kitsunet-homelab.${locale}.json`);
    const staged = join(scratch, `kitsunet-homelab.${locale}.html`);
    const output = join(root, `public/architecture/kitsunet-homelab.${locale}.html`);
    run("validate", "architecture", spec, "--quality", "showcase", "--json");
    const delivered = run("deliver", "architecture", spec, staged, "--quality", "showcase", "--json");
    let html = await readFile(staged, "utf8");

    // Archify 2.17 supports only en/zh-CN viewer UI. Keep its English UI,
    // but mark authored content accurately for assistive technology and SVG export.
    if (locale !== "en") {
      if ((html.match(/<html lang="en"/g) ?? []).length !== 1 ||
          (html.match(/<svg\b[^>]* lang="en"/g) ?? []).length !== 1) {
        throw new Error(`Unexpected Archify language markup for ${locale}`);
      }
      html = html.replace('<html lang="en"', `<html lang="${locale}"`)
        .replace(/(<svg\b[^>]* lang=")en"/, `$1${locale}"`);
      await writeFile(staged, html);
    }

    const checked = run("check", staged);
    if (!checked.ok || checked.checks.length !== 9 || checked.checks.some(check => !check.ok) ||
        checked.composition?.summary.errors !== 0 || checked.composition?.summary.warnings !== 0) {
      throw new Error(`Final integrated artifact failed showcase checks: ${locale}`);
    }
    const nextOutput = `${output}.next`;
    await writeFile(nextOutput, html);
    await rename(nextOutput, output);
    receipts.push({
      locale, diagram_type: "architecture", output: relative(root, output),
      specification: delivered.specification,
      archify_artifact: delivered.artifact,
      integrated_artifact: fingerprint(html),
      validation: { checksPassed: checked.checks.length, errors: 0, warnings: 0 },
    });
  }
  await writeFile(join(root, "docs/architecture/receipts.json"), JSON.stringify(receipts, null, 2) + "\n");
  console.log(JSON.stringify(receipts, null, 2));
} finally {
  await rm(scratch, { recursive: true, force: true });
}
