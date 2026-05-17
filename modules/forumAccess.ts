import { ForumChannel, ThreadChannel, type Message } from "discord.js";
import ModuleBuilder, { Event } from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";

export default class EconomyModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("messageCreate")
  async messageCreatedInForum(message: Message) {
    if (!message.guild) return;
    if (message.channel.isDMBased()) return;

    if (!(message.channel instanceof ThreadChannel)) return;

    const access = await db
      .select()
      .from(schemas.forumAccesses)
      .where(eq(schemas.forumAccesses.userId, message.author.id));

    if (access) {
      // Delete the entry and lock all forum channels.

      await db
        .delete(schemas.forumAccesses)
        .where(eq(schemas.forumAccesses.userId, message.author.id));

      const channels = await message.guild.channels.fetch();

      channels.forEach(async (channel) => {
        if (!channel) return;
        const ch = await channel.fetch();

        if (ch.isThreadOnly()) {
          await ch.permissionOverwrites.edit(message.author.id, {
            CreatePublicThreads: false,
            CreatePrivateThreads: false,
          });
        }
      });
    }
  }
}
