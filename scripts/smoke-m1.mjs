import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
const productName = packageJson.build?.productName ?? "DeskPet";
const version = packageJson.version;
const distDir = path.join(repoRoot, "dist");
const unpackedExe = path.join(distDir, "win-unpacked", `${productName}.exe`);
const portableExe = path.join(distDir, `${productName} ${version}.exe`);
const zipFile = path.join(distDir, `${productName}-${version}-win.zip`);
const defaultPort = 9200 + Math.floor(Math.random() * 700);
const port = Number(process.env.DESKPET_SMOKE_PORT ?? defaultPort);
const userDataDir = path.join(tmpdir(), `deskpet-smoke-${Date.now()}-${process.pid}`);
const assetModeArg = process.argv.find((arg) => arg.startsWith("--asset-mode="));
const assetMode = assetModeArg?.split("=")[1] ?? "m1";
if (!["m1", "m2a"].includes(assetMode)) {
  throw new Error(`Unsupported asset mode: ${assetMode}`);
}
const smokeLabel = assetMode === "m2a" ? "smoke:m2a" : "smoke:m1";

const m2aRuntimeFiles = [
  "pet_assets/main_pixel_avatar/idle.webp",
  "pet_assets/main_pixel_avatar/sitting.webp",
  "pet_assets/main_pixel_avatar/happy.webp",
  "pet_assets/main_pixel_avatar/breakPrompt.webp",
  "pet_assets/main_pixel_avatar/breakRunning.webp",
  "pet_assets/main_pixel_avatar/breakDone.webp",
  "pet_assets/main_pixel_avatar/mealPrompt.webp",
  "pet_assets/main_pixel_avatar/eating.webp",
  "pet_assets/main_pixel_avatar/hydrationPrompt.webp",
  "pet_assets/main_pixel_avatar/drinking.webp",
  "pet_assets/main_pixel_avatar/hydrationDone.webp",
  "pet_assets/main_pixel_avatar/focusGuard.webp",
  "pet_assets/main_pixel_avatar/focusDone.webp",
  "pet_assets/main_pixel_avatar/sad.webp",
  "pet_assets/main_pixel_avatar/sleeping.webp"
];
const m2aRuntimeDir = "pet_assets/main_pixel_avatar/";

const m2aRepresentativeStates = [
  ["idle", "idle.webp"],
  ["sitting", "sitting.webp"],
  ["sleeping", "sleeping.webp"],
  ["breakPrompt", "breakPrompt.webp"],
  ["mealPrompt", "mealPrompt.webp"],
  ["eating", "eating.webp"],
  ["hydrationPrompt", "hydrationPrompt.webp"],
  ["focusGuard", "focusGuard.webp"]
];

const m2aRejectedResourceFragments = [
  "pet_assets/main_pixel_avatar/raw/",
  "pet_assets/main_pixel_avatar/cleaned/",
  "pet_assets/main_pixel_avatar/asset-notes.md",
  "pet_assets/main_pixel_avatar/manifest.draft.json",
  "pet_assets/main_pixel_avatar/focusAlert",
  "pet_assets/paired_pixel_avatar/",
  "pet_assets/scenes/",
  "pet_assets/scene/"
];

const snapshotKeys = [
  "blockingMode",
  "dogVisible",
  "focusActive",
  "petFacing",
  "petState",
  "settings",
  "stats",
  "statsHistory",
  "timers"
];

const settingsKeys = [
  "breakIntervalMinutes",
  "breakReminderEnabled",
  "focusDurationMinutes",
  "mealReminderEnabled",
  "hydrationIntervalMinutes",
  "hydrationReminderEnabled",
  "language",
  "onboardingDismissed",
  "petAppearanceId"
];

