const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const tcDir = path.join(ROOT, "docs/06-testing/test-cases");
const functionalDir = path.join(ROOT, "docs/02-requirements/functional");
const uiSpecDir = path.join(ROOT, "docs/05-development/ui-spec");

// ─── 1. Live-fetch all issues ─────────────────────────────────────────────────
console.log("Fetching issues from GitHub...");
const allIssues = JSON.parse(
  execSync("gh issue list --state all --json number,title,body,labels --limit 300", { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }),
);
const blockIssues = allIssues.filter((i) => /<!--\s*block:/.test(i.body || ""));
console.log(`Found ${blockIssues.length} block-issues (of ${allIssues.length} total).`);

// ─── 2. Parse source docs ─────────────────────────────────────────────────────

// user-stories.md
const usMap = {};
const userStoriesContent = fs.readFileSync(path.join(ROOT, "docs/02-requirements/user-stories.md"), "utf-8");
for (const line of userStoriesContent.split("\n")) {
  if (line.trim().startsWith("|") && line.includes("US-")) {
    const cols = line.split("|").map((c) => c.trim());
    if (cols.length >= 7 && cols[1].startsWith("US-")) {
      const [, usId, , text, , , criteria] = cols;
      usMap[usId] = { usId, text, criteria };
    }
  }
}
console.log(`Parsed ${Object.keys(usMap).length} user stories.`);

// test-cases/
function getMarkdownFiles(dir, baseDir = tcDir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      results = results.concat(getMarkdownFiles(fp, baseDir));
    } else if (file.endsWith(".md")) {
      results.push({
        absolutePath: fp,
        relativePath: path.relative(baseDir, fp)
      });
    }
  }
  return results;
}

const testCasesMap = {};
for (const fileObj of getMarkdownFiles(tcDir)) {
  const content = fs.readFileSync(fileObj.absolutePath, "utf-8");
  const sections = content.split(/### \[[ xX]\] TC-|### TC-/);
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const headingEnd = section.indexOf("\n");
    const heading = section.substring(0, headingEnd).trim();
    const colonIdx = heading.indexOf(":");
    const tcId = "TC-" + (colonIdx > 0 ? heading.substring(0, colonIdx).trim() : heading.trim());
    const tcTitle = colonIdx > 0 ? heading.substring(colonIdx + 1).trim() : "";
    const tcBody = "### TC-" + section;
    const isE2E = tcBody.toLowerCase().includes("playwright") || tcBody.toLowerCase().includes("e2e ui");
    const usMatch = tcBody.match(/\|\s*\*\*US\*\*\s*\|\s*([^|\n]+)/i);
    const usIds = usMatch
      ? usMatch[1]
          .trim()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    testCasesMap[tcId] = { tcId, title: tcTitle, file: fileObj.relativePath, isE2E, usIds };
  }
}
console.log(`Loaded ${Object.keys(testCasesMap).length} test cases.`);

// functional/
const functionalMap = {};
function readFunctionalFiles(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      readFunctionalFiles(fp);
      continue;
    }
    if (!file.endsWith(".md")) continue;
    const m = file.match(/^(\d+\.\d+)/);
    if (m) functionalMap[m[1]] = fs.readFileSync(fp, "utf-8");
  }
}
readFunctionalFiles(functionalDir);
console.log(`Loaded ${Object.keys(functionalMap).length} functional files.`);

