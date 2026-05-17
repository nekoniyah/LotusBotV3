import type { ChatInputCommandInteraction } from "discord.js";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";
import embeds from "../../utils/embeds";

export const type = "command";
export const identifier = "rob";

export default async function (interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user", true);

  const targetProfile = await db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, user.id))
    .get();

  const sourceProfile = await db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  if (targetProfile!.money <= 0) {
    const embed = await embeds.error("This user has no money to rob!");
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const robAmount = Math.floor(Math.random() * targetProfile!.money);

  const targetNewMoney = targetProfile!.money - robAmount;
  const sourceNewMoney = sourceProfile!.money + robAmount;

  await db
    .update(schemas.profiles)
    .set({ money: targetNewMoney })
    .where(eq(schemas.profiles.userId, user.id));

  await db
    .update(schemas.profiles)
    .set({ money: sourceNewMoney })
    .where(eq(schemas.profiles.userId, interaction.user.id));

  const embed = await embeds.success(
    `You robbed ${robAmount} from ${user.username}!`,
  );
  await interaction.editReply({ embeds: [embed] });
}
