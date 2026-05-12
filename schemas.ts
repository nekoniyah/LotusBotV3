import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { defineRelations } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
  userId: text().notNull(),
  level: int().default(0).notNull(),
  experience: int().default(0).notNull(),
  lastQuizAt: int({ mode: "timestamp" }),
  money: int().default(0).notNull(),
});

export const quizzes = sqliteTable("quizzes", {
  question: text().notNull(),
  options: text({ mode: "json" }).notNull(),
  answer: text().notNull(),
});

export const reactionRoles = sqliteTable("reactionRoles", {
  channelId: text().notNull(),
  messageId: text().notNull(),
  roleId: text().notNull(),
  emoji: text().notNull(),
});

export const levelRoles = sqliteTable("levelRoles", {
  level: int().notNull(),
  roleId: text().notNull(),
});

export const stickyRoles = sqliteTable("stickyRoles", {
  roleId: text().notNull(),
});

export const stickyMessages = sqliteTable("stickyMessages", {
  id: int().primaryKey(),
  content: text().notNull(),
  channelId: text().notNull(),
  messageId: text().notNull(),
});

export default {
  profiles,
  quizzes,
  reactionRoles,
  levelRoles,
  stickyRoles,
  stickyMessages,
};
