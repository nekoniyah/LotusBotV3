import { type ChatInputCommandInteraction } from "discord.js";

export const type = "command";
export const identifier = "ping";

export default async function (
  interaction: ChatInputCommandInteraction,
  { now }: { now: number },
) {
  return `:ping_pong: Pong! ${Date.now() - now}ms latency.`;
}
