import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  GuildMember,
  Role,
  roleMention,
  TextChannel,
  type ChatInputCommandInteraction,
} from "discord.js";
import economy from "../../settings/economy.json";
import embeds from "../../utils/embeds";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";
import path from "path";
import { writeFileSync } from "fs";

let itemInfos = [
  {
    name: "Mute",
    id: "mute",
    text: "Mute a member for 5 minutes",
    cost: 5000,
  },
  {
    name: "Echo Engine Role",
    id: "echo",
    text: "Gives the Echo Engine Role",
    roleId: "1483565745941254164",
    cost: 4000,
  },
  {
    name: "Devia Solis Role",
    id: "devia",
    text: "Gives the Devia Solis Role",
    roleId: "1483568317087092816",
    cost: 4000,
  },
  {
    name: "Violettas Role",
    id: "violettas",
    text: "Gives the Violettas Role",
    roleId: "1418376694783414413",
    cost: 4000,
  },
  {
    name: "Nightshade Lotus Role",
    id: "night",
    text: "Gives the Nightshade Lotus Role",
    roleid: "1418347623378587689",
    cost: 4000,
  },
  {
    name: "Radiant Spicebrush Role",
    id: "radiant",
    roleId: "1418374258505023553",
    text: "Gives the Radiant Spicebrush Role",
    cost: 4000,
  },
  {
    name: "Crystal Gambit Role",
    id: "crystal",
    roleId: "1431952274434949151",
    text: "Gives the Crystal Gambit Role",
    cost: 4000,
  },
  {
    name: "Post in a forum channel",
    id: "forum",
    text: "Unlocks forum channels to make one post in one of them.",
    cost: 1000,
  },
];

export const type = "command";
export const identifier = "shop";

const shop = async function (
  interaction: ChatInputCommandInteraction,
  i?: number,
) {
  if (!interaction.guild) return;
  const profile = db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  if (!profile) {
    const embed = await embeds.error(
      "It seems you haven't done anything yet, retry later.",
    );

    await interaction.editReply({
      components: [],
      embeds: [embed],
      content: undefined,
    });
    return;
  }

  let index = i && !isNaN(i) ? i : 0;

  let selectedItem = itemInfos[index]!;

  const backButton = new ButtonBuilder()
    .setCustomId(`shop-goto-${index - 1}`)
    .setDisabled(itemInfos[index - 1] == null)
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Primary);

  const buyButton = new ButtonBuilder()
    .setCustomId(`buy-${index}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(`Buy for ${selectedItem.cost} ${economy.emoji} ${economy.name}`)
    .setDisabled(profile.money < selectedItem.cost);

  const nextButton = new ButtonBuilder()
    .setCustomId(`shop-goto-${index + 1}`)
    .setDisabled(itemInfos[index + 1] == null)
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().setComponents(
    backButton,
    buyButton,
    nextButton,
  );

  const embed = await embeds.base();
  embed
    .setTitle(`${selectedItem.name}`)
    .setDescription(selectedItem.text)
    .setThumbnail(interaction.guild.iconURL());

  const msg = await interaction.editReply({
    embeds: [embed],
    components: [row.toJSON()],
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === interaction.user.id,
  });

  collector.on("collect", async (i) => {
    if (i.customId.startsWith("shop-goto-")) {
      let index = parseInt(i.customId.replace("shop-goto-", ""));

      i.reply({ flags: ["Ephemeral"], content: "_ _" }).then((r) => r.delete());
      await shop(interaction, index);
    } else {
      const index = parseInt(i.customId.split("-")[1]!);

      if (itemInfos[index]!.id === "mute") return await muteUserRequest(i);
      if (itemInfos[index]!.id === "echo")
        return await giveRole(i, itemInfos[index]!.roleId!);
      if (itemInfos[index]!.id === "devia")
        return await giveRole(i, itemInfos[index]!.roleId!);
      if (itemInfos[index]!.id === "violettas")
        return await giveRole(i, itemInfos[index]!.roleId!);
      if (itemInfos[index]!.id === "night")
        return await giveRole(i, itemInfos[index]!.roleId!);
      if (itemInfos[index]!.id === "radiant")
        return await giveRole(i, itemInfos[index]!.roleId!);
      if (itemInfos[index]!.id === "crystal")
        return await giveRole(i, itemInfos[index]!.roleId!);

      await db
        .update(schemas.profiles)
        .set({ money: profile.money - itemInfos[index]!.cost })
        .where(eq(schemas.profiles.userId, interaction.user.id));

      await shop(interaction, index);
    }
  });
};

async function muteUserRequest(interaction: ButtonInteraction) {
  await interaction.reply({
    content: `Please mention a user to mute for 5 minutes.`,
  });

  const collector = (interaction.channel as TextChannel).createMessageCollector(
    {
      filter: (m) => m.author.id === interaction.user.id,
    },
  );

  collector.on("collect", async (msg) => {
    let member: GuildMember | null = null;

    if (msg.mentions.members) {
      const mention = msg.mentions.members.first();

      if (mention) member = mention;
    }

    if (member) {
      await member.timeout(60_000 * 5);

      await interaction.editReply({
        content: `${member.user.username} muted for 5 minutes.`,
      });

      collector.stop();
    } else {
      await interaction.editReply({
        content: `Please mention a user to mute for 5 minutes.`,
      });
    }

    await msg.delete();
  });
}

async function giveRole(interaction: ButtonInteraction, roleId: string) {
  const role = (await interaction.guild!.roles.fetch(roleId))!;
  const member = await interaction.guild!.members.fetch(interaction.user.id);

  await member.roles.add(role);

  await interaction.reply({
    embeds: [
      await embeds.success(`Successfully bought ${roleMention(role.id)} role!`),
    ],
    allowedMentions: { parse: [] },
  });
}

export default shop;
