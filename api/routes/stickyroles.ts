import { Router } from "express";
import auth from "../middlewares/auth";
import schemas from "../../schemas";
import db from "../../utils/db";
import { eq } from "drizzle-orm";

const router = Router();

// Get all sticky roles
router.get("/", auth, async (req, res) => {
  const stickyRoles = db.select().from(schemas.stickyRoles).all();
  res.json(stickyRoles);
});

// Add a sticky role
router.post("/", auth, async (req, res) => {
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: "Missing required field: roleId" });
  }

  // Check if role is already a sticky role
  const existing = db
    .select()
    .from(schemas.stickyRoles)
    .where(eq(schemas.stickyRoles.roleId, roleId))
    .get();

  if (existing) {
    return res.status(400).json({ message: "This role is already a sticky role" });
  }

  await db.insert(schemas.stickyRoles).values({ roleId });

  res.status(201).json({ message: "Sticky role added successfully" });
});

// Delete a sticky role
router.delete("/:roleId", auth, async (req, res) => {
  const { roleId } = req.params;

  const existing = db
    .select()
    .from(schemas.stickyRoles)
    .where(eq(schemas.stickyRoles.roleId, roleId))
    .get();

  if (!existing) {
    return res.status(404).json({ message: "Sticky role not found" });
  }

  await db
    .delete(schemas.stickyRoles)
    .where(eq(schemas.stickyRoles.roleId, roleId));

  res.json({ message: "Sticky role removed successfully" });
});

export default router;
