import {
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
  TextChannel,
  type Interaction,
} from "discord.js";
import ModuleBuilder, {
  Event,
  SlashCommand,
} from "../utils/module/ModuleBuilder";
import {
  boss,
  updateCounter,
  counter,
  playerStats,
  setBossStats,
  setBossMessageId,
  increaseTriggerThreshold,
  resetBossFight,
  updatePlayerStats,
  threshold,
  addPlayerStats,
} from "../utils/bossUtil";
import db from "../utils/db";
import schemas from "../schemas";
import { eq } from "drizzle-orm";
import embeds from "../utils/embeds";

export default class RPGModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @SlashCommand("rpg", "View your RPG stats or buy upgrades in the RPG shop")
  rpgCommand() {
    return new SlashCommandBuilder().addStringOption((option) =>
      option
        .setName("action")
        .setDescription("What do you want to do?")
        .setRequired(true)
        .addChoices(
          { name: "View Stats", value: "stats" },
          { name: "Shop", value: "shop" },
          { name: "Buy", value: "buy" },
        ),
    );
  }

  @Event("messageCreate")
  async bossTrigger(message: Message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    updateCounter(counter + 1);

    console.log("Counter: ", counter, "Triggers at: ", threshold);

    if (boss) return;

    if (counter >= threshold) {
      // Trigger the boss fight here;
      // Boss stats is based on the 3 latest messages/members that contributed to the counter.

      let members = new Set<string>();

      let i = 0;
      let messages = await message.channel.messages.fetch();

      for (let msg of messages.values()) {
        if (i >= 2) break;
        if (msg.author.bot) continue;
        if (members.has(msg.author.id)) continue;

        members.add(msg.author.id);
        i++;
      }

      let health = 100;
      let attackDamage = 10;

      for (let memberId of members) {
        const stats = await db
          .select()
          .from(schemas.rpgStats)
          .where(eq(schemas.rpgStats.userId, memberId))
          .get();

        const profile = await db
          .select()
          .from(schemas.profiles)
          .where(eq(schemas.profiles.userId, memberId))
          .get();

        if (!stats || !profile) continue;

        health += profile.level * 100 + stats.bonusHealth;
        attackDamage += profile.level * 5;
      }

      setBossStats(health, attackDamage);

      const embed = await embeds.base();

      embed
        .setTitle("A wild boss has appeared!")
        .setDescription(
          "Unite your forces to defeat the boss and earn rewards!",
        )
        .setColor("Red")
        .addFields(
          { name: "Health", value: health.toString(), inline: true },
          {
            name: "Attack Damage",
            value: attackDamage.toString(),
            inline: true,
          },
        );

      const button = new ButtonBuilder()
        .setCustomId("btnboss-attack")
        .setLabel("Attack the Boss!")
        .setStyle(ButtonStyle.Primary);

      const bossMessage = await (message.channel as TextChannel).send({
        embeds: [embed],
        components: [{ type: 1, components: [button] }],
      });

      setBossMessageId(bossMessage.id);
    }
  }

  @Event("interactionCreate")
  async rpgInteraction(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "btnboss-attack") return;

    if (!boss) return;

    if (playerStats.has(interaction.user.id)) {
      if (playerStats.get(interaction.user.id)!.health <= 0) {
        await interaction.reply({
          content:
            "You are too weak to attack the boss! Please wait for the next boss to spawn.",
          flags: ["Ephemeral"],
        });
        return;
      }
    }

    const userId = interaction.user.id;
    const profile = await db
      .select()
      .from(schemas.profiles)
      .where(eq(schemas.profiles.userId, userId))
      .get();

    let p: { health: number; atk: number } | undefined =
      playerStats.get(userId);

    if (!p) {
      const health = 100 + 20 * (profile?.level ?? 0 + 1);
      const attackDamage = 2 + 5 * (profile?.level ?? 0);
      const bonusHealth = await db
        .select()
        .from(schemas.rpgStats)
        .where(eq(schemas.rpgStats.userId, userId))
        .get();

      p = addPlayerStats(
        userId,
        health + (bonusHealth?.bonusHealth ?? 0),
        attackDamage,
      );
    }

    // Player attacks first, then boss attacks if it's still alive. Repeat until one of them dies.

    setBossStats(boss!.health - p!.atk, boss!.atk);

    if (boss!.health <= 0) {
      resetBossFight();

      await interaction.update({
        content: `${Object.keys(playerStats)
          .map((id) => `<@${id}>`)
          .join(", ")} defeated the boss and earned rewards!`,
      });

      increaseTriggerThreshold();
    } else {
      const bossEmbed = EmbedBuilder.from(
        interaction.message.embeds[0]!,
      ).setFields(
        { name: "Health", value: boss!.health.toString(), inline: true },
        { name: "Attack Damage", value: boss!.atk.toString(), inline: true },
      );

      p!.health -= boss.atk;
      updatePlayerStats(userId, p!.health, p!.atk);

      await interaction.update({
        content: `**${interaction.user.displayName}** attacked the boss for ${p!.atk} damage! Boss health is now ${boss.health}.
        The boss attacked back for ${boss.atk} damage! ${interaction.user.displayName}'s health is now ${p!.health}.`,
        embeds: [bossEmbed],
      });

      if (p!.health <= 0) {
        await interaction.message.edit({
          content: `**${interaction.user.displayName}** was defeated by the boss! Better luck next time.`,
          embeds: [bossEmbed],
        });
      }
    }
  }
}
