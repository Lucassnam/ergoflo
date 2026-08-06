/* ============================================================
   Dev tool. NOT part of the deployed Worker -- nothing in src/index.ts
   imports it, so it is tree-shaken out of the bundle.

   Renders every template against a realistic order, writes HTML and
   plaintext to disk, and fails if any rendered copy contains an em or en
   dash. That last check is the house rule from commit df48982 (pattern
   rules from github.com/blader/humanizer) and it is verified against
   OUTPUT, not source, because a dash can arrive through an imported
   constant that a source grep would never see.

   Usage, from the repo root:
     node node_modules/typescript/bin/tsc --strict --target ES2022 \
       --module commonjs --moduleResolution node --lib ES2022,DOM \
       --types node --skipLibCheck --outDir /tmp/prev \
       workers/ergoflo-mailer/src/preview.ts
     node /tmp/prev/workers/ergoflo-mailer/src/preview.js ./out-dir

   Exits non-zero if the dash check fails, so it works in a hook.
   ============================================================ */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderReceipt } from "./templates/receipt";
import { renderConfirmation } from "./templates/confirmation";
/* Fixture lives in fixtures.ts, not here. This file calls main() at the
   bottom, so anything importing FROM it would run the CLI as a side
   effect -- which happened once, with an env-file path arriving as the
   output directory. Import data from data modules. */
import { SAMPLE_ORDER } from "./fixtures";

/** Strip tags and unescape entities, so the check sees what a reader
    sees rather than what the source says. */
function visibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&zwnj;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function main() {
  const outDir = process.argv[2] ?? ".";
  mkdirSync(outDir, { recursive: true });

  let dashes = 0;

  for (const [kind, email] of [
    ["receipt", renderReceipt(SAMPLE_ORDER)],
    ["confirmation", renderConfirmation(SAMPLE_ORDER)],
  ] as const) {
    for (const [part, content] of [
      ["subject", email.subject],
      ["html", visibleText(email.html)],
      ["text", email.text],
    ] as const) {
      const hits = content.match(/[—–]/g);
      if (hits) {
        dashes += hits.length;
        console.log(`FAIL ${kind}/${part}: ${hits.length} em/en dash(es)`);
        (content.match(/.{0,40}[—–].{0,40}/g) ?? []).forEach((c) =>
          console.log(`      ...${c.trim()}...`)
        );
      }
    }

    writeFileSync(join(outDir, `${kind}.html`), email.html);
    writeFileSync(
      join(outDir, `${kind}.txt`),
      `Subject: ${email.subject}\n\n${email.text}`
    );
    console.log(`wrote ${kind}.html / ${kind}.txt  (${email.html.length}b)`);
  }

  console.log(
    dashes === 0
      ? "PASS: 0 em/en dashes in rendered output"
      : `FAIL: ${dashes} em/en dash(es)`
  );
  process.exit(dashes === 0 ? 0 : 1);
}

main();
