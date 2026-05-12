import { TextChannel, type Message } from "discord.js";
import ModuleBuilder, { Event } from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";
import embeds from "../utils/embeds";

export default class StickyMessagesModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("messageCreate")
  async resendOldStickyMessage(message: Message<boolean>) {
    if (message.author.bot) return;

    const stickyMessages = db
      .select()
      .from(schemas.stickyMessages)
      .where(eq(schemas.stickyMessages.channelId, message.channel.id))
      .all();

    for (let sticky of stickyMessages) {
      const msg = await message.channel.messages.fetch(sticky.messageId);
      try {
        await msg.delete();
      } catch (e) {
        console.error(e);
      }

      const embed = await embeds.base();

      embed.setDescription(sticky.content);

      const newMsg = await (message.channel as TextChannel).send({
        embeds: [embed],
      });

      await db
        .update(schemas.stickyMessages)
        .set({ messageId: newMsg.id })
        .where(eq(schemas.stickyMessages.messageId, sticky.messageId));
    }
  }
}
