import "dotenv/config";
import { Client, Partials } from "discord.js";

const client = new Client({
  intents: [
    "GuildMembers",
    "GuildPresences",
    "Guilds",
    "GuildMessages",
    "MessageContent",
    "GuildMessageReactions",
  ],
  partials: [
    Partials.GuildMember,
    Partials.Channel,
    Partials.User,
    Partials.Message,
    Partials.User,
    Partials.Reaction,
  ],
});

export default client;
