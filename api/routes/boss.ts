import { Router } from "express";
import auth from "../middlewares/auth";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const router = Router();

const bossConfigPath = path.join(process.cwd(), "settings", "boss.json");

function readConfig(): { baseThreshold: number; thresholdIncrement: number } {
  return JSON.parse(readFileSync(bossConfigPath, "utf-8"));
}

// GET /api/boss — return current boss.json config
router.get("/", auth, (req, res) => {
  res.json(readConfig());
});

// PUT /api/boss — update boss.json config
router.put("/", auth, (req, res) => {
  const { baseThreshold, thresholdIncrement } = req.body;

  if (baseThreshold === undefined && thresholdIncrement === undefined) {
    return res.status(400).json({ error: "No fields provided to update." });
  }

  const current = readConfig();

  const parsedBase =
    baseThreshold !== undefined ? parseInt(baseThreshold) : undefined;
  const parsedIncrement =
    thresholdIncrement !== undefined ? parseInt(thresholdIncrement) : undefined;

  if (parsedBase !== undefined && (isNaN(parsedBase) || parsedBase < 1)) {
    return res
      .status(400)
      .json({ error: "baseThreshold must be a positive integer." });
  }

  if (
    parsedIncrement !== undefined &&
    (isNaN(parsedIncrement) || parsedIncrement < 1)
  ) {
    return res
      .status(400)
      .json({ error: "thresholdIncrement must be a positive integer." });
  }

  const updated = {
    baseThreshold: parsedBase ?? current.baseThreshold,
    thresholdIncrement: parsedIncrement ?? current.thresholdIncrement,
  };

  writeFileSync(bossConfigPath, JSON.stringify(updated, null, 2));

  // Also update the live bossUtil threshold so the running bot reflects the change
  // We only update the base threshold — the current in-memory threshold may already
  // have been incremented from boss fights, so we only apply the delta.
  try {
    const bossUtil = require("../../utils/bossUtil");
    if (parsedBase !== undefined) {
      const delta = parsedBase - current.baseThreshold;
      bossUtil.threshold = bossUtil.threshold + delta;
    }
  } catch {
    // bossUtil may not be available in all environments; file is always updated
  }

  res.json({ message: "ok", config: updated });
});

export default router;
