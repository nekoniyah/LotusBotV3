import type { ClientEvents } from "discord.js";

export type TemplateEventListener<Name extends keyof ClientEvents> = (
  ...args: ClientEvents[Name]
) => Promise<void>;

export function TemplateEvent<Name extends keyof ClientEvents>(
  listener: TemplateEventListener<Name>,
) {
  return listener;
}
