import { TextChannel, type ChatInputCommandInteraction } from "discord.js";
import db from "../../utils/db";
import schemas from "../../schemas";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import embeds from "../../utils/embeds";

export const type = "command";
export const identifier = "quiz";
import economy from "../../settings/economy.json";
import LevelingModule from "../leveling";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const profile = db
    .select()
    .from(schemas.profiles)
    .where(eq(schemas.profiles.userId, interaction.user.id))
    .get();

  if (!profile) return;

  const todayDate = dayjs(Date.now());
  const lastDate = dayjs(profile.lastQuizAt);

  if (
    todayDate.date() === lastDate.date() &&
    todayDate.hour() - lastDate.hour() < 3
  ) {
    const err = await embeds.error(
      `You already played a quiz in the last 3 hours.`,
    );

    interaction.reply({ embeds: [err], flags: ["Ephemeral"] });
  } else {
    const quizzes = db.select().from(schemas.quizzes).all();

    if (!quizzes.length) {
      const err = await embeds.error(`No quiz has been created yet :c`);
      interaction.reply({ embeds: [err], flags: ["Ephemeral"] });

      return;
    }

    const amount = 20;

    const embed = await embeds.base();
    embed.setTitle(
      `Guess right and earn ${amount} ${economy.emoji} ${economy.name}`,
    );

    const rdQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]!;

    let formatDesc = `Send a number here corresponding to the right answer.\n\n`;

    let i = 0;
    for (let opt of rdQuiz.options) {
      formatDesc += "`" + `${i}` + "`: " + `${opt}\n`;
      i++;
    }

    embed.setDescription(`**${rdQuiz.question}**\n${formatDesc}`);

    await interaction.editReply({ embeds: [embed] });

    const collector = (
      interaction.channel as TextChannel
    ).createMessageCollector({
      filter: (msg) =>
        msg.author.id === interaction.user.id && !isNaN(parseInt(msg.content)),
    });

    collector.on("collect", async (message) => {
      const index = parseInt(message.content);

      if (
        rdQuiz.options[index]?.toLowerCase() === rdQuiz.answer.toLowerCase()
      ) {
        const member = await interaction.guild!.members.fetch(
          interaction.user.id,
        );
        await db
          .update(schemas.profiles)
          .set({
            money:
              profile.money +
              LevelingModule.applyMultiplierGain(member, amount),
          })
          .where(eq(schemas.profiles.userId, interaction.user.id));

        const embed = await embeds.success("Yes, it's right!");
        embed.setDescription(
          `You earned ${amount} ${economy.emoji} ${economy.name} :D`,
        );

        await message.reply({ embeds: [embed] });
      } else {
        const embed = await embeds.error("Wrong! Try again in 3 hours.");
        await message.reply({ embeds: [embed] });
      }

      collector.stop();
    });
  }
}