const persistedSettings = {
  breakReminderEnabled: false,
  breakIntervalMinutes: 17,
  mealReminderEnabled: false,
  hydrationReminderEnabled: false,
  hydrationIntervalMinutes: 31,
  focusDurationMinutes: 12,
  language: "en",
  petAppearanceId: assetMode === "m2a" ? "mainPixelAvatar" : "lovartPuppy",
  onboardingDismissed: true
};

const forbiddenTerms = [
  "readActiveWindow",
  "classifyDistraction",
  "distractionDetection",
  "distractionBlocked",
  "focusWarning",
  "frontmost",
  "windowTitle",
  "desktopCapturer",
  "capturePage",
  "globalShortcut",
  "setLoginItemSettings",
  "autoUpdater",
  "electron-updater",
  "auto-launch",
  "telemetry",
  "analytics",
  "uiohook",
  "iohook",
  "robotjs",
  "active-win",
  "node-window-manager",
  "screenshot-desktop",
  "tesseract",
  "ocr-space",
  "ffi-napi",
  "automation.apple-events"
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".json",
  ".lock",
  ".plist",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml"
]);

function log(message) {
  console.log(`[${smokeLabel}] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function assertFile(filePath, label) {
  const info = await stat(filePath);
  assert(info.isFile(), `${label} is not a file: ${filePath}`);
  assert(info.size > 0, `${label} is empty: ${filePath}`);
  log(`${label}: ${path.relative(repoRoot, filePath)} (${info.size} bytes)`);
}

async function assertAsciiAbsent(filePath, term, label) {
  const content = await readFile(filePath);
  assert(
    !content.includes(Buffer.from(term, "ascii")),
    `${label} contains forbidden packaged marker: ${term}`
  );
}

async function getZipAudit(filePath) {
  const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($env:DESKPET_ZIP_PATH)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName })
  [PSCustomObject]@{
    EntryCount = $entries.Count
    ElevateEntryCount = @($entries | Where-Object { $_ -match '(^|/)elevate\\.exe$' }).Count
    ExeEntryCount = @($entries | Where-Object { $_ -match '\\.exe$' }).Count
    Entries = $entries
  } | ConvertTo-Json -Compress
} finally {
  $archive.Dispose()
}
`;
  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { env: { ...process.env, DESKPET_ZIP_PATH: filePath } }
  );
  return JSON.parse(stdout);
}

function normalizeResourcePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function zipContains(entries, resourcePath) {
  const normalized = normalizeResourcePath(resourcePath);
  return entries.some((entry) => {
    const normalizedEntry = normalizeResourcePath(entry);
    return normalizedEntry === normalized || normalizedEntry.endsWith(`/${normalized}`);
  });
}

function extractM2aRuntimePath(entry) {
  const normalized = normalizeResourcePath(entry);
  const index = normalized.indexOf(m2aRuntimeDir);
  if (index === -1 || normalized.endsWith("/")) return null;
  return normalized.slice(index);
}

function assertExactM2aRuntimeFiles(actual, label) {
  const expected = [...m2aRuntimeFiles].sort();
  const sortedActual = [...actual].sort();
  const expectedSet = new Set(expected);
  const actualSet = new Set(sortedActual);
  const missing = expected.filter((file) => !actualSet.has(file));
  const extra = sortedActual.filter((file) => !expectedSet.has(file));
  const duplicates = sortedActual.filter((file, index) => file === sortedActual[index - 1]);
  assert(
    missing.length === 0 && extra.length === 0 && duplicates.length === 0,
    [
      `${label} must contain exactly the ${m2aRuntimeFiles.length} M2A runtime files.`,
      missing.length > 0 ? `Missing:\n${missing.join("\n")}` : null,
      extra.length > 0 ? `Extra:\n${extra.join("\n")}` : null,
      duplicates.length > 0 ? `Duplicate:\n${duplicates.join("\n")}` : null
    ]
      .filter(Boolean)
      .join("\n\n")
  );
}

async function walkFiles(startPath) {
  const info = await stat(startPath);
  if (info.isFile()) return [startPath];
  const entries = await readdir(startPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const nextPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(nextPath)));
    } else if (entry.isFile()) {
      results.push(nextPath);
    }
  }
  return results;
}

