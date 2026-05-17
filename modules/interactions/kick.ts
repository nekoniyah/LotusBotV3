import {
  EmbedBuilder,
  TextChannel,
  type ChatInputCommandInteraction,
} from "discord.js";
import mod from "../../settings/mod.json";
import embeds from "../../utils/embeds";

export const type = "command";
export const identifier = "kick";

export default async function kick(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const interactionMember = await interaction.guild.members.fetch(
    interaction.user.id,
  );

  if (!interactionMember.permissions.has("KickMembers")) {
    return;
  }

  const user = interaction.options.getUser("user", true);
  const member = await interaction.guild.members.fetch(user.id);

  const reason = interaction.options.getString("reason");

  const dmEmbed = new EmbedBuilder()
    .setTimestamp()
    .setThumbnail(interaction.guild.iconURL())
    .setTitle(`You have been kicked from ${interaction.guild.name}`)
    .setColor("Red")
    .setDescription(`Reason :\n \`\`\`${reason ?? "No given reason."}\`\`\``);

  // Open DM because user might not receive it. Fallback to no DM if they don't allow DMs.

  let successfulDM = false;
  try {
    const ch = await user.createDM(true);
    await ch.send({ embeds: [dmEmbed] });
    successfulDM = true;
  } catch {
    successfulDM = false;
  }

  try {
    if (member.kickable) {
      const logsChannel = (await interaction.guild.channels.fetch(
        mod.logsChannelId,
      )) as TextChannel;

      const embed = await embeds.base();
      embed.setTitle(`Member kick by ${interaction.user.username}`);

      if (successfulDM) {
        embed.setDescription(
          `They have been DMed with the cause of their kick`,
        );
      } else {
        embed.setDescription(
          `They haven't been notified because they don't accept DMs or maybe I something went wrong.`,
        );
      }

      embed.setFields({ name: "Reason", value: reason ?? "No given reason." });

      logsChannel.send({ embeds: [embed] });
    }

    await member.kick(reason ?? "No given reason.");

    await interaction.editReply(
      `> :white_check_mark: Successfully kicked member. ${successfulDM ? "Did received a DM." : "They didn't received a DM."}`,
    );
  } catch (e) {
    console.log(e);

    await interaction.editReply(
      "> :x: I can't kick the member. Maybe they are an admin or I don't have the permission to kick members..",
    );
  }
}
