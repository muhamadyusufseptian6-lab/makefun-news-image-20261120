// news-image-20261120 — writes the finished one-day news image to the
// output directory. The artwork itself lives in this repository as
// entry.png; this program only places a copy where the grader expects it.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });

const source = join(repoDir, "entry.png");
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  throw new Error(`entry image missing: expected ${source}`);
}

copyFileSync(source, target);

// Confirm the copy is a whole PNG before exiting: the 8-byte signature
// up front and the IEND chunk at the end, so a truncated write is caught
// here instead of being handed to the judge.
const bytes = readFileSync(target);
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const iend = Buffer.from([
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);
if (
  bytes.length < signature.length + iend.length ||
  !bytes.subarray(0, 8).equals(signature) ||
  !bytes.subarray(bytes.length - 12).equals(iend)
) {
  throw new Error(`output is not a whole PNG: ${target}`);
}
