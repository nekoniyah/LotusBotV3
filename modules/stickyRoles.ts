import {
  GuildMember,
  TextChannel,
  type Message,
  type PartialGuildMember,
} from "discord.js";
import ModuleBuilder, { Event } from "../utils/module/ModuleBuilder";
import db from "../utils/db";
import schemas from "../schemas";
import { and, eq } from "drizzle-orm";

export default class StickyRolesModule extends ModuleBuilder {
  constructor() {
    super(import.meta.dir);
  }

  @Event("guildMemberAdd")
  async giveOldRoles(member: GuildMember) {
    const stickyRoles = db.select().from(schemas.stickyRoles).all();

    const profileRoles = db
      .select()
      .from(schemas.profileRoles)
      .where(eq(schemas.profileRoles.userId, member.user.id))
      .all();

    for (let p of profileRoles) {
      if (stickyRoles.find((s) => s.roleId === p.roleId)) {
        const role = await member.guild.roles.fetch(p.roleId);
        if (role) await member.roles.add(role);
        else {
          await db
            .delete(schemas.stickyRoles)
            .where(eq(schemas.stickyRoles.roleId, p.roleId));
        }
      }
    }
  }

  @Event("guildMemberUpdate")
  async syncRoles(old: GuildMember | PartialGuildMember, member: GuildMember) {
    if (old.roles.cache.size !== member.roles.cache.size) {
      let addedRoles: string[] = [];

      for (let [id] of old.roles.cache) {
        if (!member.roles.cache.has(id)) {
          await db
            .delete(schemas.profileRoles)
            .where(
              and(
                eq(schemas.profileRoles.userId, member.user.id),
                eq(schemas.profileRoles.roleId, id),
              ),
            );
        }
      }

      for (let [id] of member.roles.cache) {
        if (!old.roles.cache.has(id)) {
          addedRoles.push(id);

          await db
            .insert(schemas.profileRoles)
            .values({ roleId: id, userId: member.user.id });
        }
      }
    }
  }
}