async function walkDirs(startPath) {
  const entries = await readdir(startPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const nextPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      results.push(nextPath, ...(await walkDirs(nextPath)));
    }
  }
  return results;
}

async function runSafetyScan() {
  const scanRoots = ["src", "package.json", "pnpm-lock.yaml", "build", ".github"].map((entry) =>
    path.join(repoRoot, entry)
  );
  const matches = [];
  for (const root of scanRoots) {
    if (!existsSync(root)) continue;
    const files = await walkFiles(root);
    for (const file of files) {
      const extension = path.extname(file);
      if (!textExtensions.has(extension) && path.basename(file) !== "pnpm-lock.yaml") continue;
      const content = await readFile(file, "utf8");
      const lower = content.toLowerCase();
      for (const term of forbiddenTerms) {
        if (lower.includes(term.toLowerCase())) {
          matches.push(`${path.relative(repoRoot, file)} -> ${term}`);
        }
      }
    }
  }
  assert(matches.length === 0, `Forbidden safety terms found:\n${matches.join("\n")}`);
  log("Safety scan passed for source/config paths.");
}

async function isGitIgnored(relativePath) {
  try {
    await execFileAsync("git", ["check-ignore", "-q", "--", relativePath], { cwd: repoRoot });
    return true;
  } catch (error) {
    if (error.code === 1) return false;
    throw error;
  }
}

async function runM2aSourceControlChecks() {
  const { stdout } = await execFileAsync("git", ["ls-files", "--", ...m2aRuntimeFiles], {
    cwd: repoRoot
  });
  const tracked = new Set(
    stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((entry) => normalizeResourcePath(entry))
  );
  const missing = m2aRuntimeFiles.filter((file) => !tracked.has(file));
  assert(
    missing.length === 0,
    `M2A runtime files are not tracked or staged:\n${missing.join("\n")}`
  );

  const ignoredPaths = [
    "pet_assets/main_pixel_avatar/raw",
    "pet_assets/main_pixel_avatar/cleaned",
    "pet_assets/main_pixel_avatar/asset-notes.md",
    "pet_assets/main_pixel_avatar/manifest.draft.json",
    "pet_assets/main_pixel_avatar/focusAlert.gif",
    "pet_assets/paired_pixel_avatar/idle.gif"
  ];
  const notIgnored = [];
  for (const ignoredPath of ignoredPaths) {
    if (!(await isGitIgnored(ignoredPath))) {
      notIgnored.push(ignoredPath);
    }
  }
  assert(notIgnored.length === 0, `Draft/private asset paths are not ignored:\n${notIgnored.join("\n")}`);
  log("M2A source-control asset boundary checks passed.");
}

async function runM2aBuiltManifestChecks() {
  const source = await readFile(path.join(repoRoot, "src", "shared", "petAppearances.ts"), "utf8");
  assert(source.includes("mainPixelAvatar"), "mainPixelAvatar is missing from petAppearances source.");
  for (const runtimeFile of m2aRuntimeFiles) {
    const fileName = path.basename(runtimeFile);
    assert(source.includes(fileName), `mainPixelAvatar source mapping is missing ${fileName}.`);
  }
  log("M2A appearance source mapping checks passed.");
}

async function getPrimaryWorkArea() {
  const script = `
Add-Type -AssemblyName System.Windows.Forms
$workArea = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
[PSCustomObject]@{
  X = $workArea.X
  Y = $workArea.Y
  Width = $workArea.Width
  Height = $workArea.Height
} | ConvertTo-Json -Compress
`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ]);
  return JSON.parse(stdout);
}

async function setCursorPosition(x, y) {
  const script = `
Add-Type @'
using System.Runtime.InteropServices;
public static class DeskPetCursor {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
}
'@
[DeskPetCursor]::SetCursorPos(${Math.round(x)}, ${Math.round(y)}) | Out-Null
`;
  await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ]);
}

