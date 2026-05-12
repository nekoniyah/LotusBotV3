import { SlashCommandBuilder } from "discord.js";
import ModuleBuilder, { SlashCommand } from "../utils/module/ModuleBuilder";

export default class QuizzesModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @SlashCommand("quiz", "Get a random quiz to guess the right answer")
  answerCommand() {
    return new SlashCommandBuilder();
  }
}
