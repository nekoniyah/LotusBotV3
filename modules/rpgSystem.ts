import { SlashCommandBuilder } from "discord.js";
import ModuleBuilder, { SlashCommand } from "../utils/module/ModuleBuilder";

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
}