async function dragPetTo(cdp, x, y) {
  await setCursorPosition(x, y);
  await cdp.evaluate("window.pawpal.petDragStart({ offsetX: 0, offsetY: 0 }); true");
  await new Promise((resolve) => setTimeout(resolve, 120));
  await cdp.evaluate("window.pawpal.petDragStop(); true");
}

async function runM2aPackageResourceChecks(assetRoot, zipEntries) {
  const missingUnpacked = [];
  const missingZip = [];
  for (const runtimeFile of m2aRuntimeFiles) {
    const unpackedPath = path.join(distDir, "win-unpacked", "resources", ...runtimeFile.split("/"));
    if (!existsSync(unpackedPath)) missingUnpacked.push(runtimeFile);
    if (!zipContains(zipEntries, runtimeFile)) missingZip.push(runtimeFile);
  }
  assert(missingUnpacked.length === 0, `M2A runtime files missing from win-unpacked:\n${missingUnpacked.join("\n")}`);
  assert(missingZip.length === 0, `M2A runtime files missing from zip:\n${missingZip.join("\n")}`);

  const packagedFiles = (await walkFiles(assetRoot)).map((file) =>
    normalizeResourcePath(path.relative(path.join(distDir, "win-unpacked", "resources"), file))
  );
  const unpackedM2aFiles = packagedFiles.map(extractM2aRuntimePath).filter(Boolean);
  const zipM2aFiles = zipEntries.map(extractM2aRuntimePath).filter(Boolean);
  assertExactM2aRuntimeFiles(unpackedM2aFiles, "win-unpacked main_pixel_avatar resources");
  assertExactM2aRuntimeFiles(zipM2aFiles, "zip main_pixel_avatar resources");

  const resourceEntries = [...packagedFiles, ...zipEntries.map(normalizeResourcePath)];
  const rejectedMatches = resourceEntries.filter((entry) =>
    m2aRejectedResourceFragments.some((fragment) => entry.includes(fragment))
  );
  assert(
    rejectedMatches.length === 0,
    `Rejected M2A asset resources were packaged:\n${rejectedMatches.join("\n")}`
  );
  log("M2A package asset inclusion/exclusion checks passed.");
}

async function runPackageChecks() {
  await assertFile(unpackedExe, "Unpacked app");
  await assertFile(portableExe, "Portable artifact");
  await assertFile(zipFile, "Zip artifact");

  const targets = packageJson.build?.win?.target?.map((target) => target.target) ?? [];
  assert(targets.includes("portable"), "Windows target does not include portable.");
  assert(targets.includes("zip"), "Windows target does not include zip.");
  assert(!targets.includes("nsis"), "NSIS must not be a default Windows target.");

  const nsis = packageJson.build?.nsis ?? {};
  assert(nsis.perMachine === false, "NSIS must not default to per-machine install.");
  assert(nsis.allowElevation === false, "NSIS elevation must be disabled.");
  assert(nsis.packElevateHelper === false, "NSIS elevate helper must not be packaged.");
  const portable = packageJson.build?.portable ?? {};
  assert(portable.warningsAsErrors === false, "Portable packaging must allow ignored no-elevate helper warnings.");
  assert(packageJson.dependencies?.["electron-updater"] === undefined, "electron-updater must not be a runtime dependency.");

  await assertAsciiAbsent(portableExe, "elevate.exe", "Portable artifact");
  const zipAudit = await getZipAudit(zipFile);
  assert(zipAudit.ElevateEntryCount === 0, "Zip artifact contains elevate.exe.");
  log(`Zip audit passed: ${zipAudit.EntryCount} entries, ${zipAudit.ExeEntryCount} executable entries, no elevate.exe.`);
  const zipEntries = Array.isArray(zipAudit.Entries) ? zipAudit.Entries : [zipAudit.Entries].filter(Boolean);

  const assetRoot = path.join(distDir, "win-unpacked", "resources", "pet_assets");
  if (assetMode === "m2a") {
    await runM2aPackageResourceChecks(assetRoot, zipEntries);
  } else {
    const dirs = await walkDirs(assetRoot);
    const blocked = dirs
      .map((dir) => path.basename(dir))
      .filter((name) => ["focusAlert", "paired_pixel_avatar"].includes(name));
    assert(blocked.length === 0, `Blocked asset directories are packaged: ${blocked.join(", ")}`);
  }
  log("Package target and resource checks passed.");
}

