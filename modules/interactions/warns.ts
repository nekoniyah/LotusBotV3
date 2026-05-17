import {
  EmbedBuilder,
  TextChannel,
  type ChatInputCommandInteraction,
} from "discord.js";
import mod from "../../settings/mod.json";
import embeds from "../../utils/embeds";
import schemas from "../../schemas";
import db from "../../utils/db";
import { eq } from "drizzle-orm";

export const type = "command";
export const identifier = "warns";

export default async function warns(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const interactionMember = await interaction.guild.members.fetch(
    interaction.user.id,
  );

  if (!interactionMember.permissions.has("ManageGuild")) {
    return;
  }

  const user = interaction.options.getUser("user", true);

  const warnList = await db
    .select()
    .from(schemas.warns)
    .where(eq(schemas.warns.userId, user.id));

  let description = "";

  if (warnList.length === 0) {
    description = "This user has no warns.";
  } else {
    warnList.forEach((warn) => {
      description += `**${warn.reason}** - <@${warn.moderatorId}>\n`;
    });
  }

  const embed = await embeds.base();
  embed
    .setTitle(`Warns for ${user.username}`)
    .setDescription(description)
    .setThumbnail(user.displayAvatarURL())
    .addFields({
      name: "Total warns",
      value: warnList.length.toString(),
    })
    .setColor("Red");

  await interaction.editReply({ embeds: [embed] });
}
