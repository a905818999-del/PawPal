import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const APP_NAME = "DeskPet";
export const STORE_NAME = "deskpet";

export const PET_WINDOW = {
  width: 220,
  height: 340
} as const;

export const SETTINGS_WINDOW = {
  width: 760,
  height: 680
} as const;

export const PRELOAD_PATH = join(__dirname, "../preload/index.cjs");
export const RENDERER_HTML_PATH = join(__dirname, "../renderer/index.html");
export const IS_DEV = Boolean(process.env.ELECTRON_RENDERER_URL);

export const BREAK_RUN_DURATION_MS = 60_000;
export const BREAK_RUN_TICK_MS = 16;

function durationFromEnv(name: string, fallbackMs: number): number {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) return fallbackMs;
  return value;
}

export const IDLE_SLEEP_DELAY_MS = durationFromEnv("DESKPET_IDLE_SLEEP_DELAY_MS", 10 * 60_000);
export const IDLE_SLEEP_DURATION_MS = durationFromEnv(
  "DESKPET_IDLE_SLEEP_DURATION_MS",
  10 * 60_000
);