async function waitFor(label, fn, timeoutMs = 20000, intervalMs = 250) {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => this.handleMessage(event));
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  handleMessage(event) {
    const raw = typeof event.data === "string" ? event.data : Buffer.from(event.data).toString("utf8");
    const message = JSON.parse(raw);
    if (!message.id || !this.pending.has(message.id)) return;
    const { resolve, reject } = this.pending.get(message.id);
    this.pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
      return;
    }
    resolve(message.result);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(payload);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
    }
    return result.result?.value;
  }

  close() {
    this.socket?.close();
  }
}

async function connectToPetTarget() {
  const targets = await waitFor("CDP target list", async () => {
    const list = await fetchJson(`http://127.0.0.1:${port}/json`);
    return Array.isArray(list) && list.length > 0 ? list : null;
  });
  const page =
    targets.find((target) => target.type === "page" && target.url?.includes("#pet")) ??
    targets.find((target) => target.type === "page");
  assert(page?.webSocketDebuggerUrl, "No page target with a debugger URL was found.");
  const cdp = new CdpClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Runtime.enable");
  await waitFor("preload bridge", () => cdp.evaluate("Boolean(window.pawpal?.getSnapshot)"));
  log("Connected to packaged renderer through CDP.");
  return cdp;
}

function assertSameKeys(actual, expected, label) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  assert(
    JSON.stringify(sortedActual) === JSON.stringify(sortedExpected),
    `${label} keys changed. Expected ${sortedExpected.join(", ")}, got ${sortedActual.join(", ")}`
  );
}

function assertSettingsMatch(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    assert(actual[key] === value, `${label} expected ${key}=${value}, got ${actual[key]}`);
  }
}

async function getSnapshot(cdp) {
  const snapshot = await cdp.evaluate("window.pawpal.getSnapshot()");
  assertSameKeys(Object.keys(snapshot), snapshotKeys, "Snapshot");
  assertSameKeys(Object.keys(snapshot.settings), settingsKeys, "Settings");
  assert(snapshot.dogVisible === true, "Pet window is not visible according to snapshot.");
  assert(snapshot.settings.focusDurationMinutes >= 1, "Focus duration is below timer minimum.");
  return snapshot;
}

async function assertPetImageLoaded(cdp, state, expectedFileName) {
  const image = await waitFor(`${state} mainPixelAvatar image load`, async () => {
    const result = await cdp.evaluate(`(async () => {
      const snapshot = await window.pawpal.getSnapshot();
      const img = document.querySelector(".pet-button img");
      if (!img) return null;
      return {
        state: snapshot.petState,
        appearanceId: snapshot.settings.petAppearanceId,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        src: img.currentSrc || img.src
      };
    })()`);
    return result?.state === state &&
      result?.appearanceId === "mainPixelAvatar" &&
      result?.complete === true &&
      result?.naturalWidth > 0 &&
      result?.naturalHeight > 0 &&
      result?.src.includes("main_pixel_avatar") &&
      result?.src.includes(expectedFileName)
      ? result
      : null;
  });
  log(`M2A renderer image loaded for ${state}: ${image.naturalWidth}x${image.naturalHeight}.`);

  const shellStyle = await cdp.evaluate(`(() => {
    const button = document.querySelector(".pet-button");
    if (!button) return null;
    const style = getComputedStyle(button);
    return {
      className: button.className,
      animationName: style.animationName,
      transform: style.transform
    };
  })()`);
  assert(shellStyle?.className.includes("appearance-mainPixelAvatar"), "M2A pet button is missing its appearance class.");
  assert(shellStyle.animationName === "none", `M2A shell animation is still active for ${state}: ${shellStyle.animationName}`);
  assert(shellStyle.transform === "none", `M2A shell transform is still active for ${state}: ${shellStyle.transform}`);
  log(`M2A shell motion disabled for ${state}.`);
}

