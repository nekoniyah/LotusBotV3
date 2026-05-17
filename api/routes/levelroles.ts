import { Router } from "express";
import auth from "../middlewares/auth";
import schemas from "../../schemas";
import db from "../../utils/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get all level roles
router.get("/", auth, async (req, res) => {
  const levelRoles = db.select().from(schemas.levelRoles).all();
  res.json(levelRoles);
});

// Get a specific level role by level
router.get("/:level", auth, async (req, res) => {
  const level = parseInt(req.params.level as string);

  if (isNaN(level)) {
    return res.status(400).json({ message: "Invalid level" });
  }

  const levelRole = db
    .select()
    .from(schemas.levelRoles)
    .where(eq(schemas.levelRoles.level, level))
    .get();

  if (!levelRole) {
    return res.status(404).json({ message: "Level role not found" });
  }

  res.json(levelRole);
});

// Create a new level role
router.post("/", auth, async (req, res) => {
  const { level, roleId, multiplier } = req.body;

  if (level === undefined || !roleId || multiplier === undefined) {
    return res
      .status(400)
      .json({ message: "Missing required fields: level, roleId, multiplier" });
  }

  const parsedLevel = parseInt(level);
  const parsedMultiplier = parseFloat(multiplier);

  if (isNaN(parsedLevel) || parsedLevel < 1) {
    return res
      .status(400)
      .json({ message: "Level must be a positive integer" });
  }

  if (isNaN(parsedMultiplier) || parsedMultiplier < 1) {
    return res.status(400).json({ message: "Multiplier must be at least 1" });
  }

  // Check if level role already exists for this level
  const existingByLevel = db
    .select()
    .from(schemas.levelRoles)
    .where(eq(schemas.levelRoles.level, parsedLevel))
    .get();

  if (existingByLevel) {
    return res
      .status(400)
      .json({ message: "A level role already exists for this level" });
  }

  // Check if role is already assigned to another level
  const existingByRole = db
    .select()
    .from(schemas.levelRoles)
    .where(eq(schemas.levelRoles.roleId, roleId))
    .get();

  if (existingByRole) {
    return res
      .status(400)
      .json({ message: "This role is already assigned to another level" });
  }

  await db.insert(schemas.levelRoles).values({
    level: parsedLevel,
    roleId,
    multiplier: parsedMultiplier,
  });

  res.status(201).json({ message: "Level role created successfully" });
});

// Update a level role
router.put("/:level", auth, async (req, res) => {
  const level = parseInt(req.params.level as string);
  const { roleId, multiplier } = req.body;

  if (isNaN(level)) {
    return res.status(400).json({ message: "Invalid level" });
  }

  const existingLevelRole = db
    .select()
    .from(schemas.levelRoles)
    .where(eq(schemas.levelRoles.level, level))
    .get();

  if (!existingLevelRole) {
    return res.status(404).json({ message: "Level role not found" });
  }

  const updateData: { roleId?: string; multiplier?: number } = {};

  if (roleId) {
    // Check if role is already assigned to another level
    const existingByRole = db
      .select()
      .from(schemas.levelRoles)
      .where(eq(schemas.levelRoles.roleId, roleId))
      .get();

    if (existingByRole && existingByRole.level !== level) {
      return res
        .status(400)
        .json({ message: "This role is already assigned to another level" });
    }

    updateData.roleId = roleId;
  }

  if (multiplier !== undefined) {
    const parsedMultiplier = parseFloat(multiplier);
    if (isNaN(parsedMultiplier) || parsedMultiplier < 1) {
      return res.status(400).json({ message: "Multiplier must be at least 1" });
    }
    updateData.multiplier = parsedMultiplier;
  }

  await db
    .update(schemas.levelRoles)
    .set(updateData)
    .where(eq(schemas.levelRoles.level, level));

  res.json({ message: "Level role updated successfully" });
});

// Delete a level role
router.delete("/:level", auth, async (req, res) => {
  const level = parseInt(req.params.level as string);

  if (isNaN(level)) {
    return res.status(400).json({ message: "Invalid level" });
  }

  const existingLevelRole = db
    .select()
    .from(schemas.levelRoles)
    .where(eq(schemas.levelRoles.level, level))
    .get();

  if (!existingLevelRole) {
    return res.status(404).json({ message: "Level role not found" });
  }

  await db
    .delete(schemas.levelRoles)
    .where(eq(schemas.levelRoles.level, level));

  res.json({ message: "Level role deleted successfully" });
});

export default router;
