import type { Handler } from "express";
import got from "got";
import client from "../../client";

const auth: Handler = async (req, res, next) => {
  const token = req.headers.authorization as string;

  if (!token) return res.status(403).json({ message: "forbidden" });

  try {
    const r = await got
      .get(`https://discord.com/api/users/@me`, {
        headers: { Authorization: token },
      })
      .json();

    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const member = await guild.members.fetch((r as any).id);

    if (!member) return res.status(403).json({ message: "forbidden" });
    if (!member.permissions.has("Administrator"))
      return res.status(403).json({ message: "forbidden" });

    req.user = r as any;
    next();
  } catch (e) {
    console.error(e);
    res.status(403).json({ message: "forbidden" });
  }
};

export default auth;
