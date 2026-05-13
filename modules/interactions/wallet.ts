import { type ChatInputCommandInteraction } from "discord.js";
import economy from "../../settings/economy.json";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";

export const type = "command";
export const identifier = "wallet";
export const ephemeral = true;

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const profile = db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  await interaction.editReply({
    content: `You have ${profile?.money || 0} ${economy.emoji} ${economy.name}.`,
  });
}
