import {
  channelMention,
  Message,
  MessageReaction,
  TextChannel,
  User,
  userMention,
  type MessageReactionEventDetails,
  type PartialMessageReaction,
  type PartialUser,
} from "discord.js";
import ModuleBuilder, { Event } from "../../utils/module/ModuleBuilder";
import starboard from "../../settings/starboard.json";
import embeds from "../../utils/embeds";

export default class StarboardModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("messageReactionAdd")
  async starReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    details: MessageReactionEventDetails,
  ) {
    if (user.bot) return;
    if (!reaction.message.guild) return;
    if (reaction.emoji.name !== "⭐") return;
    const starboardChannel = (await reaction.message.guild.channels.fetch(
      starboard.channelId,
    )) as TextChannel;

    const messages = await starboardChannel.messages.fetch();

    for (let [_, m] of messages) {
      if (
        m.embeds &&
        m.embeds[0] &&
        m.embeds[0].footer &&
        m.embeds[0].footer.text === reaction.message.id
      ) {
        m.edit(
          `**⭐ ${reaction.users.cache.size}** - Posted in ${channelMention(reaction.message.channel.id)} by ${userMention(reaction.message.author!.id)}.`,
        );
        return;
      }
    }

    if (reaction.users.cache.size < starboard.minReactions) return;

    const embed = await embeds.base();
    embed
      .setTitle(reaction.message.author!.displayName)
      .setDescription(reaction.message.content)
      .setImage(reaction.message.attachments.first()?.url || null)
      .setThumbnail(reaction.message.author!.displayAvatarURL())
      .setFooter({ text: reaction.message.id });

    await starboardChannel.send({
      embeds: [embed],
      content: `**⭐ ${reaction.users.cache.size}** - Posted in ${channelMention(reaction.message.channel.id)} by ${userMention(reaction.message.author!.id)}.`,
    });
  }
}
