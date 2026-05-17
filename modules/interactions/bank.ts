import type { ChatInputCommandInteraction } from "discord.js";
import schemas from "../../schemas";
import db from "../../utils/db";
import { eq } from "drizzle-orm";
import embeds from "../../utils/embeds";

export const type = "command";
export const identifier = "bank";
export const ephemeral = true;

export default async function bank(interaction: ChatInputCommandInteraction) {
  const profile = await db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  const action = interaction.options.getString("action", true);

  if (action === "balance") {
    const embed = await embeds.base();

    embed
      .setTitle("Bank")
      .setDescription(`You have ${profile!.bank} in your bank.`);

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (action === "deposit") {
    const amount = interaction.options.getNumber("amount");

    if (!amount) {
      const embed = await embeds.error(
        "You need to specify an amount to deposit.",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (amount > profile!.money) {
      const embed = await embeds.error(
        "You don't have enough money to deposit that amount.",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    await db
      .update(schemas.profiles)
      .set({
        money: profile!.money - amount,
        bank: profile!.bank + amount,
      })
      .where(eq(schemas.profiles.userId, interaction.user.id));

    const embed = await embeds.base();
    embed
      .setTitle("Bank")
      .setDescription(`You have deposited ${amount} into your bank.`);
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (action === "withdraw") {
    const amount = interaction.options.getNumber("amount");

    if (!amount) {
      const embed = await embeds.error(
        "You need to specify an amount to withdraw.",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (amount > profile!.bank) {
      const embed = await embeds.error(
        "You don't have enough money to withdraw that amount.",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    await db
      .update(schemas.profiles)
      .set({
        money: profile!.money + amount,
        bank: profile!.bank - amount,
      })
      .where(eq(schemas.profiles.userId, interaction.user.id));

    const embed = await embeds.base();
    embed
      .setTitle("Bank")
      .setDescription(`You have withdrawn ${amount} from your bank.`);
    await interaction.editReply({ embeds: [embed] });
    return;
  }
}
