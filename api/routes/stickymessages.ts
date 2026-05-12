import { Router } from "express";
import client from "../../client";
import auth from "../middlewares/auth";
import db from "../../utils/db";
import schemas from "../../schemas";
import embeds from "../../utils/embeds";
import type { TextChannel } from "discord.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", auth, async (req, res) => {
  const stickyMessages = db.select().from(schemas.stickyMessages).all();
  res.json(stickyMessages);
});

router.delete("/:id", auth, async (req, res) => {
  await db
    .delete(schemas.stickyMessages)
    .where(eq(schemas.stickyMessages.id, parseInt(req.params.id as string)));

  res.json({ message: "ok" });
});

router.post("/", auth, async (req, res) => {
  const { channelId, content } = req.body;

  if (!channelId)
    return res.status(500).send({ error: "No channelId provided." });

  if (!content) return res.status(500).send({ error: "No content provided." });

  const guild = await client.guilds.fetch(process.env.GUILD_ID!);

  const channel = (await guild.channels.fetch(channelId)) as TextChannel;

  const embed = await embeds.base();

  embed.setDescription(content);

  const mesg = await channel.send({ embeds: [embed] });

  await db
    .insert(schemas.stickyMessages)
    .values({ channelId, content, messageId: mesg.id });

  res.json({ message: "ok" });
});

export default router;
