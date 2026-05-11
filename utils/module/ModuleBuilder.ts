import type { Client, ClientEvents, SlashCommandBuilder } from "discord.js";
import { type TemplateEventListener } from "../typers";
import { addEvent, addSlashCommand } from "./registers";
import type db from "../db";
import client from "../../client";

export class RegisterModule {}

export default abstract class ModuleBuilder<
  Dependencies extends { [key: string]: any } = {
    client: Client;
  },
> {
  constructor(public options: Dependencies & { client: Client }) {
    this.options = options;
  }
}

export function SlashCommand(name: string, description: string) {
  return (
    _1: any,
    _2: string,
    descriptor: TypedPropertyDescriptor<
      (...args: any[]) => SlashCommandBuilder
    >,
  ) => {
    const val = descriptor.value!;
    addSlashCommand(val().setName(name).setDescription(description));
    return descriptor;
  };
}

export function Event<E extends keyof ClientEvents>(event: E) {
  return (
    _1: any,
    _2: string,
    descriptor: TypedPropertyDescriptor<TemplateEventListener<E>>,
  ) => {
    const val = descriptor.value!;
    client.on(event, val);
    return descriptor;
  };
}
