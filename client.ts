import "dotenv/config";
import { Client, Partials } from "discord.js";

const client = new Client({
  intents: ["GuildMembers", "GuildPresences", "Guilds"],
  partials: [Partials.GuildMember, Partials.Channel, Partials.User],
});

export default client;