async function runCdpChecks(cdp) {
  const initial = await getSnapshot(cdp);
  assert(initial.focusActive === false, "Focus should not be active on a fresh smoke profile.");
  assert(initial.blockingMode === null, "Blocking mode should be clear on startup.");

  await cdp.evaluate("window.pawpal.startFocus(); true");
  const active = await waitFor("manual focus active state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === true &&
      snapshot.petState === "focusGuard" &&
      typeof snapshot.timers.focusEndsAt === "number"
      ? snapshot
      : null;
  });
  assert(active.blockingMode === null, "Manual focus should not set a blocking mode.");

  await cdp.evaluate("window.pawpal.stopFocus(); true");
  await waitFor("manual focus stopped state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === false ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("break"); true');
  await waitFor("break reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "break" && snapshot.petState === "breakPrompt" ? snapshot : null;
  });
  await cdp.evaluate('window.pawpal.bubbleAction("break:snooze"); true');
  await waitFor("break reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("meal"); true');
  await waitFor("meal reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "meal" && snapshot.petState === "mealPrompt" ? snapshot : null;
  });
  await cdp.evaluate('window.pawpal.bubbleAction("meal:snooze"); true');
  await waitFor("meal reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("hydration"); true');
  await waitFor("hydration reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "hydration" && snapshot.petState === "hydrationPrompt" ? snapshot : null;
  });
  await cdp.evaluate('window.pawpal.bubbleAction("hydration:snooze"); true');
  await waitFor("hydration reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  log("CDP focus and reminder checks passed.");
}

