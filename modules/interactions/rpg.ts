import type { ChatInputCommandInteraction } from "discord.js";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";
import embeds from "../../utils/embeds";

export const type = "command";
export const identifier = "rpg";

export const buyableStats = [
  {
    name: "Health",
    id: "health",
    text: "Increases your health by 20 points.",
    cost: 100,
    max: 1000,
    increment: 20,
    emoji: "❤️",
  },
  {
    name: "Attack",
    id: "attack",
    text: "Increases your attack damage by 5 points.",
    cost: 100,
    max: 1000,
    increment: 5,
    emoji: "⚔️",
  },
];

export default async function execute(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.inGuild())
    return interaction.editReply("This command can only be used in a server.");

  const action = interaction.options.getString("action", true);
  const userStats = await db
    .select()
    .from(schemas.rpgStats)
    .where(eq(schemas.rpgStats.userId, interaction.user.id))
    .get();

  const profile = await db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  if (action === "stats") {
    const baseHealth = 100 + 20 * (profile?.level ?? 0 + 1); // Base health increases by 20 every level
    const embed = await embeds.base();
    const attackDamage = 2 + 5 * (profile?.level ?? 0); // Base attack damage increases by 5 every level
    embed.setTitle(`${interaction.user.username}'s RPG Stats`).addFields(
      { name: "Health", value: `${baseHealth} ❤️`, inline: true },
      {
        name: "Bonus Health",
        value: `${userStats?.bonusHealth ?? 0} ❤️`,
        inline: true,
      },
      {
        name: "Bonus Attack",
        value: `${userStats?.bonusAttack ?? 0} ⚔️`,
        inline: true,
      },
      { name: "Attack Damage", value: `${attackDamage} ⚔️`, inline: true },
    );
    return interaction.editReply({ embeds: [embed] });
  }

  if (action === "shop") {
    const embed = await embeds.base();
    embed
      .setTitle(`${interaction.user.username}'s RPG Shop`)
      .setDescription("Lotus RPG's Shop")
      .addFields(
        ...buyableStats.map((stat) => ({
          name: `${stat.emoji} ${stat.name}`,
          value: `${stat.text}\nCost: ${stat.cost} coins`,
          inline: true,
        })),
      );
    return interaction.editReply({ embeds: [embed] });
  }

  if (action === "buy") {
    let description = "";

    let i = 0;
    for (let stat of buyableStats) {
      description +=
        "`" +
        i +
        "`. " +
        stat.emoji +
        " **" +
        stat.name +
        "**\nCost: " +
        stat.cost +
        " coins\n" +
        stat.text +
        "\n";
      i++;
    }

    const embed = await embeds.base();
    embed
      .setTitle(`${interaction.user.username}'s RPG Shop`)
      .setDescription(
        description + "\n\nReply with the number of the stat you want to buy.",
      );

    await interaction.editReply({ embeds: [embed] });

    const filter = (m: any) => m.author.id === interaction.user.id;
    const collector = interaction.channel?.createMessageCollector({
      filter,
      time: 60000,
      max: 1,
    });

    collector?.on("collect", async (m) => {
      const choice = parseInt(m.content);
      if (isNaN(choice) || choice < 0 || choice >= buyableStats.length) {
        return interaction.followUp("Invalid choice. Please try again.");
      }

      const stat = buyableStats[choice];
      if (!stat) {
        return interaction.followUp("Invalid choice. Please try again.");
      }
      if ((profile?.bank ?? 0) < stat.cost) {
        return interaction.followUp(
          "You don't have enough coins to buy this stat.",
        );
      }

      const existingStats = await db
        .select()
        .from(schemas.rpgStats)
        .where(eq(schemas.rpgStats.userId, interaction.user.id))
        .get();

      if (stat.id === "attack") {
        const currentBonusAttack = userStats?.bonusAttack ?? 0;
        if (currentBonusAttack >= stat.max) {
          return interaction.followUp(
            "You have already reached the maximum bonus attack.",
          );
        }

        const newBonusAttack = Math.min(
          currentBonusAttack + stat.increment,
          stat.max,
        );

        if (existingStats) {
          await db
            .update(schemas.rpgStats)
            .set({ bonusAttack: newBonusAttack })
            .where(eq(schemas.rpgStats.userId, interaction.user.id));
        } else {
          await db.insert(schemas.rpgStats).values({
            userId: interaction.user.id,
            bonusAttack: newBonusAttack,
          });
        }

        // Remove the cost from the user's profile

        await db
          .update(schemas.profiles)
          .set({ money: (profile?.money ?? 0) - stat.cost })
          .where(eq(schemas.profiles.userId, interaction.user.id));

        await interaction.followUp(
          `You bought ${stat.emoji} **${stat.name}** for ${stat.cost} coins! Your bonus attack is now ${newBonusAttack} ⚔️.`,
        );
        return;
      }

      if (stat.id === "health") {
        const currentBonusHealth = userStats?.bonusHealth ?? 0;
        if (currentBonusHealth >= stat.max) {
          return interaction.followUp(
            "You have already reached the maximum bonus health.",
          );
        }
        const newBonusHealth = Math.min(
          currentBonusHealth + stat.increment,
          stat.max,
        );

        if (existingStats) {
          await db
            .update(schemas.rpgStats)
            .set({ bonusHealth: newBonusHealth })
            .where(eq(schemas.rpgStats.userId, interaction.user.id));
        } else {
          await db.insert(schemas.rpgStats).values({
            userId: interaction.user.id,
            bonusHealth: newBonusHealth,
          });
        }

        // Remove the cost from the user's profile

        await db
          .update(schemas.profiles)
          .set({ money: (profile?.money ?? 0) - stat.cost })
          .where(eq(schemas.profiles.userId, interaction.user.id));

        await interaction.followUp(
          `You bought ${stat.emoji} **${stat.name}** for ${stat.cost} coins! Your bonus health is now ${newBonusHealth} ❤️.`,
        );
      }
    });
  }
}
