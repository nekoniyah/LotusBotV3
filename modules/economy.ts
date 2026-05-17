import {
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
  type Message,
} from "discord.js";
import ModuleBuilder, {
  Event,
  SlashCommand,
} from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";
import embeds from "../utils/embeds";
import leveling from "../settings/leveling.json";

export default class EconomyModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  static applyMultiplierGain(member: GuildMember, gain: number): number {
    const levelRoles = db.select().from(schemas.levelRoles).all();

    const roles = member.roles.cache;
    let multipliers: number = 1;

    for (let [id] of roles) {
      const lvlR = levelRoles.find((l) => l.roleId === id);

      if (lvlR) {
        multipliers += lvlR.multiplier - 1;
      }
    }

    return gain * multipliers;
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
    await EconomyModule.getProfile(id);

    await db
      .update(schemas.profiles)
      .set(data)
      .where(eq(schemas.profiles.userId, id));

    return EconomyModule.getProfile(id);
  }

  @Event("messageCreate")
  async LotusBuckPerMessage(message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const p = await EconomyModule.getProfile(message.author.id);
    const member = await message.guild.members.fetch(message.author.id);

    await EconomyModule.updateProfile(message.author.id, {
      money: p.money + EconomyModule.applyMultiplierGain(member, 1),
    });
  }

  @SlashCommand("wallet", "See your wallet")
  walletCommand() {
    return new SlashCommandBuilder();
  }

  @SlashCommand("bank", "Deposit Money at your bank")
  bankCommand() {
    return new SlashCommandBuilder()
      .addStringOption((opt) =>
        opt
          .setName("action")
          .setDescription("Action to do")
          .setRequired(true)
          .addChoices(
            { name: "Deposit", value: "deposit" },
            { name: "Withdraw", value: "withdraw" },
            { name: "Balance", value: "balance" },
          ),
      )
      .addNumberOption((opt) =>
        opt.setName("amount").setDescription("Amount to deposit/withdraw"),
      );
  }

  @SlashCommand("rob", "Rob a member")
  robCommand() {
    return new SlashCommandBuilder().addUserOption((opt) =>
      opt.setName("user").setDescription("User to rob").setRequired(true),
    );
  }
}
