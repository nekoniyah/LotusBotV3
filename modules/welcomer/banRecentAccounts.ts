import { GuildMember, TextChannel } from "discord.js";
import ModuleBuilder, { Event } from "../../utils/module/ModuleBuilder";
import dayjs from "dayjs";
import embeds from "../../utils/embeds";
import mod from "../../settings/mod.json";

export default class WelcomeModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("guildMemberAdd")
  async autoban(member: GuildMember) {
    // 1 Month Old Account = Ban

    const createdDayjs = dayjs(member.user.createdAt);
    const nowDayjs = dayjs(new Date(Date.now()));

    if (
      nowDayjs.year() === createdDayjs.year() &&
      nowDayjs.month() - createdDayjs.month() <= 1
    ) {
      const embed = await embeds.base();

      embed
        .setTitle("Your account is 1 month old or less.")
        .setDescription(
          `Therefore, we can't let you enter **${member.guild.name}**. If you are not a bot at all, wait or get experience on Discord!`,
        )
        .setThumbnail(member.guild.iconURL())
        .setImage(member.guild.bannerURL());

      try {
        await member.user.send({ embeds: [embed] });
      } catch (e) {
        console.error(e);
      }

      const embed2 = await embeds.base();
      embed2
        .setTitle(`Too recent member has been kicked`)
        .setDescription(
          `**${member.user.username}** created at: <t:${member.user.createdTimestamp}:R>`,
        )
        .setThumbnail(member.user.displayAvatarURL());

      await member.kick("1 month old");

      const logsChannel = (await member.guild.channels.fetch(
        mod.logsChannelId,
      )) as TextChannel;

      await logsChannel.send({ embeds: [embed2] });
    }
  }
}
