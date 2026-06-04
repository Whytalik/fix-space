const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const tcDir = path.join(ROOT, 'docs/06-testing/test-cases');
const functionalDir = path.join(ROOT, 'docs/02-requirements/functional');

// ─── 1. Fetch all block-issues ────────────────────────────────────────────────
console.log('Fetching block-issues from GitHub...');
const allIssues = JSON.parse(
  execSync('gh issue list --state all --json number,title,body --limit 300', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })
);
const blockIssues = allIssues.filter(i => /<!--\s*block:/.test(i.body || ''));
console.log(`Found ${blockIssues.length} block-issues.`);

// ─── 2. Collect checked items from issue bodies ───────────────────────────────
const checkedTcIds = new Set();
const checkedFuncBySection = {};

for (const issue of blockIssues) {
  for (const line of (issue.body || '').split('\n')) {
    const t = line.trim();
    if (!/^- \[x\]/i.test(t)) continue;
    const text = t.replace(/^- \[x\]\s*/i, '');

    // TC-ID: - [x] [TC-AUTH-001](anchor) — title
    const tcMatch = text.match(/\[(TC-[A-Z]+-[A-Z0-9-]+)\]/);
    if (tcMatch) checkedTcIds.add(tcMatch[1]);

    // Functional req: - [x] **[§X.Y]** raw text
    const secMatch = text.match(/\*\*\[§([\d.]+)\]\*\*\s*(.*)/);
    if (secMatch) {
      const [, sec, raw] = secMatch;
      if (!checkedFuncBySection[sec]) checkedFuncBySection[sec] = new Set();
      checkedFuncBySection[sec].add(normText(raw));
    }
  }
}
console.log(`From issues: ${checkedTcIds.size} checked TC-IDs across ${Object.keys(checkedFuncBySection).length} func sections.`);

function normText(t) {
  return t
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
    .toLowerCase();
}

// ─── 3. Flip test-cases/ ──────────────────────────────────────────────────────
function getMarkdownFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      results = results.concat(getMarkdownFiles(fp));
    } else if (file.endsWith('.md')) {
      results.push(fp);
    }
  }
  return results;
}

let tcFlipped = 0;
for (const fp of getMarkdownFiles(tcDir)) {
  let content = fs.readFileSync(fp, 'utf-8');
  let changed = false;
  const updated = content.replace(/### \[ \] (TC-[A-Z]+-[A-Z0-9-]+)/g, (match, tcId) => {
    if (checkedTcIds.has(tcId)) { changed = true; tcFlipped++; return `### [x] ${tcId}`; }
    return match;
  });
  if (changed) fs.writeFileSync(fp, updated, 'utf-8');
}
console.log(`Flipped ${tcFlipped} TC headings in test-cases/.`);

// ─── 4. Flip functional/ ──────────────────────────────────────────────────────
let funcFlipped = 0;
function flipFunctionalDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) { flipFunctionalDir(fp); continue; }
    if (!file.endsWith('.md')) continue;

    // Determine which §-section this file covers
    const secMatch = file.match(/^(\d+\.\d+)/);
    if (!secMatch) continue;
    const sectionNum = secMatch[1];
    const checkedTexts = checkedFuncBySection[sectionNum];
    if (!checkedTexts || checkedTexts.size === 0) continue;

    let content = fs.readFileSync(fp, 'utf-8');
    let changed = false;
    const updated = content.replace(/- \[ \] (.+)/g, (match, rawText) => {
      const norm = normText(rawText);
      if (checkedTexts.has(norm)) { changed = true; funcFlipped++; return `- [x] ${rawText}`; }
      return match;
    });
    if (changed) fs.writeFileSync(fp, updated, 'utf-8');
  }
}
flipFunctionalDir(functionalDir);
console.log(`Flipped ${funcFlipped} functional requirement bullets.`);
console.log('Reverse sync complete.');
