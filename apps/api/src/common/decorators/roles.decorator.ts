import { SetMetadata } from "@nestjs/common";
import { WorkspaceRole } from "../types";

export const WORKSPACE_ROLES_KEY = "workspaceRoles";

/** Restricts a route to specific workspace roles, e.g. @Roles("owner", "admin"). */
export const Roles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
