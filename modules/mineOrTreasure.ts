import { TextChannel, type Message } from "discord.js";
import ModuleBuilder, { Event } from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";
import embeds from "../utils/embeds";
import economy from "../settings/economy.json";

export default class MineOrTreasure extends ModuleBuilder {
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
    await MineOrTreasure.getProfile(id);

    await db
      .update(schemas.profiles)
      .set(data)
      .where(eq(schemas.profiles.userId, id));

    return MineOrTreasure.getProfile(id);
  }

  @Event("messageCreate")
  async trigger(message: Message<boolean>) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const rd = Math.floor(Math.random() * 1000);
    const p = await MineOrTreasure.getProfile(message.author.id);

    if (rd <= 5) {
      // Treasure

      const amount = 30;
      await MineOrTreasure.updateProfile(message.author.id, {
        ...p,
        money: p.money + amount,
      });

      const embed = await embeds.success(
        `You discovered a treasure! +${amount} ${economy.emoji} ${economy.name}`,
      );

      message.reply({ embeds: [embed] });
    } else if (rd <= 7) {
      // Mine

      const amount = 30;
      await MineOrTreasure.updateProfile(message.author.id, {
        ...p,
        money: p.money - amount,
      });

      const embed = await embeds.success(
        `During your travel to the mine, you lost ${amount} ${economy.emoji} ${economy.name}`,
      );

      message.reply({ embeds: [embed] });
    }
  }
}
