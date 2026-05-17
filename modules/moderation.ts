import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import ModuleBuilder, { SlashCommand } from "../utils/module/ModuleBuilder";

export default class ModerationModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dirname);
  }

  @SlashCommand("ban", "Ban a member with a reason.")
  ban() {
    return new SlashCommandBuilder()
      .addUserOption((u) =>
        u.setName("user").setDescription("User.").setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName("reason").setDescription("Reason of the ban."),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
  }

  @SlashCommand("kick", "Kick a member with a reason.")
  kick() {
    return new SlashCommandBuilder()
      .addUserOption((u) =>
        u.setName("user").setDescription("User.").setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName("reason").setDescription("Reason of the kick"),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
  }

  @SlashCommand("warn", "Warn a member with a reason")
  warn() {
    return new SlashCommandBuilder()
      .addUserOption((u) =>
        u.setName("user").setDescription("User.").setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName("reason").setDescription("Reason of the warn"),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  }

  @SlashCommand("warns", "List warns of a member")
  warns() {
    return new SlashCommandBuilder()
      .addUserOption((u) =>
        u.setName("user").setDescription("User.").setRequired(true),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  }
}