async function runM2aCdpChecks(cdp) {
  const initial = await getSnapshot(cdp);
  assert(initial.focusActive === false, "Focus should not be active on a fresh smoke profile.");
  assert(initial.blockingMode === null, "Blocking mode should be clear on startup.");

  await cdp.evaluate('window.pawpal.updateSettings({ petAppearanceId: "mainPixelAvatar" }); true');
  await waitFor("mainPixelAvatar setting", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.settings.petAppearanceId === "mainPixelAvatar" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "idle", "idle.webp");

  const workArea = await getPrimaryWorkArea();
  const dragX = workArea.X + Math.round(workArea.Width / 2);
  const bottomY = workArea.Y + workArea.Height - 2;
  const awayY = workArea.Y + Math.max(24, Math.round(workArea.Height / 3));
  await dragPetTo(cdp, dragX, bottomY);
  await waitFor("bottom drag sitting state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "sitting" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "sitting", "sitting.webp");

  await waitFor("idle inactivity sleeping state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "sleeping" ? snapshot : null;
  }, 5000);
  await assertPetImageLoaded(cdp, "sleeping", "sleeping.webp");
  await waitFor("sleeping returns to idle", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "idle" ? snapshot : null;
  }, 5000);
  await assertPetImageLoaded(cdp, "idle", "idle.webp");

  await dragPetTo(cdp, dragX, bottomY);
  await waitFor("second bottom drag sitting state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "sitting" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "sitting", "sitting.webp");

  await cdp.evaluate("window.pawpal.startFocus(); true");
  const active = await waitFor("manual focus from sitting active state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === true &&
      snapshot.petState === "focusGuard" &&
      typeof snapshot.timers.focusEndsAt === "number"
      ? snapshot
      : null;
  });
  assert(active.blockingMode === null, "Manual focus should not set a blocking mode.");
  await assertPetImageLoaded(cdp, "focusGuard", "focusGuard.webp");

  await cdp.evaluate("window.pawpal.stopFocus(); true");
  await waitFor("manual focus stopped state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === false ? snapshot : null;
  });

  await dragPetTo(cdp, dragX, bottomY);
  await waitFor("third bottom drag sitting state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "sitting" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "sitting", "sitting.webp");

  await dragPetTo(cdp, dragX, awayY);
  await waitFor("drag away idle state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "idle" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "idle", "idle.webp");

  await cdp.evaluate('window.pawpal.triggerDemo("break"); true');
  await waitFor("break reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "break" && snapshot.petState === "breakPrompt" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "breakPrompt", "breakPrompt.webp");
  await cdp.evaluate('window.pawpal.bubbleAction("break:snooze"); true');
  await waitFor("break reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("meal"); true');
  await waitFor("meal reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "meal" && snapshot.petState === "mealPrompt" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "mealPrompt", "mealPrompt.webp");
  await cdp.evaluate('window.pawpal.bubbleAction("meal:done"); true');
  await waitFor("meal eating state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "eating" && snapshot.stats.mealsLogged === 1 ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "eating", "eating.webp");
  await waitFor("meal completion shared feedback", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.petState === "hydrationDone" ? snapshot : null;
  }, 5000);
  await assertPetImageLoaded(cdp, "hydrationDone", "hydrationDone.webp");
  await waitFor("meal reminder completion idle", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null && snapshot.petState === "idle" ? snapshot : null;
  }, 5000);

  await cdp.evaluate('window.pawpal.triggerDemo("hydration"); true');
  await waitFor("hydration reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "hydration" && snapshot.petState === "hydrationPrompt" ? snapshot : null;
  });
  await assertPetImageLoaded(cdp, "hydrationPrompt", "hydrationPrompt.webp");
  await cdp.evaluate('window.pawpal.bubbleAction("hydration:snooze"); true');
  await waitFor("hydration reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  log("CDP M2A focus, reminder, and renderer image-load checks passed.");
}

async function writeSettingsForPersistence(cdp) {
  const payload = JSON.stringify(persistedSettings);
  await cdp.evaluate(`window.pawpal.updateSettings(${payload}); true`);
  await waitFor("settings update", async () => {
    const snapshot = await getSnapshot(cdp);
    try {
      assertSettingsMatch(snapshot.settings, persistedSettings, "Updated settings");
      return snapshot;
    } catch {
      return null;
    }
  });
  log("Settings update check passed.");
}

async function runSettingsPersistenceCheck(cdp) {
  const snapshot = await getSnapshot(cdp);
  assertSettingsMatch(snapshot.settings, persistedSettings, "Persisted settings");
  assert(snapshot.focusActive === false, "Focus should not auto-resume after restart.");
  assert(snapshot.blockingMode === null, "Blocking mode should not persist after restart.");
  log("Settings persistence check passed after restart.");
}

async function getWindowSnapshot(rootPid) {
  const script = `
$rootPid = ${Number(rootPid)}
$all = Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId
$ids = New-Object 'System.Collections.Generic.HashSet[int]'
[void]$ids.Add($rootPid)
$changed = $true
while ($changed) {
  $changed = $false
  foreach ($proc in $all) {
    if ($ids.Contains([int]$proc.ParentProcessId) -and -not $ids.Contains([int]$proc.ProcessId)) {
      [void]$ids.Add([int]$proc.ProcessId)
      $changed = $true
    }
  }
}
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class DeskPetWin32 {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll", SetLastError=true)] public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
}
'@
$rows = @()
foreach ($proc in Get-Process -Id @($ids) -ErrorAction SilentlyContinue) {
  $handle = $proc.MainWindowHandle
  if ($handle -eq 0 -or -not [DeskPetWin32]::IsWindowVisible($handle)) { continue }
  $rect = New-Object DeskPetWin32+RECT
  [void][DeskPetWin32]::GetWindowRect($handle, [ref]$rect)
  $exStyle = [DeskPetWin32]::GetWindowLong($handle, -20)
  $rows += [PSCustomObject]@{
    ProcessId = $proc.Id
    Title = $proc.MainWindowTitle
    Width = $rect.Right - $rect.Left
    Height = $rect.Bottom - $rect.Top
    TopMost = (($exStyle -band 0x00000008) -ne 0)
  }
}
$rows | ConvertTo-Json -Compress
`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ]);
  if (!stdout.trim()) return [];
  const parsed = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function runWindowChecks(rootPid) {
  const windows = await waitFor("visible DeskPet window", async () => {
    const rows = await getWindowSnapshot(rootPid);
    return rows.length > 0 ? rows : null;
  });
  const petWindow = windows.find(
    (win) =>
      Math.abs(win.Width - 220) <= 4 &&
      Math.abs(win.Height - 340) <= 4 &&
      win.TopMost === true
  );
  assert(
    petWindow,
    `Expected an approximately 220x340 topmost pet window. Observed: ${JSON.stringify(windows)}`
  );
  log(
    `Window check passed: ${petWindow.Width}x${petWindow.Height}, TopMost=${petWindow.TopMost}.`
  );
}

async function stopProcessTree(rootPid) {
  if (!rootPid) return;
  try {
    await execFileAsync("taskkill.exe", ["/PID", String(rootPid), "/T", "/F"]);
  } catch (error) {
    if (!String(error.stderr ?? error.stdout ?? "").includes("not found")) {
      throw error;
    }
  }
}

async function removeWithRetry(targetPath, attempts = 12, delayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      if (!["EBUSY", "ENOTEMPTY", "EPERM"].includes(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function launchPackagedApp(label) {
  const m2aTimerEnv =
    assetMode === "m2a"
      ? {
          DESKPET_IDLE_SLEEP_DELAY_MS: "900",
          DESKPET_IDLE_SLEEP_DURATION_MS: "900"
        }
      : {};
  const child = spawn(unpackedExe, [`--remote-debugging-port=${port}`], {
    env: {
      ...process.env,
      DESKPET_USER_DATA_DIR: userDataDir,
      ...m2aTimerEnv
    },
    stdio: "ignore",
    windowsHide: false
  });

  log(`Launched ${path.relative(repoRoot, unpackedExe)} (${label}) with pid ${child.pid}.`);
  let cdp;
  try {
    cdp = await connectToPetTarget();
    await runWindowChecks(child.pid);
    return { child, cdp };
  } catch (error) {
    cdp?.close();
    await stopProcessTree(child.pid);
    throw error;
  }
}

async function closePackagedApp(session) {
  if (!session) return;
  session.cdp?.close();
  await stopProcessTree(session.child?.pid);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function runAppSmoke() {
  assert(process.platform === "win32", "smoke:m1 must run on Windows.");
  await mkdir(userDataDir, { recursive: true });

  let session;
  let cdp;
  try {
    session = await launchPackagedApp("initial");
    cdp = session.cdp;
    if (assetMode === "m2a") {
      await runM2aCdpChecks(cdp);
    } else {
      await runCdpChecks(cdp);
    }
    await writeSettingsForPersistence(cdp);
    await closePackagedApp(session);
    session = null;

    session = await launchPackagedApp("restart");
    cdp = session.cdp;
    await runSettingsPersistenceCheck(cdp);
  } finally {
    await closePackagedApp(session);
    await removeWithRetry(userDataDir);
  }
  log("Process tree cleaned.");
}

await runSafetyScan();
if (assetMode === "m2a") {
  await runM2aSourceControlChecks();
  await runM2aBuiltManifestChecks();
}
await runPackageChecks();
await runAppSmoke();
log(`${assetMode.toUpperCase()} smoke passed.`);
