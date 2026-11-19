import type { GameState } from "./engine";

/** How far a save has progressed; used to never let a newer device's save lose to an older one. */
export function progressScore(s: GameState): number {
  return s.totalXp * 100 + s.completed.length * 10 + s.poses.length;
}

/**
 * Decide which copy wins when a device signs in or reconnects.
 * - No cloud copy yet: upload this device.
 * - This device has changes the cloud never got and is further along: upload this device.
 * - Otherwise the cloud copy is the latest: download it.
 */
export function chooseCopy(local: GameState, cloud: GameState | null, localUnsynced: boolean): "upload" | "download" {
  if (!cloud) return "upload";
  if (localUnsynced && progressScore(local) > progressScore(cloud)) return "upload";
  return "download";
}
