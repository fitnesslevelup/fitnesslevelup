import { describe, expect, it } from "vitest";
import { createState, logQuest } from "./engine";
import { chooseCopy } from "./sync-rules";

const fresh = () => createState("2026-11-19");
const played = () => logQuest(logQuest(fresh(), "push", 999).state, "core", 999).state;

describe("cross-device sync", () => {
  it("uploads this device when the account has no cloud progress yet", () => {
    expect(chooseCopy(played(), null, true)).toBe("upload");
  });

  it("a new device downloads the account's progress instead of starting from zero", () => {
    expect(chooseCopy(fresh(), played(), false)).toBe("download");
    expect(chooseCopy(fresh(), played(), true)).toBe("download");
  });

  it("offline progress that is further along than the cloud is uploaded, not lost", () => {
    const cloud = logQuest(fresh(), "push", 999).state;
    expect(chooseCopy(played(), cloud, true)).toBe("upload");
  });

  it("an old device with nothing new takes the cloud copy", () => {
    expect(chooseCopy(played(), fresh(), false)).toBe("download");
  });
});
