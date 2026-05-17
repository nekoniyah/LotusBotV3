import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  GuildMember,
  Message,
  ModalBuilder,
  Role,
  roleMention,
  TextChannel,
  User,
} from "discord.js";
import economy from "../../settings/economy.json";
import embeds from "../../utils/embeds";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";
import mod from "../../settings/mod.json";

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
  {
    name: "Custom Role",
    id: "custom",
    text: "With custom name and color",
    cost: 6000,
  },
];

export const type = "command";
export const identifier = "shop";

async function updateShopMessage(
  trigger: ChatInputCommandInteraction | ButtonInteraction,
  index: number = 0,
) {
  // 1. Get the Profile (Acknowledge this might take time)
  const userId = trigger.user.id;
  const profile = db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, userId))
    .get();

  if (!profile) {
    const embed = await embeds.error(
      "It seems you haven't done anything yet, retry later.",
    );
    // Use the appropriate response method
    if (trigger instanceof ChatInputCommandInteraction) {
      await trigger.editReply({ embeds: [embed], components: [] });
    } else {
      await trigger.update({ embeds: [embed], components: [] });
    }
    return;
  }

  const selectedItem = itemInfos[index]!;

  // 2. Build Components
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

  const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
    backButton,
    buyButton,
    nextButton,
  );

  const embed = (await embeds.base())
    .setTitle(`${selectedItem.name}`)
    .setDescription(selectedItem.text)
    .setThumbnail(trigger.guild!.iconURL());

  // 3. CRITICAL FIX: Use .update() for buttons, .editReply() for the slash command
  let message: Message;
  if (trigger instanceof ChatInputCommandInteraction) {
    message = await trigger.editReply({
      content: "",
      embeds: [embed],
      components: [row],
    });
  } else {
    // This acknowledges the button click AND updates the message
    await trigger.update({
      embeds: [embed],
      components: [row],
    });
    message = trigger.message;
  }

  // 4. Collector logic
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (btn) => btn.user.id === userId,
    max: 1,
    time: 60000, // Good practice to add a timeout
  });

  collector.on("collect", async (i) => {
    if (i.customId.startsWith("shop-goto-")) {
      const nextIdx = parseInt(i.customId.replace("shop-goto-", ""));
      // Pass the NEW interaction 'i' to the next call
      await updateShopMessage(i, nextIdx);
    } else {
      const idx = parseInt(i.customId.split("-")[1]!);
      const item = itemInfos[idx]!;

      let res = false;
      // Handle specific item logic
      if (item.id === "mute") {
        res = await muteUserRequest(i);
      }

      // For roles, use the roleId (check your object keys, one had a lowercase 'id')
      if (item.roleId) {
        res = await giveRole(i, item.roleId);
      }

      if (item.id === "custom") {
        res = await customRole(i);
      }

      if (item.id === "forum") {
        res = await forum(i);
      }

      if (res) {
        // Default buy logic
        await db
          .update(schemas.profiles)
          .set({ money: profile.money - item.cost })
          .where(eq(schemas.profiles.userId, userId));
      }

      await updateShopMessage(i, idx);
    }
  });
}

// Initial command entry point
export const shop = async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await updateShopMessage(interaction, 0);
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

  return true;
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

  return true;
}

async function prompt(channel: TextChannel, user: User): Promise<Message> {
  return new Promise(async (resolve, reject) => {
    const msg = await channel.awaitMessages({
      max: 1,
      filter: (m) => m.author.id === user.id,
    });

    resolve(msg.first()!);
  });
}

async function customRole(interaction: ButtonInteraction) {
  if (!interaction.guild) return false;

  await interaction.reply({
    flags: ["Ephemeral"],
    content: "Please write down the name of your custom role below.",
  });

  const namePrompt = await prompt(
    interaction.channel as TextChannel,
    interaction.user,
  )!;

  const chosenName = namePrompt.content;

  await namePrompt.delete();

  const colorList = Object.keys(Colors);

  await interaction.editReply({
    content: `Now, please choose one color among these and send it below:\n
    ${colorList.map((c) => `- ${c}`).join("\n")}`,
  });

  const colorPrompt = await prompt(
    interaction.channel as TextChannel,
    interaction.user,
  );

  const chosenColor = colorPrompt.content;

  if (!colorList.includes(chosenColor)) {
    await interaction.editReply({
      content: "Please retry, the color isn't valid.",
    });
    return false;
  }

  const role = await interaction.guild.roles.create({
    colors: { primaryColor: chosenColor as keyof typeof Colors },
    name: chosenName,
  });

  const member = await interaction.guild.members.fetch(interaction.user.id);

  await member.roles.add(role);

  const logsChannel = (await interaction.guild.channels.fetch(
    mod.logsChannelId,
  )) as TextChannel;

  const embed = await embeds.base();
  embed
    .setTitle(`Member bought a custom role`)
    .setFields({ name: "Role", value: `${roleMention(role.id)}` })
    .setThumbnail(member.user.displayAvatarURL());

  await logsChannel.send({ embeds: [embed] });

  return true;
}

async function forum(interaction: ButtonInteraction) {
  if (!interaction.guild) return false;

  const channels = await interaction.guild.channels.fetch();
  const access = await db
    .select()
    .from(schemas.forumAccesses)
    .where(eq(schemas.forumAccesses.userId, interaction.user.id))
    .get();

  if (access) return false;

  await db.insert(schemas.forumAccesses).values({
    userId: interaction.user.id,
  });

  channels.forEach(async (channel) => {
    if (!channel) return;
    const ch = await channel.fetch();

    if (ch.isThreadOnly()) {
      await ch.permissionOverwrites.edit(interaction.user.id, {
        CreatePublicThreads: true,
        CreatePrivateThreads: true,
      });
    }
  });

  return true;
}

export default shop;