// ui-spec/
const uiSpecMap = {};
if (fs.existsSync(uiSpecDir)) {
  for (const file of fs.readdirSync(uiSpecDir).filter((f) => f.endsWith(".md"))) {
    const content = fs.readFileSync(path.join(uiSpecDir, file), "utf-8");
    const sections = [];
    for (const part of content.split(/(?=^##\s)/m)) {
      if (part.trim().startsWith("##")) {
        const lines = part.split("\n");
        sections.push({ heading: lines[0].replace(/^##\s+/, "").trim(), content: lines.slice(1).join("\n").trim() });
      }
    }
    uiSpecMap[file] = sections;
  }
}
console.log(`Loaded ${Object.keys(uiSpecMap).length} UI spec files.`);

// ─── 3. Local progress from source docs ──────────────────────────────────────

// Checked TC-IDs from test-cases/
const localTcChecked = new Set();
for (const fileObj of getMarkdownFiles(tcDir)) {
  const content = fs.readFileSync(fileObj.absolutePath, "utf-8");
  for (const m of content.matchAll(/### \[x\] (TC-[A-Z]+-[A-Z0-9-]+)/gi)) {
    localTcChecked.add(m[1]);
  }
}

// Checked functional req texts from functional/
const localFuncChecked = new Set();
function collectFuncChecked(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      collectFuncChecked(fp);
      continue;
    }
    if (!file.endsWith(".md")) continue;
    for (const line of fs.readFileSync(fp, "utf-8").split("\n")) {
      const t = line.trim();
      if (!/^- \[x\]/i.test(t)) continue;
      const text = normText(t.replace(/^- \[x\]\s*/i, ""));
      if (text) localFuncChecked.add(text);
    }
  }
}
collectFuncChecked(functionalDir);
console.log(`Local progress: ${localTcChecked.size} checked TCs, ${localFuncChecked.size} checked func reqs.`);

// ─── 4. Helpers ───────────────────────────────────────────────────────────────

function normText(t) {
  return t
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim()
    .toLowerCase();
}

function parseDirective(body) {
  const m = (body || "").match(
    /<!--\s*block:\s*([^;>]+?)(?:\s*;\s*us:\s*([^;>]+?))?(?:\s*;\s*func:\s*([^;>]+?))?(?:\s*;\s*tc:\s*([^;>]+?))?(?:\s*;\s*ui:\s*([^;>]+?))?\s*-->/,
  );
  if (!m) return null;
  const csv = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  return { slug: m[1].trim(), usIds: csv(m[2]), funcSections: csv(m[3]), tcModules: csv(m[4]), uiFiles: csv(m[5]) };
}

function parseExistingBody(body) {
  if (!body) return { directiveLine: "", techDesign: "" };
  const directiveMatch = body.match(/<!--[\s\S]*?-->/);
  const directiveLine = directiveMatch ? directiveMatch[0] : "";
  const techMatch = body.match(/###\s+Технічний дизайн\s*\n([\s\S]*?)(?=\n###\s|\n##\s|$)/i);
  const techDesign = techMatch ? techMatch[1].trim() : "";
  return { directiveLine, techDesign };
}

function parseCheckedFromExisting(body) {
  const tcIds = new Set();
  const normTexts = new Set();
  const funcBySection = {};
  if (!body) return { tcIds, normTexts, funcBySection };
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!/^- \[x\]/i.test(t)) continue;
    const text = t.replace(/^- \[x\]\s*/i, "");
    const tcMatch = text.match(/\[(TC-[A-Z]+-[A-Z0-9-]+)\]/);
    if (tcMatch) tcIds.add(tcMatch[1]);
    const secMatch = text.match(/\*\*\[§([\d.]+)\]\*\*\s*(.*)/);
    if (secMatch) {
      const [, sec, raw] = secMatch;
      if (!funcBySection[sec]) funcBySection[sec] = new Set();
      funcBySection[sec].add(normText(raw));
    }
    normTexts.add(normText(text.replace(/\*\*\[§[\d.]+\]\*\*\s*/, "")));
  }
  return { tcIds, normTexts, funcBySection };
}

function isTcChecked(tcId, ex) {
  return localTcChecked.has(tcId) || ex.tcIds.has(tcId);
}

function isFuncChecked(rawText, sectionNum, ex) {
  const norm = normText(rawText);
  if (localFuncChecked.has(norm)) return true;
  if (ex.normTexts.has(norm)) return true;
  if (sectionNum && ex.funcBySection[sectionNum] && ex.funcBySection[sectionNum].has(norm)) return true;
  return false;
}

function getFunctionalRequirements(sectionNums, directive, ex) {
  const lines = [];
  for (const sec of sectionNums) {
    const content = functionalMap[sec];
    if (!content) continue;
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("-")) continue;

      // Parse US tags
      const usMatch = t.match(/<!--\s*(US-[A-Z0-9-,\s]+)\s*-->/i);
      if (usMatch) {
        const lineUsIds = usMatch[1].split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        const matchesUs = lineUsIds.some(usId => directive.usIds.includes(usId));
        if (!matchesUs) continue;
      }

      const raw = t
        .replace(/<!--\s*US-[A-Z0-9-,\s]+\s*-->/i, "")
        .replace(/^-\s*\[[ xX]\]\s*/, "")
        .replace(/^-\s*/, "")
        .trim();
      if (!raw) continue;

      const checked = isFuncChecked(raw, sec, ex);
      lines.push(`- [${checked ? "x" : " "}] **[§${sec}]** ${raw}`);
    }
  }
  return lines.join("\n");
}

function getTestCases(tcModules, directive, ex) {
  const unitLines = [],
    e2eLines = [];
  const seen = new Set();
  for (const mod of tcModules) {
    const modEntries = Object.entries(testCasesMap).filter(([, tc]) => tc.file.startsWith(mod));
    for (const [tcId, tc] of modEntries) {
      if (seen.has(tcId)) continue;
      const matchesUs = tc.usIds && tc.usIds.some((usId) => directive.usIds.includes(usId));
      if (!matchesUs) continue;
      seen.add(tcId);
      const checked = isTcChecked(tcId, ex);
      const anchor =
        "#" +
        `${tcId}: ${tc.title}`
          .toLowerCase()
          .replace(/[^\w\s\p{L}-]/gu, "")
          .trim()
          .replace(/\s+/g, "-");
      const line = `- [${checked ? "x" : " "}] [${tcId}](${anchor}) — ${tc.title}`;
      if (tc.isE2E) e2eLines.push(line);
      else unitLines.push(line);
    }
  }
  return { unitLines, e2eLines };
}

function getWebUiContent(uiFiles, directive) {
  let result = "";
  for (const f of uiFiles) {
    const fname = f.endsWith(".md") ? f : `${f}.md`;
    const sections = uiSpecMap[fname];
    if (!sections) continue;

    let fileResult = "";
    for (const s of sections) {
      // Parse US tags
      const usMatch = s.heading.match(/<!--\s*(US-[A-Z0-9-,\s]+)\s*-->/i);
      if (usMatch) {
        const headingUsIds = usMatch[1].split(',').map(name => name.trim().toUpperCase()).filter(Boolean);
        const matchesUs = headingUsIds.some(usId => directive.usIds.includes(usId));
        if (!matchesUs) continue;
      }

      const cleanHeading = s.heading.replace(/<!--\s*US-[A-Z0-9-,\s]+\s*-->/i, "").trim();
      fileResult += `#### ${cleanHeading}\n`;
      fileResult += s.content.replace(/^#### /gm, "##### ").replace(/^### /gm, "#### ") + "\n\n";
    }

    if (fileResult) {
      result += `**UI Spec:** [${fname}](https://github.com/Whytalik/fix-space/blob/main/docs/05-development/ui-spec/${fname})\n\n` + fileResult;
    }
  }
  return result;
}

function generateBlockBody(issue) {
  const body = issue.body || "";
  const directive = parseDirective(body);
  if (!directive) return null;

  const existing = parseExistingBody(body);
  const ex = parseCheckedFromExisting(body);

  let newBody = existing.directiveLine + "\n\n";

  // Технічний дизайн (rукописний, зберігається)
  if (existing.techDesign) {
    newBody += `### Технічний дизайн\n\n${existing.techDesign}\n\n`;
  }

  // User Stories & AC
  const usBlocks = [];
  for (const usId of directive.usIds) {
    const us = usMap[usId];
    if (!us) {
      usBlocks.push(`**${usId}:** _(not found in user-stories.md)_\n`);
      continue;
    }
    let block = `**${usId}:** ${us.text}\n\n`;
    if (us.criteria) {
      for (const crit of us.criteria
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean)) {
        const clean = crit.replace(/^[-*]\s*/, "").trim();
        if (!clean) continue;
        const checked = isFuncChecked(clean, null, ex);
        block += `- [${checked ? "x" : " "}] ${clean}\n`;
      }
    }
    usBlocks.push(block);
  }
  if (usBlocks.length > 0) {
    newBody += `### User Stories & Acceptance Criteria\n\n${usBlocks.join("\n")}\n`;
  }

  // Functional Requirements
  const funcReqs = getFunctionalRequirements(directive.funcSections, directive, ex);
  if (funcReqs) {
    newBody += `### Functional Requirements\n\n${funcReqs}\n\n`;
  }

  // Test Cases
  const { unitLines, e2eLines } = getTestCases(directive.tcModules, directive, ex);
  if (unitLines.length > 0) {
    newBody += `### Unit / Integration Test Cases\n\n${unitLines.join("\n")}\n\n`;
  }
  if (e2eLines.length > 0) {
    newBody += `### Web E2E Test Cases\n\n${e2eLines.join("\n")}\n\n`;
  }
  if (unitLines.length === 0 && e2eLines.length === 0) {
    newBody += `### Test Cases\n\nNo test cases mapped yet.\n\n`;
  }

  // Web UI Details
  const uiContent = getWebUiContent(directive.uiFiles, directive);
  if (uiContent) newBody += `### Web UI Details\n\n${uiContent}`;

  // References
  const refs = [];
  if (directive.funcSections.length) refs.push(`- Functional: ${directive.funcSections.map((s) => `§${s}`).join(", ")}`);
  if (directive.usIds.length) refs.push(`- User Stories: ${directive.usIds.join(", ")}`);
  const seenFiles = new Set();
  for (const mod of directive.tcModules) {
    const tc = Object.values(testCasesMap).find((t) => t.file.startsWith(mod));
    if (tc && !seenFiles.has(tc.file)) {
      refs.push(`- Test Cases: [${tc.file}](https://github.com/Whytalik/fix-space/blob/main/docs/06-testing/test-cases/${tc.file})`);
      seenFiles.add(tc.file);
    }
  }
  for (const f of directive.uiFiles) {
    const fname = f.endsWith(".md") ? f : `${f}.md`;
    refs.push(`- UI Spec: [${fname}](https://github.com/Whytalik/fix-space/blob/main/docs/05-development/ui-spec/${fname})`);
  }
  if (refs.length) newBody += `### References\n\n${refs.join("\n")}\n`;

  return newBody;
}

// ─── 5. Sync loop ─────────────────────────────────────────────────────────────
const targetNum = process.argv[2] ? parseInt(process.argv[2]) : null;
const toSync = targetNum ? blockIssues.filter((i) => i.number === targetNum) : blockIssues;

if (targetNum && toSync.length === 0) {
  console.log(`Issue #${targetNum} is not a block-issue (missing <!-- block: --> directive).`);
  process.exit(0);
}

const tempFile = path.join(__dirname, "temp_body.md");
for (const issue of toSync) {
  const directive = parseDirective(issue.body);
  if (!directive) continue;

  const newBody = generateBlockBody(issue);
  if (!newBody) continue;
  fs.writeFileSync(tempFile, newBody, "utf-8");

  // Calculate size label
  let funcCount = 0;
  for (const sec of directive.funcSections) {
    const content = functionalMap[sec];
    if (!content) continue;
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("-")) continue;

      // Parse US tags
      const usMatch = t.match(/<!--\s*(US-[A-Z0-9-,\s]+)\s*-->/i);
      if (usMatch) {
        const lineUsIds = usMatch[1].split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        const matchesUs = lineUsIds.some(usId => directive.usIds.includes(usId));
        if (!matchesUs) continue;
      }

      const raw = t
        .replace(/<!--\s*US-[A-Z0-9-,\s]+\s*-->/i, "")
        .replace(/^-\s*\[[ xX]\]\s*/, "")
        .replace(/^-\s*/, "")
        .trim();
      if (raw) funcCount++;
    }
  }
  const usCount = directive.usIds.length;
  const total = funcCount + usCount;
  const targetLabel = total <= 15 ? "size:XS" : total <= 25 ? "size:S" : total <= 35 ? "size:M" : total <= 50 ? "size:L" : "size:XL";

  const currentLabels = (issue.labels || []).map((l) => l.name);
  const currentSizeLabels = currentLabels.filter((name) => name.startsWith("size:"));

  let labelFlags = "";
  if (currentSizeLabels.length !== 1 || currentSizeLabels[0] !== targetLabel) {
    labelFlags = ` --add-label "${targetLabel}"`;
    if (currentSizeLabels.length > 0) {
      labelFlags += ` --remove-label "${currentSizeLabels.join(",")}"`;
    }
    console.log(`Syncing #${issue.number}: ${issue.title} (size updated to ${targetLabel})...`);
  } else {
    console.log(`Syncing #${issue.number}: ${issue.title}...`);
  }

  try {
    execSync(`gh issue edit ${issue.number} --body-file "${tempFile}"${labelFlags}`, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed #${issue.number}:`, e.message);
  }
}
if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
console.log("Sync complete.");
