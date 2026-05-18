import bossSettings from "../settings/boss.json";

export let counter = 0;
export let threshold = bossSettings.baseThreshold;
export let playerStats = new Map<string, { health: number; atk: number }>();
export let boss: { health: number; atk: number; messageId?: string } | null =
  null;

export function updateCounter(newCounter: number) {
  counter = newCounter;
}

export function setBossStats(health: number, atk: number) {
  boss = { health, atk };
}
export function setBossMessageId(messageId: string) {
  if (boss) {
    boss.messageId = messageId;
  }
}

export function addPlayerStats(userId: string, health: number, atk: number) {
  const stats = { health, atk };
  playerStats.set(userId, stats);
  return stats;
}

export function updatePlayerStats(userId: string, health: number, atk: number) {
  const stats = { health, atk };
  playerStats.set(userId, stats);
}

export function resetBossFight() {
  boss = null;
  counter = 0;
}

export function increaseTriggerThreshold() {
  threshold += bossSettings.thresholdIncrement;
}
