// Shared by the QA scripts: find or start the production server.

import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const QA_PORT = 3210;

export type Server = { base: string; stop: () => void };

export async function reachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return response.status < 500;
  } catch {
    return false;
  }
}

/** Reuses a server that is already answering on the QA port, otherwise starts "next start". */
export async function startServer(): Promise<Server> {
  const base = `http://127.0.0.1:${QA_PORT}`;
  if (await reachable(base)) return { base, stop: () => undefined };

  if (!fs.existsSync(path.join(".next", "BUILD_ID"))) {
    throw new Error('No production build found. Run "npm run build" first, or pass --base=<url>.');
  }
  const next = path.join("node_modules", "next", "dist", "bin", "next");
  const child: ChildProcess = spawn(process.execPath, [next, "start", "-p", String(QA_PORT)], {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await reachable(base)) return { base, stop: () => child.kill() };
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  child.kill();
  throw new Error("The production server did not start within 60 seconds.");
}
