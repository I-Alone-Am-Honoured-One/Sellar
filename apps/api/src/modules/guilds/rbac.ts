export type GuildPermission = "POST" | "LIST" | "MOD" | "MANAGE";

export function hasGuildPermission(userRolePermissions: string[], permission: GuildPermission): boolean {
  if (userRolePermissions.includes("MANAGE")) return true;
  return userRolePermissions.includes(permission);
}

export function guardGuildPermission(userRolePermissions: string[], permission: GuildPermission) {
  if (!hasGuildPermission(userRolePermissions, permission)) {
    throw new Error(`Missing guild permission: ${permission}`);
  }
}
