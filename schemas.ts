import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text().notNull(),
  level: int().default(0).notNull(),
  experience: int().default(0).notNull(),
  lastQuizAt: int({ mode: "timestamp" }),
  money: int().default(0).notNull(),
  bank: int().default(0).notNull(),
});

export const rpgStats = sqliteTable("rpgStats", {
  userId: text().notNull(),
  bonusHealth: int().default(100).notNull(),
  // Attack damage is deduced from the level of the user, so we don't need to store it
  // Base health too
  bonusAttack: int().default(0).notNull(),
});

export const forumAccesses = sqliteTable("forumAccesses", {
  userId: text().notNull(),
});

export const warns = sqliteTable("warns", {
  userId: text().notNull(),
  reason: text(),
  moderatorId: text().notNull(),
});

export const quizzes = sqliteTable("quizzes", {
  question: text().notNull(),
  options: text({ mode: "json" }).notNull().$type<string[]>(),
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
  multiplier: int().notNull(),
});

export const profileRoles = sqliteTable("profileRoles", {
  roleId: text().notNull(),
  userId: text().notNull(),
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
  profileRoles,
  warns,
  forumAccesses,
  rpgStats,
};
