import {
  Message,
  MessageReaction,
  User,
  type MessageReactionEventDetails,
  type PartialMessageReaction,
  type PartialUser,
} from "discord.js";
import ModuleBuilder, { Event } from "../../utils/module/ModuleBuilder";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";

export default class InteractionModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("messageCreate")
  async createReactionRole(message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const member = await message.guild.members.fetch(message.author.id);

    if (member.permissions.has("Administrator")) {
      if (
        message.content.startsWith("rr:") &&
        message.reference &&
        message.reference.messageId
      ) {
        const ref = await message.channel.messages.fetch(
          message.reference.messageId,
        );
        const lines = message.content.split("\n").slice(1);

        for (let l of lines) {
          const first = l.split(" ")[0]!;
          const emoji = l.split(" ")[1]!;
          const roleId = first.match(/^<@&(?<id>\d{17,20})>$/);

          if (roleId) {
            await db.insert(schemas.reactionRoles).values({
              channelId: message.channel.id,
              emoji,
              messageId: ref.id,
              roleId: roleId[1],
            });

            ref.react(emoji);
          }
        }

        message.delete();
      }
    }
  }

  @Event("messageReactionAdd")
  async reactionRoleGive(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    details: MessageReactionEventDetails,
  ) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    const reactionRoles = db.select().from(schemas.reactionRoles).all();

    for (let r of reactionRoles) {
      if (r.channelId === reaction.message.channel.id) {
        if (r.channelId === reaction.message.channel.id) {
          if (
            reaction.emoji.name === "❌" &&
            r.messageId === reaction.message.id
          ) {
            await reaction.message.reactions.removeAll();
            await db
              .delete(schemas.reactionRoles)
              .where(eq(schemas.reactionRoles.messageId, r.messageId));
          }

          if (
            r.emoji === reaction.emoji.name &&
            r.messageId === reaction.message.id
          ) {
            const role = await member.guild.roles.fetch(r.roleId);

            if (role) await member.roles.add(role);
            else {
              await db
                .delete(schemas.reactionRoles)
                .where(eq(schemas.reactionRoles.roleId, r.roleId));
            }
          }
        }
      }
    }
  }

  @Event("messageReactionRemove")
  async reactionRoleRemove(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    details: MessageReactionEventDetails,
  ) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    const reactionRoles = db.select().from(schemas.reactionRoles).all();

    for (let r of reactionRoles) {
      if (
        r.emoji === reaction.emoji.name &&
        r.messageId === reaction.message.id
      ) {
        const role = await member.guild.roles.fetch(r.roleId);

        if (role) await member.roles.remove(role);
        else {
          await db
            .delete(schemas.reactionRoles)
            .where(eq(schemas.reactionRoles.roleId, r.roleId));
        }
      }
    }
  }
}
