import { Router } from "express";
import client from "../../client";
import auth from "../middlewares/auth";

const router = Router();

router.get("/", auth, async (req, res) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const channels = (await guild.channels.fetch()).toJSON().filter((c) => !!c);

  res.json(channels);
});

router.get("/:id", auth, async (req, res) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const channel = await guild.channels.fetch(req.params.id as string);

  res.json(channel);
});

export default router;
