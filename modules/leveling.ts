import { TextChannel, type Message } from "discord.js";
import ModuleBuilder, { Event } from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";
import embeds from "../utils/embeds";
import leveling from "../settings/leveling.json";

export default class StickyMessagesModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  static async getProfile(id: string) {
    let p = db
      .select()
      .from(schemas.profiles)
      .where(eq(schemas.profiles.userId, id))
      .get();

    if (!p) {
      await db.insert(schemas.profiles).values({ userId: id });

      p = db
        .select()
        .from(schemas.profiles)
        .where(eq(schemas.profiles.userId, id))
        .get()!;
    }

    return p;
  }

  static async updateProfile(
    id: string,
    data: Partial<typeof schemas.profiles.$inferSelect>,
  ) {
    await StickyMessagesModule.getProfile(id);

    await db
      .update(schemas.profiles)
      .set(data)
      .where(eq(schemas.profiles.userId, id));

    return StickyMessagesModule.getProfile(id);
  }

  @Event("messageCreate")
  async LotusBuckPerMessage(message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const p = await StickyMessagesModule.getProfile(message.author.id);

    await StickyMessagesModule.updateProfile(message.author.id, {
      money: p.money + 1,
    });
  }

  @Event("messageCreate")
  async experienceAndLeveling(message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const p = await StickyMessagesModule.getProfile(message.author.id);
    let experienceGained = 10;

    if (message.content.length) {
      experienceGained = Math.floor(message.content.length / 2);
    }

    let nextLevel = false;

    const expToReach =
      leveling.baseExperienceNeeded + p.level * leveling.perLevel;

    if (p.experience + experienceGained === expToReach) {
      await StickyMessagesModule.updateProfile(message.author.id, {
        experience: 0,
        level: p.level + 1,
      });

      nextLevel = true;
    } else if (p.experience + experienceGained > expToReach) {
      const diff = p.experience + experienceGained - expToReach;

      await StickyMessagesModule.updateProfile(message.author.id, {
        experience: diff,
        level: p.level + 1,
      });

      nextLevel = true;
    } else {
      await StickyMessagesModule.updateProfile(message.author.id, {
        experience: p.experience + experienceGained,
      });
    }

    if (nextLevel) {
      const channel = (await message.guild.channels.fetch(
        leveling.channelId,
      )) as TextChannel;
      const profile = await StickyMessagesModule.getProfile(message.author.id);

      const embed = await embeds.base();
      embed
        .setTitle("A sprout leveled Up!")
        .setDescription(
          `Congrats, ${message.author.username}! You passed level ${profile.level}`,
        )
        .setImage(message.guild.bannerURL())
        .setAuthor({
          name: message.author.displayName,
          iconURL: message.author.displayAvatarURL(),
        })
        .setThumbnail(message.author.displayAvatarURL());

      await channel.send({ embeds: [embed] });
    }
  }
}
