import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type ChatInputCommandInteraction,
} from "discord.js";
import economy from "../../settings/economy.json";
import embeds from "../../utils/embeds";

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
    cost: 4000,
  },
  {
    name: "Devia Solis Role",
    id: "devia",
    text: "Gives the Devia Solis Role",
    cost: 4000,
  },
  {
    name: "Violettas Role",
    id: "violettas",
    text: "Gives the Violettas Role",
    cost: 4000,
  },
  {
    name: "Nightshade Lotus Role",
    id: "night",
    text: "Gives the Nightshade Lotus Role",
    cost: 4000,
  },
  {
    name: "Radiant Spicebrush Role",
    id: "radiant",
    text: "Gives the Radiant Spicebrush Role",
    cost: 4000,
  },
  {
    name: "Crystal Gambit Role",
    id: "crystal",
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
    .setLabel(`Buy for ${selectedItem.cost} ${economy.emoji} ${economy.name}`);

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
    }
  });
};

export default shop;
