import { Router } from "express";
import client from "../../client";
import auth from "../middlewares/auth";

const router = Router();

router.get("/", auth, async (req, res) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const roles = (await guild.roles.fetch()).toJSON().filter((c) => !!c);

  res.json(roles);
});

router.get("/:id", auth, async (req, res) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const role = await guild.roles.fetch(req.params.id as string);

  res.json(role);
});

export default router;
