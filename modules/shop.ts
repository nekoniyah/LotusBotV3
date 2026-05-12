import { SlashCommandBuilder } from "discord.js";
import ModuleBuilder, { SlashCommand } from "../utils/module/ModuleBuilder";

export default class ShopModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @SlashCommand("shop", "Open the Shop")
  answerCommand() {
    return new SlashCommandBuilder();
  }
}
